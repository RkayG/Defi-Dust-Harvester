 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
 
 contract MockToken {
        string public name;
        string public symbol;
        uint8 public decimals;
        uint256 private _totalSupply;
        mapping(address => uint256) private _balances;
        mapping(address => mapping(address => uint256)) private _allowances;

        constructor(string memory _name, string memory _symbol, uint8 _decimals) {
            name = _name;
            symbol = _symbol;
            decimals = _decimals;
        }

        function mint(address account, uint256 amount) external {
            _totalSupply += amount;
            _balances[account] += amount;
        }

        function balanceOf(address account) external view returns (uint256) {
            return _balances[account];
        }

        function transfer(address recipient, uint256 amount) external returns (bool) {
            _balances[msg.sender] -= amount;
            _balances[recipient] += amount;
            return true;
        }

        function approve(address spender, uint256 amount) external returns (bool) {
            _allowances[msg.sender][spender] = amount;
            return true;
        }

        function allowance(address owner, address spender) external view returns (uint256) {
            return _allowances[owner][spender];
        }

        function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
            require(_allowances[sender][msg.sender] >= amount, "ERC20: insufficient allowance");
            _balances[sender] -= amount;
            _balances[recipient] += amount;
            _allowances[sender][msg.sender] -= amount;
            return true;
        }
    }