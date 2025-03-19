"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, AlertTriangle } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import WalletBalanceDisplay from './WalletBalance';

interface WalletConnectButtonProps {
  onConnect?: () => Promise<void>;
  onDisconnect?: () => Promise<void>;
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  onConnect,
  onDisconnect
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Binance Chain Wallet or MetaMask is installed
    const checkWalletConnection = async () => {
      let provider = window.BinanceChain || window.ethereum;
      
      if (provider) {
        try {
          // Check if already connected
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // Check network
            const chainId = await provider.request({ method: 'eth_chainId' });
            if (chainId !== '0x38') { // Binance Smart Chain Mainnet
              setConnectionError('Please connect to Binance Smart Chain');
              return;
            }

            setWalletAddress(accounts[0]);
            setIsConnected(true);
            setConnectionError(null);
          }
        } catch (error) {
          console.error('Connection check failed:', error);
          setConnectionError('Failed to check wallet connection');
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } else {
        setIsConnected(false);
        setWalletAddress('');
      }
    };

    // Add event listener for account changes
    if (window.BinanceChain) {
      window.BinanceChain.on('accountsChanged', handleAccountsChanged);
    } else if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      // Remove event listener
      if (window.BinanceChain) {
        window.BinanceChain.removeListener('accountsChanged', handleAccountsChanged);
      } else if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleConnect = async () => {
    try {
      // Determine which provider to use
      let provider = window.BinanceChain || window.ethereum;
      
      if (!provider) {
        setConnectionError('No Web3 wallet detected. Please install MetaMask or Binance Chain Wallet.');
        return;
      }

      setIsConnecting(true);
      setConnectionError(null);
      
      // Request account access
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });

      // Check network and switch if needed
      const chainId = await provider.request({ method: 'eth_chainId' });
      if (chainId !== '0x38') { // Binance Smart Chain Mainnet
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }]
          });
        } catch (switchError: any) {
          // If the network hasn't been added, add it
          if (switchError.code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x38',
                chainName: 'Binance Smart Chain Mainnet',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18
                },
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com/']
              }]
            });
          } else {
            throw switchError;
          }
        }
      }

      if (onConnect) {
        await onConnect();
      }

      // Set wallet address
      setWalletAddress(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setConnectionError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (onDisconnect) {
        await onDisconnect();
      }
      setIsConnected(false);
      setWalletAddress('');
      setConnectionError(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  const openExplorer = () => {
    window.open(`https://bscscan.com/address/${walletAddress}`, '_blank');
  };

  if (connectionError) {
    return (
      <div className="flex items-center justify-self-center text-red-600 my-16">
        <AlertTriangle className="w-5 h-5 mr-2" />
        <span>{connectionError}</span>
        <Button 
          onClick={handleConnect} 
          variant="outline" 
          className="ml-2"
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-yellow-600 flex justify-self-center my-16 hover:bg-yellow-700 text-white font-semibold px-6 py-2 rounded-lg"
      >
        <Wallet className="w-5 h-5 mr-2" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <div className='flex flex-col justify-self-center my-16 space-y-4'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
          >
            <Wallet className="w-5 h-5 mr-2" />
            {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-72">
          <div className="px-4 py-2">
            <p className="text-sm font-medium">Connected Wallet</p>
            <p className="text-xs text-gray-500">{walletAddress}</p>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={openExplorer} className="cursor-pointer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleDisconnect}
            className="text-red-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {walletAddress && (
        <WalletBalanceDisplay walletAddress={walletAddress} />
      )}
    </div>
  );
};

export default WalletConnectButton;