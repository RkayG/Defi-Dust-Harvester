"use client";

import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Wallet, CreditCard } from 'lucide-react';
import WalletConnectButton from '@/components/ui/WalletConnectButton';

// ABI Placeholders - You'll replace these with your actual contract ABIs
const MOCK_TOKEN_ABI = [
  // ERC20 standard functions
  "function mint(address to, uint256 amount) public",
  "function balanceOf(address account) public view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)"
];

const HARVESTER_CONTRACT_ABI = [
  // Dust harvester contract functions
  "function harvestDust(address[] memory tokens, uint256[] amounts, address targetToken, uint256 minReturn) public"
];

const DustHarvesterWeb3Demo = () => {
  const [web3Modal, setWeb3Modal] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [tokenContracts, setTokenContracts] = useState({});
  const [harvesterContract, setHarvesterContract] = useState(null);
  const [tokenBalances, setTokenBalances] = useState({});
  const [selectedTokens, setSelectedTokens] = useState({});
  const [targetToken, setTargetToken] = useState('');
  const [networkError, setNetworkError] = useState('');
  const [estimatedGasFee, setEstimatedGasFee] = useState(0);
  const [minReturn, setMinReturn] = useState(0);
  const [balancesAray, setBalancesAray] = useState([]);

  // Contract Addresses - Replace with actual contract addresses
  const CONTRACT_ADDRESSES = {
    tokenA: '0x3d3AA16B118a9e805432C0C76Fa8b7FA77CA342e',   //  Token A address on BSC Testnet
    tokenB: '0x7a734F8dA179715Deda4845c604c1D3790aF98F7',   //  Token B address on BSC Testnet
    tokenC: '0x957659ae6D5c171558a3d70f265C200759a41268',   //  Token C address on BSC Testnet
    tokenD: '0x7a85f7Baa8E96aCfD2c2F1d91994a6E3454731b0',  //  Token D address on BSC Testnet
    tokenE: '0x27e5572b88Ad646F03b73c22a493FbE6E1ac6C9f',  //  Token E address on BSC Testnet
    tokenF: '0x372C154c85bC1eb86fb7b9A2867FA2E5C0231234',  //  Token F address on BSC Testnet
    harvester: '0x06906d056683Aa1eDFF8438Bd2CcA6ABf5A5a96e'  // Dust Harvester testnet contract address
  };



  const switchToTestnet = async (ethereum) => {
    const testnetChainId = '0x61'; // BSC Testnet chain ID
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: testnetChainId }]
      });
    } catch (error) {
      // If the network hasn't been added, add it
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: testnetChainId,
              chainName: 'Binance Smart Chain Testnet',
              nativeCurrency: {
                name: 'tBNB',
                symbol: 'tBNB',
                decimals: 18
              },
              rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
              blockExplorerUrls: ['https://testnet.bscscan.com']
            }]
          });
        } catch (error) {
          console.error("Failed to add BSC Testnet", error);
          setNetworkError('Failed to add Binance Smart Chain Testnet');
          return false;
        }
      } else if (switchError.code === 4001) {
        // User rejected the request
        setNetworkError('Please switch to Binance Smart Chain Testnet');
        return false;
      } else {
        console.error("Failed to switch to BSC Testnet", error);
        setNetworkError('Network switch failed');
        return false;
      }
    }
    console.log('success');
    return true;
   
  };

  const handleWalletConnect = async () => {
    try {
      // Ensure Binance Smart Chain Testnet
      if (!window.ethereum) {
        setNetworkError('No Ethereum wallet detected');
        return;
      }

      // Switch to testnet
      const switchSuccess = await switchToTestnet(window.ethereum);
      if (!switchSuccess) return;

      // Clear any previous network errors
      setNetworkError(null);

      // Initialize ethers provider
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      console.log(ethersProvider)
      const ethersSigner = ethersProvider.getSigner();
      console.log(ethersSigner)
      const userAddress = await ethersSigner.getAddress();
      console.log(userAddress)

      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setAddress(userAddress);

      // Initialize token contracts
      const tokens = {};
      const balances = {};
      const tokenPromises = ['tokenA', 'tokenB', 'tokenC'].map(async (tokenKey) => {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESSES[tokenKey], 
          MOCK_TOKEN_ABI, 
          ethersSigner
        );
        tokens[tokenKey] = contract;

        // Fetch initial balances
        const balance = await contract.balanceOf(userAddress);
        balances[tokenKey] = ethers.utils.formatUnits(balance, 18);
      });

      // Wait for all token initializations
      await Promise.all(tokenPromises);

      // Initialize harvester contract
      const harvester = new ethers.Contract(
        CONTRACT_ADDRESSES.harvester,
        HARVESTER_CONTRACT_ABI,
        ethersSigner
      );

      setTokenContracts(tokens);
      setHarvesterContract(harvester);
      setTokenBalances(balances);
      setCurrentStep(1);
    } catch (error) {
      console.log("Wallet connection setup failed", error);
      setNetworkError('Failed to connect wallet');
    }
  };

  const handleWalletDisconnect = () => {
    // Reset all state
    setProvider(null);
    setSigner(null);
    setAddress('');
    setCurrentStep(0);
    setTokenContracts({});
    setHarvesterContract(null);
    setTokenBalances({});
    setSelectedTokens({});
    setTargetToken('');
  };
  
  const mintToken = async (tokenKey, amount) => {
    try {
      if (!signer) return;

      const contract = tokenContracts[tokenKey];
      const tx = await contract.mint(address, ethers.utils.parseUnits(amount.toString(), 18));
      await tx.wait();

      // Fetch and update balance
      const balance = await contract.balanceOf(address);
      setTokenBalances(prev => ({
        ...prev, 
        [tokenKey]: ethers.utils.formatUnits(balance, 18)
      }));

      // Move to next step
      const stepMap = { 
        tokenA: 2, 
        tokenB: 3, 
        tokenC: 4 
      };
      setCurrentStep(stepMap[tokenKey]);
    } catch (error) {
      console.error(`Minting ${tokenKey} failed`, error);
    }
  };

  const harvestTokens = async () => {
    try {
      if (!signer || !harvesterContract) return;
  
      // Ensure signer is connected
      const network = await signer.provider.getNetwork();
      const signerAddress = await signer.getAddress();
  
      // Prepare selected token addresses and balances
      const selectedTokenAddresses = Object.keys(selectedTokens)
        .filter(token => selectedTokens[token])
        .map(token => CONTRACT_ADDRESSES[token]);
  
      const balances = selectedTokenAddresses.map(tokenAddress => {
        const token = Object.keys(CONTRACT_ADDRESSES).find(
          key => CONTRACT_ADDRESSES[key] === tokenAddress
        );
        const balance = tokenBalances[token];
        return ethers.utils.parseUnits(balance.toString(), 18);
      });
  
      // Validate inputs
      if (selectedTokenAddresses.length === 0 || balances.length === 0) {
        throw new Error('No tokens selected for harvesting');
      }
  
      // Approve tokens
      for (let tokenAddress of selectedTokenAddresses) {
        const tokenContract = new ethers.Contract(
          tokenAddress, 
          MOCK_TOKEN_ABI, 
          signer
        );
        console.log('token contract', tokenContract)
        // Check current allowance first
        const allowance = await tokenContract.allowance(
          signerAddress, 
          CONTRACT_ADDRESSES.harvester
        );
  
        const balance = await tokenContract.balanceOf(signerAddress);
        
        console.log(`Token: ${tokenAddress}`);
        console.log(`Current Allowance: ${allowance.toString()}`);
        console.log(`User Balance: ${balance.toString()}`);
  
        // Only approve if current allowance is insufficient
        if (allowance.lt(balance)) {
          const approveTx = await tokenContract.approve(
            CONTRACT_ADDRESSES.harvester, 
            balance  // Approve exact balance instead of MaxUint256
          );
          await approveTx.wait();
          console.log(`Approved ${tokenAddress}`);
        }
      }
  
      // Prepare minimum return
      const targetTokenAddress = CONTRACT_ADDRESSES[targetToken];
      /* const minimumReturnValue = balances.reduce(
        (acc, balance) => acc.sub(estimatedGasFee), 
        balances.reduce((a, b) => a.add(b), ethers.BigNumber.from(0))
      ); */
      minimumReturn();
      // Execute harvest
      const tx = await harvesterContract.harvestDust(
        selectedTokenAddresses,
        balances, 
        targetTokenAddress,
        minReturn
      );
      await tx.wait();
  
      // Update UI to final step
      setCurrentStep(5);
    } catch (error) {
      console.error("Harvesting failed", error);
      // Optionally, add more detailed error handling
      if (error.reason) {
        console.error("Revert Reason:", error.reason);
      }
      if (error.data) {
        console.error("Error Data:", error.data);
      }
    }
  };

  // Add a function to estimate gas for the harvest transaction
  const estimateHarvestGas = async () => {
    try {
      if (!signer || !harvesterContract) {
        console.log('no signer');
        return;
      }
  
      // Prepare selected token addresses
      const selectedTokenAddresses = Object.keys(selectedTokens)
        .filter(token => selectedTokens[token])
        .map(token => CONTRACT_ADDRESSES[token]);
  
      const targetTokenAddress = CONTRACT_ADDRESSES[targetToken];
  
      // Prepare selected token balances
      const balances = Object.keys(selectedTokens)
        .filter(token => selectedTokens[token])
        .map(token => {
          // converting selected tokens' balances
          const balance = tokenBalances[token];
          return ethers.utils.parseUnits(balance.toString(), 18);
        });
      setBalancesAray(balances);

      console.log('Selected Token Addresses:', selectedTokenAddresses);
      console.log('Balances Array:', balances);
  
      // Estimate gas for the harvest transaction
      const gasEstimate = await harvesterContract.estimateGas.harvestDust(
        selectedTokenAddresses,
        balances, 
        targetTokenAddress,
        minReturn
      );
  
      // Get current gas price
      const gasPrice = await provider.getGasPrice();
  
      // Calculate gas fee in ETH
      const gasFeeInEth = ethers.utils.formatEther(gasPrice.mul(gasEstimate));
      console.log('Gas Fee:', gasFeeInEth);
      setEstimatedGasFee(gasFeeInEth);
    } catch (error) {
      console.error("Gas estimation failed", error);
      console.error("Detailed error:", error.reason, error.code, error.message);
      setEstimatedGasFee(null);
    }
  };
  const balances = Object.keys(selectedTokens)
  .filter(token => selectedTokens[token])
  .map(token => {
    // converting selected tokens' balances
    const balance = tokenBalances[token];
    return ethers.utils.parseUnits(balance.toString(), 18);
  });

const minimumReturn = async () => {
  // Use BigNumber methods for precise calculations
  console.log(balancesAray)
  const sumBalance = balancesAray.reduce((acc, balance) => {
    return acc.add(balance);
  }, ethers.BigNumber.from(0));
  console.log(sumBalance);

  // Ensure estimatedGasFee is also a BigNumber
  //const gasFee = ethers.BigNumber.from(estimatedGasFee);
  
  // Subtract gas fee, ensuring no negative value
  /* const miniReturn = sumBalance.gt(estimatedGasFee) 
    ? sumBalance.sub(gasFee) 
    : ethers.BigNumber.from(0);
 */
  const miniReturn = sumBalance

  console.log('mini return', miniReturn);
  setMinReturn(miniReturn);
};

  useEffect(() => {
    if (currentStep === 6) {
      setBalancesAray([]);
      estimateHarvestGas();
      //minimumReturn();
    }
  }, [currentStep, selectedTokens, tokenBalances, targetToken, provider, harvesterContract]);
 
    const steps = [
      // Step 0: Wallet Creation
      {
        title: 'Connect Wallet',
        content: (
          <div className="text-center">
            <Button  
            onClick={handleWalletConnect} 
            
            >
              Connect Wallet
            </Button>  

          {networkError && (
            <div className="text-red-500 text-sm">
              {networkError}
            </div>
          )}
          </div>
        )
      },

      // Step 1: Mint Token A
      {
        title: 'Mint Token A',
        content: (
          <div className="space-y-4">
            <p>Choose amount of Token A to mint:</p>
            {[1, 1.5, 3].map((amount) => (
              <Button 
                key={amount} 
                onClick={() => mintToken('tokenA', amount)}
                className="w-full"
              >
                Mint {amount} Token A
              </Button>
            ))}
          </div>
        )
      },
      // Step 2: Mint Token B
      {
        title: 'Mint Token B',
        content: (
          <div className="space-y-4">
            <p>Choose amount of Token B to mint:</p>
            {[1, 1.5, 3].map((amount) => (
              <Button 
                key={amount} 
                onClick={() => mintToken('tokenB', amount)}
                className="w-full"
              >
                Mint {amount} Token B
              </Button>
            ))}
          </div>
        )
      },
      // Step 3: Mint Token C
      {
        title: 'Mint Token C',
        content: (
          <div className="space-y-4">
            <p>Choose amount of Token C to mint:</p>
            {[1, 1.5, 3].map((amount) => (
              <Button 
                key={amount} 
                onClick={() => mintToken('tokenC', amount)}
                className="w-full"
              >
                Mint {amount} Token C
              </Button>
            ))}
          </div>
        )
      },
      // Step 4: Proceed or Mint More
      {
        title: 'Ready to Harvest?',
        content: (
          <div className="space-y-4">
            <p>Your current token balances:</p>
            <div className="space-y-2">
              {Object.entries(tokenBalances).map(([token, balance]) => (
                <div key={token} className="flex justify-between">
                  <span>{token}</span>
                  <span>{balance}</span>
                </div>
              ))}
            </div>
            <div className="flex space-x-4">
              <Button 
                onClick={() => setCurrentStep(5)} 
                className="w-full"
              >
                Proceed to Harvest
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setCurrentStep(1)} 
                className="w-full"
              >
                Mint More Tokens
              </Button>
            </div>
          </div>
        )
      },
      // Step 5: Token Selection for Harvest
      {
        title: 'Select Tokens to Harvest',
        content: (
          <div className="space-y-4">
            {Object.entries(tokenBalances).map(([token, balance]) => (
              balance > 0 && (
                <div key={token} className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id={token}
                    checked={selectedTokens[token]}
                    onChange={() => setSelectedTokens(prev => ({
                      ...prev, 
                      [token]: !prev[token]
                    }))}
                  />
                  <label htmlFor={token}>
                    {token}: {balance}
                  </label>
                </div>
              )
            ))}
            <div className="mt-4">
              <label htmlFor="targetToken" className="block mb-2">
                Select Target Token for Harvest
              </label>
              <select 
                id="targetToken"
                value={targetToken}
                onChange={(e) => setTargetToken(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Token</option>
                {Object.keys(tokenBalances).map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
            <Button 
              onClick={() => {
                setCurrentStep(6);
               // estimateHarvestGas();
              }}
              disabled={!targetToken || !Object.values(selectedTokens).some(v => v)}
              className="w-full mt-4"
            >
              Proceed to Harvest
            </Button>
          </div>
        )
      },
      
      
      // Step 6: Harvest Confirmation
      {
        
        title: 'Harvest Confirmation',
        content: (
          <div className="space-y-4">
            <p>Tokens to be harvested:</p>
            {Object.entries(selectedTokens)
              .filter(([, selected]) => selected)
              .map(([token]) => (
                <div key={token} className="flex justify-between">
                  <span>{token}</span>
                  <span>{tokenBalances[token]}</span>
                </div>
              ))
            }
            <div className="mt-4">
              <p>Target Token: {targetToken}</p>
              <p className="text-red-500">
                 Estimated Gas Fee: {estimatedGasFee} tBNB
              </p>
            </div>
            <Button 
              onClick={harvestTokens}  // Directly call harvestTokens function here
              className="w-full"
            >
              Confirm Harvest
            </Button>
          </div>
        )
      },
      // Step 7: Final Result
      {
        title: 'Harvest Complete',
        content: (
          <div className="space-y-4 text-center">
            <Check className="mx-auto w-16 h-16 text-green-500" />
            <p>Harvest Successful!</p>
            <div>
              <p>Updated Wallet Balance:</p>
              <div className="space-y-2 mt-2">
                {Object.entries(tokenBalances).map(([token, balance]) => (
                  <div key={token} className="flex justify-between">
                    <span>{token}</span>
                    <span>{token === targetToken ? balance * 3 : 0}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button 
              onClick={() => setCurrentStep(0)} 
              className="w-full"
            >
              Start Over
            </Button>
          </div>
        )
      }
    ];
  

  return (
    <main className=''>
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>{steps[currentStep].title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Additional step rendering logic */}
        {steps[currentStep].content}
      </CardContent>
    </Card>

    <Button onClick={() => setCurrentStep(currentStep - 1)} 
      className='flex justify-self-center mt-6'>
        Back
      </Button>
    </main>
  );
};

export default DustHarvesterWeb3Demo;