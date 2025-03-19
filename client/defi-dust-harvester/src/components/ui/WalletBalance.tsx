"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";
import Web3 from 'web3';
import axios from 'axios';

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  usdValue: number;
  tokenPrice: number;
  priceChangePercent: number;
  logoUrl: string;
  address: string;
}

interface WalletBalanceDisplayProps {
  walletAddress: string;
}

const WalletBalanceDisplay: React.FC<WalletBalanceDisplayProps> = ({ walletAddress }) => {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [totalUsdValue, setTotalUsdValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Binance Smart Chain token list
  const TRACKED_TOKENS = [
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      address: '0x0',
      decimals: 18,
      coingeckoId: 'binancecoin',
      logoUrl: 'https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png'
    },
    {
      symbol: 'BUSD',
      name: 'Binance USD',
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      decimals: 18,
      coingeckoId: 'binance-usd',
      logoUrl: 'https://assets.coingecko.com/coins/images/9576/standard/BUSD.png'
    },
    {
      symbol: 'CAKE',
      name: 'PancakeSwap',
      address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      decimals: 18,
      coingeckoId: 'pancakeswap-token',
      logoUrl: 'https://assets.coingecko.com/coins/images/12632/standard/pancakeswap-cake-logo_%281%29.png'
    }
  ];

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 0.01 ? 6 : 2
    }).format(value);
  };

  useEffect(() => {
    const fetchTokenBalances = async () => {
      if (!walletAddress) return;

      setIsLoading(true);
      try {
        // Initialize Web3 with Binance Smart Chain RPC
        const web3 = new Web3(
          new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/')
        );

        // Fetch token balances
        const tokenBalances: TokenBalance[] = await Promise.all(
          TRACKED_TOKENS.map(async (token) => {
            let balance = '0';
            let usdValue = 0;
            let tokenPrice = 0;
            let priceChangePercent = 0;

            // Fetch BNB balance
            if (token.symbol === 'BNB') {
              balance = web3.utils.fromWei(
                await web3.eth.getBalance(walletAddress), 
                'ether'
              );
            } else {
              // Fetch BEP-20 token balance
              const tokenContract = new web3.eth.Contract(
                [
                  {
                    constant: true,
                    inputs: [{ name: "_owner", type: "address" }],
                    name: "balanceOf",
                    outputs: [{ name: "balance", type: "uint256" }],
                    type: "function"
                  }
                ],
                token.address
              );

              const rawBalance = await tokenContract.methods.balanceOf(walletAddress).call();
              balance = web3.utils.fromWei(rawBalance, 'ether');
            }

            // Fetch price data from CoinGecko
            try {
              const priceResponse = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${token.coingeckoId}&vs_currencies=usd&include_24hr_change=true`
              );
              
              const priceData = priceResponse.data[token.coingeckoId];
              tokenPrice = priceData.usd;
              priceChangePercent = priceData.usd_24h_change || 0;
              
              // Calculate USD value
              usdValue = parseFloat(balance) * tokenPrice;
            } catch (priceError) {
              console.error(`Failed to fetch price for ${token.symbol}:`, priceError);
            }

            return {
              ...token,
              balance,
              usdValue,
              tokenPrice,
              priceChangePercent
            };
          })
        );

        // Filter out tokens with zero balance
        const filteredBalances = tokenBalances.filter(
          token => parseFloat(token.balance) >= 0
        );

        // Calculate total USD value
        const totalValue = filteredBalances.reduce(
          (sum, token) => sum + token.usdValue, 
          0
        );

        setBalances(filteredBalances);
        setTotalUsdValue(totalValue);
      } catch (error) {
        console.error('Failed to fetch token balances:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenBalances();
  }, [walletAddress]);

  // Loading skeleton for a single token row
  const TokenSkeleton = () => (
    <div className="p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="text-right min-w-[120px]">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full mt-16 max-w-4xl mx-auto bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3].map((i) => (
            <TokenSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-sm">
      {/* Total Balance Header */}
      <div className="p-6 border-b border-gray-100">
        <p className="text-sm text-gray-500 mb-1">Total Balance</p>
        <h2 className="text-2xl font-semibold">{formatUSD(totalUsdValue)}</h2>
      </div>

      {/* Token List */}
      <div className="divide-y divide-gray-100">
        {balances.map((token) => (
          <div 
            key={token.symbol} 
            className="p-4 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              {/* Token Info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 relative">
                  <Image
                    src={token.logoUrl}
                    alt={token.name}
                    layout="fill"
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{token.symbol}</h3>
                  <p className="text-sm text-gray-500">{token.name}</p>
                </div>
              </div>

              {/* Balance Info */}
              <div className="text-right">
                <div className="font-medium">{formatUSD(token.usdValue)}</div>
                <div className="text-sm text-gray-500">
                  {formatNumber(parseFloat(token.balance))} {token.symbol}
                </div>
              </div>

              {/* Price Info */}
              <div className="text-right min-w-[120px]">
                <div className="font-medium">{formatUSD(token.tokenPrice)}</div>
                <div className={`text-sm flex items-center justify-end gap-1
                  ${token.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {token.priceChangePercent >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(token.priceChangePercent).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletBalanceDisplay;