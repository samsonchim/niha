// Blockchain Balance Fetcher for Backend
const axios = require('axios');

class BlockchainBalanceFetcher {
  constructor() {
    // Free API endpoints (no API key required for basic usage)
    this.endpoints = {
      // Bitcoin
      bitcoin: 'https://blockstream.info/api',
      bitcoinBackup: 'https://api.blockcypher.com/v1/btc/main',
      
      // Ethereum (using public endpoints)
      ethereum: 'https://api.etherscan.io/api',
      ethereumBackup: 'https://cloudflare-eth.com',
      
      // Solana
      solana: 'https://api.mainnet-beta.solana.com',
      
      // Price data
      coingecko: 'https://api.coingecko.com/api/v3'
    };
  }

  // Get Bitcoin balance
  async getBitcoinBalance(address) {
    try {
      console.log(`🔍 Fetching Bitcoin balance for: ${address}`);
      
      // Using Blockstream API (free, reliable)
      const response = await axios.get(`${this.endpoints.bitcoin}/address/${address}`);
      const data = response.data;
      
      const balanceInSats = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
      const balanceInBTC = (balanceInSats / 100000000).toFixed(8);
      
      // Get BTC price
      const btcPrice = await this.getCoinPrice('bitcoin');
      const usdValue = (parseFloat(balanceInBTC) * btcPrice).toFixed(2);
      
      return {
        success: true,
        balance: balanceInBTC,
        usdValue: `$${usdValue}`,
        symbol: 'BTC'
      };
    } catch (error) {
      console.error('Bitcoin balance error:', error.message);
      return {
        success: false,
        balance: '0.00000000',
        usdValue: '$0.00',
        error: error.message,
        symbol: 'BTC'
      };
    }
  }

  // Get Ethereum balance
  async getEthereumBalance(address) {
    try {
      console.log(`🔍 Fetching Ethereum balance for: ${address}`);
      
      // Using Cloudflare Ethereum gateway (free)
      const response = await axios.post(this.endpoints.ethereumBackup, {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      });
      
      const balanceInWei = parseInt(response.data.result, 16);
      const balanceInETH = (balanceInWei / 1e18).toFixed(6);
      
      // Get ETH price
      const ethPrice = await this.getCoinPrice('ethereum');
      const usdValue = (parseFloat(balanceInETH) * ethPrice).toFixed(2);
      
      return {
        success: true,
        balance: balanceInETH,
        usdValue: `$${usdValue}`,
        symbol: 'ETH'
      };
    } catch (error) {
      console.error('Ethereum balance error:', error.message);
      return {
        success: false,
        balance: '0.000000',
        usdValue: '$0.00',
        error: error.message,
        symbol: 'ETH'
      };
    }
  }

  // Get Solana balance
  async getSolanaBalance(address) {
    try {
      console.log(`🔍 Fetching Solana balance for: ${address}`);
      
      const response = await axios.post(this.endpoints.solana, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address]
      });
      
      const balanceInLamports = response.data.result.value;
      const balanceInSOL = (balanceInLamports / 1e9).toFixed(6);
      
      // Get SOL price
      const solPrice = await this.getCoinPrice('solana');
      const usdValue = (parseFloat(balanceInSOL) * solPrice).toFixed(2);
      
      return {
        success: true,
        balance: balanceInSOL,
        usdValue: `$${usdValue}`,
        symbol: 'SOL'
      };
    } catch (error) {
      console.error('Solana balance error:', error.message);
      return {
        success: false,
        balance: '0.000000',
        usdValue: '$0.00',
        error: error.message,
        symbol: 'SOL'
      };
    }
  }

  // Get BNB balance (Binance Smart Chain)
  async getBNBBalance(address) {
    try {
      console.log(`🔍 Fetching BNB balance for: ${address}`);
      
      // Using BSC public RPC
      const response = await axios.post('https://bsc-dataseed1.binance.org/', {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      });
      
      const balanceInWei = parseInt(response.data.result, 16);
      const balanceInBNB = (balanceInWei / 1e18).toFixed(6);
      
      // Get BNB price
      const bnbPrice = await this.getCoinPrice('binancecoin');
      const usdValue = (parseFloat(balanceInBNB) * bnbPrice).toFixed(2);
      
      return {
        success: true,
        balance: balanceInBNB,
        usdValue: `$${usdValue}`,
        symbol: 'BNB'
      };
    } catch (error) {
      console.error('BNB balance error:', error.message);
      return {
        success: false,
        balance: '0.000000',
        usdValue: '$0.00',
        error: error.message,
        symbol: 'BNB'
      };
    }
  }

  // Get token balances (USDT, USDC, etc.)
  async getTokenBalance(address, symbol, tokenContract, network = 'ethereum') {
    try {
      console.log(`🔍 Fetching ${symbol} balance for: ${address}`);
      
      const rpcUrl = network === 'ethereum' ? this.endpoints.ethereumBackup : 'https://bsc-dataseed1.binance.org/';
      
      // ERC-20 balanceOf function call
      const response = await axios.post(rpcUrl, {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: tokenContract,
          data: `0x70a08231000000000000000000000000${address.slice(2)}`
        }, 'latest'],
        id: 1
      });
      
      const balance = parseInt(response.data.result, 16);
      const decimals = symbol === 'USDT' || symbol === 'USDC' ? 6 : 18; // USDT/USDC use 6 decimals
      const balanceFormatted = (balance / Math.pow(10, decimals)).toFixed(decimals === 6 ? 2 : 6);
      
      // For stablecoins, USD value is approximately equal to balance
      const usdValue = symbol === 'USDT' || symbol === 'USDC' ? 
        `$${balanceFormatted}` : 
        '$0.00'; // Would need token price lookup for other tokens
      
      return {
        success: true,
        balance: balanceFormatted,
        usdValue,
        symbol
      };
    } catch (error) {
      console.error(`${symbol} balance error:`, error.message);
      return {
        success: false,
        balance: '0.00',
        usdValue: '$0.00',
        error: error.message,
        symbol
      };
    }
  }

  // Get coin price from CoinGecko
  async getCoinPrice(coinId) {
    try {
      const response = await axios.get(`${this.endpoints.coingecko}/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd'
        }
      });
      
      return response.data[coinId]?.usd || 0;
    } catch (error) {
      console.error('Price fetch error:', error.message);
      return 0;
    }
  }

  // Main function to get balance for any wallet
  async getWalletBalance(address, symbol, network = 'mainnet') {
    const symbolUpper = symbol.toUpperCase();
    
    switch (symbolUpper) {
      case 'BTC':
        return await this.getBitcoinBalance(address);
      
      case 'ETH':
        return await this.getEthereumBalance(address);
      
      case 'SOL':
        return await this.getSolanaBalance(address);
      
      case 'BNB':
        return await this.getBNBBalance(address);
      
      case 'USDT':
        if (network.toLowerCase().includes('ethereum')) {
          return await this.getTokenBalance(address, 'USDT', '0xdAC17F958D2ee523a2206206994597C13D831ec7', 'ethereum');
        } else if (network.toLowerCase().includes('bsc')) {
          return await this.getTokenBalance(address, 'USDT', '0x55d398326f99059fF775485246999027B3197955', 'bsc');
        }
        break;
      
      case 'USDC':
        return await this.getTokenBalance(address, 'USDC', '0xA0b86a33E6411a3456d7b9Dc24D66E9f2e7Bb0A4', 'ethereum');
      
      case 'DOGE':
        // Dogecoin would need a specific API implementation
        return {
          success: false,
          balance: '0.00000000',
          usdValue: '$0.00',
          error: 'Dogecoin balance fetching not implemented yet',
          symbol: 'DOGE'
        };
      
      default:
        return {
          success: false,
          balance: '0.00',
          usdValue: '$0.00',
          error: `${symbol} balance fetching not implemented yet`,
          symbol
        };
    }
  }

  // Batch fetch balances for multiple wallets
  async batchFetchBalances(wallets) {
    console.log(`🔄 Batch fetching balances for ${wallets.length} wallets...`);
    
    const results = [];
    
    for (const wallet of wallets) {
      try {
        const result = await this.getWalletBalance(wallet.address, wallet.symbol, wallet.network);
        results.push({
          address: wallet.address,
          symbol: wallet.symbol,
          ...result
        });
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error fetching balance for ${wallet.symbol}:`, error);
        results.push({
          address: wallet.address,
          symbol: wallet.symbol,
          success: false,
          balance: '0.00',
          usdValue: '$0.00',
          error: error.message
        });
      }
    }
    
    return results;
  }
}

module.exports = BlockchainBalanceFetcher;
