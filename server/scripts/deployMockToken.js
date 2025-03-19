// scripts/deploy.js

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    // Deploy six (6) mock tokens for harvest testing 
    const MockToken = await ethers.getContractFactory("MockToken");
    for (let i = 1; i <= 6; i++) {
        const token = await MockToken.deploy(`MockToken${i}}`, `MTK${i}`, 18);
        console.log(`MockToken${i} deployed to:`, token.address);
    } 
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  