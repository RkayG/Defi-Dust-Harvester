// config.js

const { ethers } = require("ethers");

const networkConfigs = {
  ethereum: {
    aggregator: "0x111111125421cA6dc452d289314280a0f8842A65", // 1inch
    wrappedNative: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    minDustValue: ethers.utils.parseEther("0.01")
  },
  bsc: {
    aggregator: "0x111111125421cA6dc452d289314280a0f8842A65", // 1inch
    wrappedNative: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
    minDustValue: ethers.utils.parseEther("0.05")
  },
  polygon: {
    aggregator: "0x111111125421cA6dc452d289314280a0f8842A65", // 1inch
    wrappedNative: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
    minDustValue: ethers.utils.parseEther("1")
  }
  // ... other networks
};

exports.networkConfigs = networkConfigs;
