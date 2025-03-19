const ethers = require('ethers');
const axios = require('axios');

class DustHarvesterGasEstimator {
    constructor(contractAddress, contractABI, providerUrl) {
        this.contractAddress = contractAddress;
        this.contractABI = contractABI;
        this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
    }

    async estimateGasCost(tokens, amounts, targetToken, account) {
        try {
            // Get current gas prices
            const gasPrices = await this.fetchGasPrices();
            
            // Create contract instance
            const contract = new ethers.Contract(
                this.contractAddress, 
                this.contractABI, 
                this.provider
            );

            // Estimate gas for transaction
            const gasEstimate = await contract.estimateGas.harvestDust(
                tokens, 
                amounts, 
                targetToken, 
                0,
                { from: account }
            );

            // Calculate total gas cost
            const gasCost = {
                standard: this.calculateCost(gasEstimate, gasPrices.standard),
                fast: this.calculateCost(gasEstimate, gasPrices.fast),
                instant: this.calculateCost(gasEstimate, gasPrices.instant)
            };

            return {
                gasEstimate: gasEstimate.toString(),
                gasCost,
                tokenCount: tokens.length
            };
        } catch (error) {
            console.error('Gas estimation error:', error);
            throw error;
        }
    }

    async fetchGasPrices() {
        try {
            // Use multiple gas price sources for reliability
            const [ethGasStation, etherscan] = await Promise.all([
                axios.get('https://ethgasstation.info/api/ethgasAPI.json'),
                axios.get('https://api.etherscan.io/api?module=gastracker&action=gasoracle')
            ]);

            return {
                standard: ethers.utils.parseUnits(
                    (ethGasStation.data.average / 10).toString(), 'gwei'
                ),
                fast: ethers.utils.parseUnits(
                    (ethGasStation.data.fast / 10).toString(), 'gwei'
                ),
                instant: ethers.utils.parseUnits(
                    (etherscan.data.result.SafeGasPrice).toString(), 'gwei'
                )
            };
        } catch {
            // Fallback to provider's gas price
            const gasPrice = await this.provider.getGasPrice();
            return {
                standard: gasPrice,
                fast: gasPrice.mul(2),
                instant: gasPrice.mul(3)
            };
        }
    }

    calculateCost(gasEstimate, gasPrice) {
        // Calculate total cost in ETH and USD
        const weiCost = gasEstimate.mul(gasPrice);
        return {
            wei: weiCost.toString(),
            eth: ethers.utils.formatEther(weiCost),
            usd: this.estimateUSDCost(weiCost)
        };
    }

    async estimateUSDCost(weiCost) {
        try {
            // Fetch current ETH price
            const response = await axios.get(
                'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
            );
            const ethPrice = response.data.ethereum.usd;
            
            // Convert wei to ETH and multiply by current price
            return (parseFloat(ethers.utils.formatEther(weiCost)) * ethPrice).toFixed(2);
        } catch {
            return null; // Price unavailable
        }
    }
}

module.exports = DustHarvesterGasEstimator;