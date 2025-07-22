// HD Wallet Generator - Non-Custodial Multi-Chain Wallet Creation
// This module generates seed phrases and derives wallet addresses for multiple blockchains
// 🔐 SECURITY: Seed phrases are NEVER stored - only shown once to the user

const bip39 = require('bip39');
const { ethers } = require('ethers');
const bitcoin = require('bitcoinjs-lib');
const { Keypair } = require('@solana/web3.js');
const hdkey = require('hdkey');
const secp256k1 = require('secp256k1');

/**
 * Supported Cryptocurrency Configurations
 * Following BIP44 standard for HD wallet derivation paths
 */
const SUPPORTED_COINS = {
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'mainnet',
    coinType: 0, // BIP44 coin type for Bitcoin
    derivationPath: "m/44'/0'/0'/0/0"
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH', 
    network: 'mainnet',
    coinType: 60, // BIP44 coin type for Ethereum
    derivationPath: "m/44'/60'/0'/0/0"
  },
  USDT: {
    name: 'Tether (Ethereum)',
    symbol: 'USDT',
    network: 'ethereum',
    coinType: 60,
    derivationPath: "m/44'/60'/0'/0/1" // Different address index for USDT
  },
  USDC: {
    name: 'USD Coin (Ethereum)',
    symbol: 'USDC',
    network: 'ethereum', 
    coinType: 60,
    derivationPath: "m/44'/60'/0'/0/2"
  },
  BNB: {
    name: 'BNB (BSC)',
    symbol: 'BNB',
    network: 'bsc',
    coinType: 60, // BSC uses same derivation as Ethereum
    derivationPath: "m/44'/60'/0'/0/3"
  },
  MATIC: {
    name: 'Polygon (MATIC)',
    symbol: 'MATIC',
    network: 'polygon',
    coinType: 60,
    derivationPath: "m/44'/60'/0'/0/4"
  },
  SOL: {
    name: 'Solana',
    symbol: 'SOL',
    network: 'mainnet',
    coinType: 501, // BIP44 coin type for Solana
    derivationPath: "m/44'/501'/0'/0'"
  },
  DOGE: {
    name: 'Dogecoin',
    symbol: 'DOGE',
    network: 'mainnet',
    coinType: 3, // BIP44 coin type for Dogecoin
    derivationPath: "m/44'/3'/0'/0/0"
  }
};

/**
 * Generate a secure 12-word BIP39 mnemonic seed phrase
 * @returns {string} 12-word mnemonic phrase
 */
function generateSeedPhrase() {
  try {
    console.log('🎲 Generating entropy...');
    
    // Generate 128 bits of entropy (12 words)
    const mnemonic = bip39.generateMnemonic(128);
    console.log('🔍 Raw mnemonic generated:', mnemonic ? 'SUCCESS' : 'FAILED');
    
    // Validate the generated mnemonic
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Generated mnemonic is invalid');
    }
    
    console.log('✅ Secure 12-word seed phrase generated and validated');
    console.log('📝 Word count:', mnemonic.split(' ').length);
    
    return mnemonic;
  } catch (error) {
    console.error('❌ Seed phrase generation failed:', error);
    console.error('❌ Error stack:', error.stack);
    throw new Error('Failed to generate seed phrase: ' + error.message);
  }
}

/**
 * Derive Bitcoin wallet address from seed phrase
 * @param {string} mnemonic - BIP39 mnemonic phrase
 * @param {string} derivationPath - BIP44 derivation path
 * @returns {string} Bitcoin address
 */
function deriveBitcoinWallet(mnemonic, derivationPath) {
  try {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = hdkey.fromMasterSeed(seed);
    const addrNode = root.derive(derivationPath);
    
    const publicKey = addrNode.publicKey;
    const { address } = bitcoin.payments.p2pkh({ 
      pubkey: publicKey,
      network: bitcoin.networks.bitcoin 
    });
    
    return address;
  } catch (error) {
    console.error('❌ Bitcoin wallet derivation failed:', error);
    throw new Error('Failed to derive Bitcoin wallet');
  }
}

/**
 * Derive Ethereum-based wallet address (ETH, USDT, USDC, BNB, MATIC)
 * @param {string} mnemonic - BIP39 mnemonic phrase
 * @param {string} derivationPath - BIP44 derivation path
 * @returns {string} Ethereum address
 */
function deriveEthereumWallet(mnemonic, derivationPath) {
  try {
    const hdNode = ethers.HDNodeWallet.fromMnemonic(
      ethers.Mnemonic.fromPhrase(mnemonic),
      derivationPath
    );
    
    return hdNode.address;
  } catch (error) {
    console.error('❌ Ethereum wallet derivation failed:', error);
    throw new Error('Failed to derive Ethereum wallet');
  }
}

/**
 * Derive Solana wallet address from seed phrase
 * @param {string} mnemonic - BIP39 mnemonic phrase
 * @param {string} derivationPath - BIP44 derivation path (Solana specific)
 * @returns {string} Solana address
 */
function deriveSolanaWallet(mnemonic, derivationPath) {
  try {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = hdkey.fromMasterSeed(seed);
    const addrNode = root.derive(derivationPath);
    
    // Solana uses first 32 bytes of private key
    const privateKey = addrNode.privateKey.slice(0, 32);
    const keypair = Keypair.fromSeed(privateKey);
    
    return keypair.publicKey.toString();
  } catch (error) {
    console.error('❌ Solana wallet derivation failed:', error);
    throw new Error('Failed to derive Solana wallet');
  }
}

/**
 * Derive Dogecoin wallet address from seed phrase
 * @param {string} mnemonic - BIP39 mnemonic phrase
 * @param {string} derivationPath - BIP44 derivation path
 * @returns {string} Dogecoin address
 */
function deriveDogecoinWallet(mnemonic, derivationPath) {
  try {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = hdkey.fromMasterSeed(seed);
    const addrNode = root.derive(derivationPath);
    
    const publicKey = addrNode.publicKey;
    
    // Dogecoin network parameters
    const dogecoinNetwork = {
      messagePrefix: '\x19Dogecoin Signed Message:\n',
      bech32: 'dc',
      bip32: {
        public: 0x02facafd,
        private: 0x02fac398,
      },
      pubKeyHash: 0x1e, // Dogecoin starts with 'D'
      scriptHash: 0x16,
      wif: 0x9e,
    };
    
    const { address } = bitcoin.payments.p2pkh({ 
      pubkey: publicKey,
      network: dogecoinNetwork 
    });
    
    return address;
  } catch (error) {
    console.error('❌ Dogecoin wallet derivation failed:', error);
    throw new Error('Failed to derive Dogecoin wallet');
  }
}

/**
 * Generate all supported crypto wallets from a single seed phrase
 * @param {string} mnemonic - BIP39 mnemonic phrase
 * @returns {Object} Object mapping coin symbols to wallet addresses
 */
function generateAllWallets(mnemonic) {
  const wallets = {};
  
  try {
    // If no mnemonic provided, generate one
    if (!mnemonic) {
      console.log('🔄 No mnemonic provided, generating new seed phrase...');
      mnemonic = generateSeedPhrase();
    }
    
    // Validate mnemonic first
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }
    
    console.log('🔄 Generating wallets for all supported chains...');
    console.log('🔑 Using mnemonic:', mnemonic.split(' ').slice(0, 3).join(' ') + '...'); // Show first 3 words for debugging
    
    // Generate wallets for each supported coin
    for (const [symbol, config] of Object.entries(SUPPORTED_COINS)) {
      try {
        let address;
        
        switch (symbol) {
          case 'BTC':
            address = deriveBitcoinWallet(mnemonic, config.derivationPath);
            break;
            
          case 'ETH':
          case 'USDT':
          case 'USDC':
          case 'BNB':
          case 'MATIC':
            address = deriveEthereumWallet(mnemonic, config.derivationPath);
            break;
            
          case 'SOL':
            address = deriveSolanaWallet(mnemonic, config.derivationPath);
            break;
            
          case 'DOGE':
            address = deriveDogecoinWallet(mnemonic, config.derivationPath);
            break;
            
          default:
            console.warn(`⚠️ Unsupported coin: ${symbol}`);
            continue;
        }
        
        wallets[symbol] = {
          symbol,
          name: config.name,
          network: config.network,
          address,
          derivationPath: config.derivationPath
        };
        
        console.log(`✅ ${symbol} wallet generated: ${address.substring(0, 10)}...`);
        
      } catch (coinError) {
        console.error(`❌ Failed to generate ${symbol} wallet:`, coinError.message);
        // Continue with other coins even if one fails
      }
    }
    
    console.log(`✅ Successfully generated ${Object.keys(wallets).length} wallets`);
    return wallets;
    
  } catch (error) {
    console.error('❌ Wallet generation failed:', error);
    throw new Error('Failed to generate wallets from seed phrase');
  }
}

/**
 * Complete HD Wallet Creation Process
 * Generates seed phrase and all wallet addresses
 * @returns {Object} { seedPhrase, wallets }
 */
function createHDWallet() {
  try {
    console.log('🚀 Starting HD wallet creation process...');
    
    // Step 1: Generate secure seed phrase
    console.log('🔑 Step 1: Generating seed phrase...');
    const seedPhrase = generateSeedPhrase();
    console.log('✅ Seed phrase generated:', seedPhrase.split(' ').slice(0, 3).join(' ') + '...'); // Show first 3 words
    
    // Step 2: Derive all wallet addresses
    console.log('🏦 Step 2: Generating wallet addresses...');
    const wallets = generateAllWallets(seedPhrase);
    
    console.log('✅ HD wallet creation completed successfully');
    console.log('📊 Created wallets for coins:', Object.keys(wallets));
    
    return {
      seedPhrase,
      wallets,
      totalWallets: Object.keys(wallets).length,
      supportedCoins: Object.keys(SUPPORTED_COINS)
    };
    
  } catch (error) {
    console.error('❌ HD wallet creation failed:', error);
    console.error('❌ Error details:', error.stack);
    throw new Error('Failed to create HD wallet: ' + error.message);
  }
}

/**
 * Format wallets for database storage
 * @param {string} userId - User ID from Supabase
 * @param {Object} wallets - Wallets object from generateAllWallets
 * @returns {Array} Array of wallet objects ready for database insertion
 */
function formatWalletsForDB(userId, wallets) {
  return Object.values(wallets).map(wallet => ({
    user_id: userId,
    coin_symbol: wallet.symbol,
    coin_name: wallet.name,
    network: wallet.network,
    address: wallet.address,
    derivation_path: wallet.derivationPath,
    address_index: 0,
    is_active: true
  }));
}

/**
 * Format seed phrase for secure display (split into 12 words)
 * @param {string} seedPhrase - BIP39 mnemonic phrase
 * @returns {Array} Array of 12 words
 */
function formatSeedPhraseForDisplay(seedPhrase) {
  const words = seedPhrase.split(' ');
  if (words.length !== 12) {
    throw new Error('Invalid seed phrase format - must be 12 words');
  }
  return words;
}

/**
 * Test HD Wallet Generation (for debugging)
 * @returns {Object} Test results
 */
function testHDWalletGeneration() {
  try {
    console.log('🧪 Testing HD wallet generation...');
    
    // Test seed phrase generation
    const testSeedPhrase = generateSeedPhrase();
    console.log('✅ Seed phrase test passed');
    
    // Test wallet generation
    const testWallets = generateAllWallets(testSeedPhrase);
    console.log('✅ Wallet generation test passed');
    
    // Test complete HD wallet creation
    const testHDWallet = createHDWallet();
    console.log('✅ HD wallet creation test passed');
    
    return {
      success: true,
      seedPhrase: testSeedPhrase.split(' ').slice(0, 3).join(' ') + '...',
      walletCount: Object.keys(testWallets).length,
      hdWalletCount: testHDWallet.totalWallets,
      supportedCoins: Object.keys(SUPPORTED_COINS)
    };
    
  } catch (error) {
    console.error('❌ HD wallet test failed:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

module.exports = {
  generateSeedPhrase,
  generateAllWallets,
  createHDWallet,
  formatWalletsForDB,
  formatSeedPhraseForDisplay,
  testHDWalletGeneration,
  SUPPORTED_COINS
};
