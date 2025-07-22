// Wallet Balance Fetcher
// This utility fetches real-time balances for crypto wallets
interface WalletBalance {
  address: string;
  balance: string;
  balanceInUSD: string;
  symbol: string;
  network: string;
}

interface BalanceResponse {
  success: boolean;
  balance: string;
  usdValue: string;
  error?: string;
}

export class WalletBalanceFetcher {
  private static readonly API_KEYS = {
    COINGECKO: 'your-coingecko-api-key', // Free tier available
    MORALIS: process.env.EXPO_PUBLIC_MORALIS_API_KEY,
    ALCHEMY: process.env.EXPO_PUBLIC_ALCHEMY_API_KEY,
  };

  // Get balance for Bitcoin addresses
  static async getBitcoinBalance(address: string): Promise<BalanceResponse> {
    try {
      // Using BlockCypher API (free tier)
      const response = await fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const balanceInBTC = (data.balance / 100000000).toFixed(8); // Convert satoshis to BTC
      const btcPrice = await this.getCoinPrice('bitcoin');
      const usdValue = (parseFloat(balanceInBTC) * btcPrice).toFixed(2);
      
      return {
        success: true,
        balance: balanceInBTC,
        usdValue: `$${usdValue}`
      };
    } catch (error) {
      console.error('Bitcoin balance fetch error:', error);
      return {
        success: false,
        balance: '0.00',
        usdValue: '$0.00',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get balance for Ethereum addresses (including ERC-20 tokens)
  static async getEthereumBalance(address: string, tokenContract?: string): Promise<BalanceResponse> {
    try {
      if (tokenContract) {
        // ERC-20 token balance (USDT, USDC, etc.)
        return await this.getERC20Balance(address, tokenContract);
      }
      
      // ETH balance using Alchemy or Infura
      const response = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${this.API_KEYS.ALCHEMY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1
        })
      });
      
      const data = await response.json();
      const balanceInWei = parseInt(data.result, 16);
      const balanceInETH = (balanceInWei / 1e18).toFixed(6);
      
      const ethPrice = await this.getCoinPrice('ethereum');
      const usdValue = (parseFloat(balanceInETH) * ethPrice).toFixed(2);
      
      return {
        success: true,
        balance: balanceInETH,
        usdValue: `$${usdValue}`
      };
    } catch (error) {
      console.error('Ethereum balance fetch error:', error);
      return {
        success: false,
        balance: '0.00',
        usdValue: '$0.00',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get balance for ERC-20 tokens
  static async getERC20Balance(address: string, tokenContract: string): Promise<BalanceResponse> {
    try {
      const response = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${this.API_KEYS.ALCHEMY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: tokenContract,
            data: `0x70a08231000000000000000000000000${address.slice(2)}`
          }, 'latest'],
          id: 1
        })
      });
      
      const data = await response.json();
      const balance = parseInt(data.result, 16);
      
      // Most tokens use 18 decimals, but you might need to adjust this
      const balanceInTokens = (balance / 1e18).toFixed(6);
      
      return {
        success: true,
        balance: balanceInTokens,
        usdValue: '$0.00' // Would need token price lookup
      };
    } catch (error) {
      console.error('ERC-20 balance fetch error:', error);
      return {
        success: false,
        balance: '0.00',
        usdValue: '$0.00',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get balance for Solana addresses
  static async getSolanaBalance(address: string): Promise<BalanceResponse> {
    try {
      const response = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address]
        })
      });
      
      const data = await response.json();
      const balanceInLamports = data.result.value;
      const balanceInSOL = (balanceInLamports / 1e9).toFixed(6);
      
      const solPrice = await this.getCoinPrice('solana');
      const usdValue = (parseFloat(balanceInSOL) * solPrice).toFixed(2);
      
      return {
        success: true,
        balance: balanceInSOL,
        usdValue: `$${usdValue}`
      };
    } catch (error) {
      console.error('Solana balance fetch error:', error);
      return {
        success: false,
        balance: '0.00',
        usdValue: '$0.00',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get balance for BNB Smart Chain addresses
  static async getBNBBalance(address: string): Promise<BalanceResponse> {
    try {
      const response = await fetch('https://bsc-dataseed.binance.org/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1
        })
      });
      
      const data = await response.json();
      const balanceInWei = parseInt(data.result, 16);
      const balanceInBNB = (balanceInWei / 1e18).toFixed(6);
      
      const bnbPrice = await this.getCoinPrice('binancecoin');
      const usdValue = (parseFloat(balanceInBNB) * bnbPrice).toFixed(2);
      
      return {
        success: true,
        balance: balanceInBNB,
        usdValue: `$${usdValue}`
      };
    } catch (error) {
      console.error('BNB balance fetch error:', error);
      return {
        success: false,
        balance: '0.00',
        usdValue: '$0.00',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get current coin price from CoinGecko
  static async getCoinPrice(coinId: string): Promise<number> {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
      );
      const data = await response.json();
      return data[coinId]?.usd || 0;
    } catch (error) {
      console.error('Price fetch error:', error);
      return 0;
    }
  }

  // Main function to get balance for any wallet
  static async getWalletBalance(address: string, symbol: string, network: string): Promise<BalanceResponse> {
    switch (symbol.toUpperCase()) {
      case 'BTC':
        return await this.getBitcoinBalance(address);
      
      case 'ETH':
        return await this.getEthereumBalance(address);
      
      case 'USDT':
        if (network.toLowerCase().includes('ethereum')) {
          return await this.getERC20Balance(address, '0xdAC17F958D2ee523a2206206994597C13D831ec7');
        }
        // Handle other networks (BSC, Tron, etc.)
        return { success: false, balance: '0.00', usdValue: '$0.00', error: 'Network not supported' };
      
      case 'USDC':
        return await this.getERC20Balance(address, '0xA0b86a33E6411a3456d7b9Dc24D66E9f2e7Bb0A4');
      
      case 'BNB':
        return await this.getBNBBalance(address);
      
      case 'SOL':
        return await this.getSolanaBalance(address);
      
      default:
        return {
          success: false,
          balance: '0.00',
          usdValue: '$0.00',
          error: `${symbol} balance fetching not implemented yet`
        };
    }
  }

  // Batch fetch balances for multiple wallets
  static async batchFetchBalances(wallets: Array<{address: string, symbol: string, network: string}>): Promise<BalanceResponse[]> {
    const promises = wallets.map(wallet => 
      this.getWalletBalance(wallet.address, wallet.symbol, wallet.network)
    );
    
    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('Batch balance fetch error:', error);
      return wallets.map(() => ({
        success: false,
        balance: '0.00',
        usdValue: '$0.00',
        error: 'Batch fetch failed'
      }));
    }
  }
}

export default WalletBalanceFetcher;
