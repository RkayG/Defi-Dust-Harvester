const { ethers } = require("hardhat");
const { networkConfigs } = require("../config.js");
const { supportedTokens } = require("../supportedTokensBSC.js");

async function main() {
  // Get the network name from hardhat
  const network = "bsc"
  
  // Get network specific configuration
  const config = networkConfigs[network];
  if (!config) {
    throw new Error(`No configuration found for network: ${network}`);
  }

  console.log("Deploying EVMDustHarvester to", network);
  console.log("Using configuration:");
  console.log("- DEX Aggregator:", config.aggregator);
  console.log("- Wrapped Native:", config.wrappedNative);
  console.log("- Min Dust Value:", config.minDustValue.toString());

  // Get contract factory
  const EVMDustHarvester = await ethers.getContractFactory("EVMDustHarvester");

  // Deploy contract
  const harvester = await EVMDustHarvester.deploy(
    config.aggregator,
    config.wrappedNative,
    config.minDustValue
  );

  await harvester.deployed();
  console.log("EVMDustHarvester deployed to:", harvester.address);

  // Wait for a few blocks for better reliability
  console.log("Waiting for deployment to settle...");
  await ethers.provider.waitForTransaction(harvester.deployTransaction.hash, 5);

  // Configure initial supported tokens
  if (supportedTokens) {
    console.log("Configuring initial supported tokens...");
    
    for (const token of supportedTokens) {
      console.log(`Configuring token ${token}...`);
      await harvester.configureToken(
        token,
        true,
        18
      );
    }
  }

  console.log("\nDeployment completed!");
  console.log("Contract address:", harvester.address);
  
  // Verify contract on Etherscan if API key is available
  /* if (process.env.ETHERSCAN_API_KEY) {
    console.log("\nVerifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: harvester.address,
        constructorArguments: [
          config.aggregator,
          config.wrappedNative,
          config.minDustValue
        ],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.error("Error verifying contract:", error);
    }
  } */
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });