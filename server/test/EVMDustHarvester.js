const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther, parseUnits } = ethers.utils;

describe("EVMDustHarvester", function () {
  let owner, user1, user2;
  let harvester, mockAggregator, mockWNative;
  let mockTokenA, mockTokenB;
  const minDustValue = parseEther("0.01");

  before(async function () {
    this.timeout(120000);
    [owner, user1, user2] = await ethers.getSigners();
   // console.log(owner.address, user1.address, user2.address);

    // Deploy mock contracts
    const MockAggregatorFactory = await ethers.getContractFactory("MockAggregator");
    mockAggregator = await MockAggregatorFactory.deploy();

    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    mockWNative = await MockTokenFactory.deploy("Wrapped Native", "WNATIVE", 18);
    mockTokenA = await MockTokenFactory.deploy("Token A", "TKA", 18);
    mockTokenB = await MockTokenFactory.deploy("Token B", "TKB", 6);

    // Deploy EVMDustHarvester
     const EVMDustHarvester = await ethers.getContractFactory("EVMDustHarvester");
      harvester = await EVMDustHarvester.deploy(
        mockAggregator.address,
        mockWNative.address,
        minDustValue
    ); 
    /* const contractAddress = "0x71357aB18E8c5cC39bb265CD3Bb8e17Bc7D7B65b"; 
    // Get the contract factory 
    const EVMDustHarvester = await ethers.getContractFactory("EVMDustHarvester"); 
    // Attach to the deployed contract 
    const harvester = await EVMDustHarvester.attach(contractAddress); 
    // Now you can interact with the contract 
    console.log("Contract attached at:", harvester.address); 
    // Example interaction: call a function 
    const minDustValue = await harvester.minDustValue(); 
    console.log("Min Dust Value:", minDustValue.toString()); */
   
    //console.log(harvestOwner);
    
    // Configure supported tokens
    await harvester.configureToken(mockWNative.address, true, 18);
    await harvester.configureToken(mockTokenA.address, true, 18);
    await harvester.configureToken(mockTokenB.address, true, 6);

    // Mint tokens to user1
    await mockTokenA.mint(user1.address, parseEther("1000"));
    await mockTokenB.mint(user1.address, parseUnits("1000", 6));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const harvesterOwner = await harvester.owner();
      expect(harvesterOwner).to.equal(owner.address);
    });

    it("Should set the correct initial parameters", async function () {
      expect(await harvester.dexAggregator()).to.equal(mockAggregator.address);
      expect(await harvester.wrappedNative()).to.equal(mockWNative.address);
      expect(await harvester.minDustValue()).to.equal(minDustValue);
    });
  });

  describe("Token Configuration", function () {
    it("Should allow owner to configure tokens", async function () {
      const newToken = await (await ethers.getContractFactory("MockToken"))
        .deploy("New Token", "NEW", 9);
      
      await harvester.configureToken(newToken.address, true, 9);
      
      expect(await harvester.supportedTokens(newToken.address)).to.be.true;
      expect(await harvester.tokenDecimals(newToken.address)).to.equal(9);
    });

    it("Should not allow non-owner to configure tokens", async function () {
      const newToken = await (await ethers.getContractFactory("MockToken"))
        .deploy("New Token", "NEW", 9);
      
      await expect(
        harvester.connect(user1).configureToken(newToken.address, true, 9)
      ).to.be.reverted;
    });
  });

  describe("Dust Harvesting", function () {
    beforeEach(async function () {
      // Approve tokens for harvesting
      await mockTokenA.connect(user1).approve(harvester.address, parseEther("1000"));
      await mockTokenB.connect(user1).approve(harvester.address, parseUnits("1000", 6));
    });

    it("Should successfully harvest dust to target token", async function () {
      const amounts = [parseEther("10"), parseUnits("20", 6)];
      const minReturn = parseEther("1");
  
      const tx = await harvester.connect(user1).harvestDust(
          [mockTokenA.address, mockTokenB.address],
          amounts,
          mockWNative.address,
          minReturn
      );
  
      await tx.wait(); // Ensure transaction is mined
      const receipt = await tx.wait();
    
      // Check transaction status
      expect(receipt.status).to.equal(1)
    });

    it("Should fail when using unsupported tokens", async function () {
      const unsupportedToken = await (await ethers.getContractFactory("MockToken"))
        .deploy("Unsupported", "UNS", 18);

      await expect(
        harvester.connect(user1).harvestDust(
          [unsupportedToken.address],
          [parseEther("10")],
          mockWNative.address,
          parseEther("1")
        )
      ).to.be.revertedWith("Unsupported token");
    });

    it("Should fail when arrays length mismatch", async function () {
      await expect(
        harvester.connect(user1).harvestDust(
          [mockTokenA.address, mockTokenB.address],
          [parseEther("10")],
          mockWNative.address,
          parseEther("1")
        )
      ).to.be.revertedWith("Length mismatch");
    });
  });

  describe("Native Token Harvesting", function () {
    beforeEach(async function () {
      await mockTokenA.connect(user1).approve(harvester.address, parseEther("1000"));
    });

    it("Should successfully harvest to native token", async function () {
      const amount = parseEther("10");
      const minReturn = parseEther("1");

      const tx = await harvester.connect(user1).harvestToNative(
        [mockTokenA.address],
        [amount],
        minReturn
      );

      const receipt = await tx.wait();
    
      // Check transaction status
      expect(receipt.status).to.equal(1)
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update DEX aggregator", async function () {
      const newAggregator = await (await ethers.getContractFactory("MockAggregator")).deploy();
      
      harvester.setDexAggregator(newAggregator.address);
     /*  await expect(harvester.setDexAggregator(newAggregator.address))
        .to.emit(harvester, "AggregatorUpdated")
        .withArgs(newAggregator.address); */
      
      expect(await harvester.dexAggregator()).to.equal(newAggregator.address);
    });

    it("Should allow owner to update minimum dust value", async function () {
      const newMinDustValue = parseEther("0.02");
      await harvester.setMinDustValue(newMinDustValue);
      expect(await harvester.minDustValue()).to.equal(newMinDustValue);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to rescue tokens", async function () {
      // Send some tokens to the contract
      await mockTokenA.mint(harvester.address, parseEther("100"));
      
      const initialBalance = await mockTokenA.balanceOf(owner.address);
      await harvester.rescueTokens(mockTokenA.address, parseEther("100"));
      
      expect(await mockTokenA.balanceOf(owner.address))
        .to.equal(initialBalance.add(parseEther("100")));
    });

    it("Should allow owner to rescue native tokens", async function () {
      // Send some ETH to the contract
      await owner.sendTransaction({
        to: harvester.address,
        value: parseEther("1")
      });

      const initialBalance = await owner.getBalance();
      const tx = await harvester.rescueNative();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed.mul(tx.gasPrice);

      expect(await owner.getBalance())
        .to.equal(initialBalance.add(parseEther("1")).sub(gasCost));
    });
  });
});