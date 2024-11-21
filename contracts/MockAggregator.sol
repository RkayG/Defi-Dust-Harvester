// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockAggregator {
        function swapTokens(
            address[] calldata tokens,
            uint256[] calldata amounts,
            address targetToken,
            uint256 minReturn,
            address recipient
        ) external returns (uint256) {
            // Simple mock implementation that returns minReturn
            return minReturn;
        }
    }