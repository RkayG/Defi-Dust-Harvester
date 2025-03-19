// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface INetworkDEXAggregator {
    function swapTokens(
        address[] calldata tokens,
        uint256[] calldata amounts,
        address targetToken,
        uint256 minReturn,
        address recipient
    ) external returns (uint256);
}

contract EVMDustHarvester is Ownable(msg.sender), ReentrancyGuard {
    // Network specific configurations
    struct NetworkConfig {
        address dexAggregator;
        address wrappedNative;
        uint256 minDustValue;
        mapping(address => bool) supportedTokens;
    }

    // Current network configuration
    address public dexAggregator;
    address public wrappedNative;
    uint256 public minDustValue;
    
    // Token support and configuration
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256) public tokenDecimals;

    // Events
    event DustHarvested(
        address indexed user,
        address[] tokens,
        uint256[] amounts,
        address targetToken,
        uint256 returnAmount
    );
    event TokenConfigured(address indexed token, bool supported, uint8 decimals);
    event AggregatorUpdated(address indexed newAggregator);

    constructor(
        address _dexAggregator,
        address _wrappedNative,
        uint256 _minDustValue
    ) {
        dexAggregator = _dexAggregator;
        wrappedNative = _wrappedNative;
        minDustValue = _minDustValue;
    }

    // Main dust harvesting function
    function harvestDust(
        address[] calldata tokens,
        uint256[] calldata amounts,
        address targetToken,
        uint256 minReturn
    ) public nonReentrant returns (uint256) {
        require(tokens.length == amounts.length, "Length mismatch");
        require(tokens.length > 0, "No tokens provided");
        require(supportedTokens[targetToken], "Unsupported target token");

        // Transfer and approve tokens
        for(uint i = 0; i < tokens.length; i++) {
            require(supportedTokens[tokens[i]], "Unsupported token");
            
            IERC20 token = IERC20(tokens[i]);
            require(
                token.transferFrom(msg.sender, address(this), amounts[i]),
                "Transfer failed"
            );
            
            if(token.allowance(address(this), dexAggregator) < amounts[i]) {
                token.approve(dexAggregator, type(uint256).max);
            }
        }

        // Execute swap through aggregation router
        uint256 returnAmount = INetworkDEXAggregator(dexAggregator).swapTokens(
            tokens,
            amounts,
            targetToken,
            minReturn,
            msg.sender  // Direct return to user
        );

        emit DustHarvested(msg.sender, tokens, amounts, targetToken, returnAmount);
        return returnAmount;
    }

    // Native token handling
    receive() external payable {
        // Handle native token receipts
    }

    function harvestToNative(
        address[] calldata tokens,
        uint256[] calldata amounts,
        uint256 minReturn
    ) external returns (uint256) {
        return harvestDust(tokens, amounts, wrappedNative, minReturn);
    }

    // Admin functions
    function setDexAggregator(address _dexAggregator) external onlyOwner {
        require(_dexAggregator != address(0), "Invalid address");
        dexAggregator = _dexAggregator;
        emit AggregatorUpdated(_dexAggregator);
    }

    function configureToken(
        address token,
        bool supported,
        uint8 decimals
    ) external onlyOwner {
        supportedTokens[token] = supported;
        tokenDecimals[token] = decimals;
        emit TokenConfigured(token, supported, decimals);
    }

    function setMinDustValue(uint256 _minDustValue) external onlyOwner {
        minDustValue = _minDustValue;
    }

    // Emergency functions
    function rescueTokens(
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }

    function rescueNative() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}