require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      /* forking: {
        url: `https://bsc-mainnet.core.chainstack.com/${process.env.CHAINSTACK_API_KEY}`,
        // Use a recent block number, update this to a current BSC block
        //blockNumber: 43056007
      }, */
    },
    alchemy: {
      url: `https://bnb-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIV_KEY]
    },
    /* rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.WEB3_INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIV_KEY],
    }, */
    chainstack: {
      url: `https://bsc-mainnet.core.chainstack.com/${process.env.CHAINSTACK_API_KEY}`,
      accounts: [process.env.PRIV_KEY]
  },
    bscmain_bscrpc: {
      url: `https://bscrpc.com`,
      accounts: [process.env.PRIV_KEY],
    },
    /* bscmain_quicknode: {
      url: `https://weathered-damp-forest.bsc.quiknode.pro/${process.env.QUICKNODE_KEY}/`,
      accounts: [process.env.PRIV_KEY],
    }, */
    bsctest: {
      /* url: `https://bsc-testnet.blockpi.network/v1/rpc/public`, // BSC Testnet URL */
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [process.env.PRIV_KEY, process.env.PRIV_KEY2, process.env.PRIV_KEY3], // Your private key for the test wallet
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_TOKEN,
  },
  solidity: "0.8.20",
};
