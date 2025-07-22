// Wallet Security Management - Complete Wallet Lifecycle Control
// This handles wallet deactivation, security cleanup, and user protection

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// POST /api/deactivate-wallets - Securely deactivate all user wallets
router.post('/deactivate-wallets', async (req, res) => {
  try {
    const { userId, confirmationPhrase } = req.body;

    // Security confirmation required
    if (confirmationPhrase !== 'PERMANENTLY DEACTIVATE MY WALLETS') {
      return res.status(400).json({
        success: false,
        message: 'Security confirmation phrase required'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log(`🗑️ Deactivating all wallets for user: ${userId}`);

    // 1. Mark all crypto wallets as inactive in database
    const { error: walletError } = await supabase
      .from('crypto_wallets')
      .update({ 
        is_active: false,
        deactivated_at: new Date().toISOString(),
        deactivation_reason: 'User requested permanent deactivation'
      })
      .eq('user_id', userId);

    if (walletError) {
      console.error('Failed to deactivate wallets:', walletError);
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate wallets in database'
      });
    }

    // 2. Clear any temporary seed phrase data
    const { error: userError } = await supabase
      .from('users')
      .update({
        temp_seed_phrase: null,
        temp_seed_phrase_expires: null,
        has_crypto_wallets: false,
        wallets_deactivated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (userError) {
      console.error('Failed to update user wallet status:', userError);
    }

    // 3. Get count of deactivated wallets
    const { data: deactivatedWallets, error: countError } = await supabase
      .from('crypto_wallets')
      .select('coin_symbol')
      .eq('user_id', userId)
      .eq('is_active', false);

    const walletCount = deactivatedWallets ? deactivatedWallets.length : 0;

    console.log(`✅ Successfully deactivated ${walletCount} wallets for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Wallets deactivated successfully',
      data: {
        deactivatedWallets: walletCount,
        deactivatedAt: new Date().toISOString(),
        importantNote: [
          'Your wallet addresses still exist on the blockchain networks',
          'Any funds sent to these addresses can still be recovered with your seed phrase',
          'The addresses are hidden from your app interface but remain mathematically valid',
          'If you have funds in these wallets, transfer them before losing access'
        ],
        securityAdvice: [
          'Keep your seed phrase safe even after deactivation',
          'You can still recover funds with the seed phrase if needed',
          'Monitor these addresses for any unexpected transactions'
        ]
      }
    });

  } catch (error) {
    console.error('Wallet deactivation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/reactivate-wallets - Reactivate wallets with seed phrase verification
router.post('/reactivate-wallets', async (req, res) => {
  try {
    const { userId, seedPhrase } = req.body;

    if (!userId || !seedPhrase) {
      return res.status(400).json({
        success: false,
        message: 'User ID and seed phrase are required'
      });
    }

    // Verify seed phrase format (12 words)
    const seedWords = seedPhrase.trim().split(' ');
    if (seedWords.length !== 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid seed phrase format. Must be exactly 12 words.'
      });
    }

    console.log(`🔄 Attempting to reactivate wallets for user: ${userId}`);

    // Get user's deactivated wallets
    const { data: deactivatedWallets, error: walletError } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', false);

    if (walletError || !deactivatedWallets || deactivatedWallets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No deactivated wallets found for this user'
      });
    }

    // Regenerate wallets from provided seed phrase for verification
    const { generateAllWallets } = require('../utils/hdWallet');
    
    try {
      const regeneratedWallets = generateAllWallets(seedPhrase);
      
      // Verify that regenerated addresses match stored addresses
      let matchCount = 0;
      for (const storedWallet of deactivatedWallets) {
        const regenWallet = regeneratedWallets[storedWallet.coin_symbol];
        if (regenWallet && regenWallet.address === storedWallet.address) {
          matchCount++;
        }
      }

      // Require at least 80% match for security
      const matchPercentage = (matchCount / deactivatedWallets.length) * 100;
      if (matchPercentage < 80) {
        return res.status(403).json({
          success: false,
          message: 'Seed phrase verification failed. Addresses do not match.',
          details: `Only ${matchCount}/${deactivatedWallets.length} addresses matched`
        });
      }

      // Reactivate wallets
      const { error: reactivateError } = await supabase
        .from('crypto_wallets')
        .update({
          is_active: true,
          reactivated_at: new Date().toISOString(),
          deactivated_at: null,
          deactivation_reason: null
        })
        .eq('user_id', userId)
        .eq('is_active', false);

      if (reactivateError) {
        console.error('Failed to reactivate wallets:', reactivateError);
        return res.status(500).json({
          success: false,
          message: 'Failed to reactivate wallets'
        });
      }

      // Update user status
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          has_crypto_wallets: true,
          wallets_reactivated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (userUpdateError) {
        console.error('Failed to update user status:', userUpdateError);
      }

      console.log(`✅ Successfully reactivated ${matchCount} wallets for user ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Wallets reactivated successfully',
        data: {
          reactivatedWallets: matchCount,
          totalWallets: deactivatedWallets.length,
          matchPercentage: Math.round(matchPercentage),
          reactivatedAt: new Date().toISOString()
        }
      });

    } catch (verificationError) {
      console.error('Seed phrase verification error:', verificationError);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify seed phrase'
      });
    }

  } catch (error) {
    console.error('Wallet reactivation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/wallet-security-status/:userId - Check wallet security status
router.get('/wallet-security-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get wallet counts
    const { data: activeWallets, error: activeError } = await supabase
      .from('crypto_wallets')
      .select('coin_symbol, created_at')
      .eq('user_id', userId)
      .eq('is_active', true);

    const { data: deactivatedWallets, error: deactivatedError } = await supabase
      .from('crypto_wallets')
      .select('coin_symbol, deactivated_at, deactivation_reason')
      .eq('user_id', userId)
      .eq('is_active', false);

    // Get user status
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('has_crypto_wallets, wallets_created_at, wallets_deactivated_at, wallets_reactivated_at, temp_seed_phrase_expires')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const activeCount = activeWallets ? activeWallets.length : 0;
    const deactivatedCount = deactivatedWallets ? deactivatedWallets.length : 0;
    const totalWallets = activeCount + deactivatedCount;

    // Check seed phrase access status
    const now = new Date();
    const seedPhraseExpires = user.temp_seed_phrase_expires ? new Date(user.temp_seed_phrase_expires) : null;
    const seedPhraseAccessible = seedPhraseExpires && now < seedPhraseExpires;

    res.status(200).json({
      success: true,
      data: {
        userId,
        walletStatus: {
          active: activeCount,
          deactivated: deactivatedCount,
          total: totalWallets,
          hasWallets: user.has_crypto_wallets
        },
        securityStatus: {
          seedPhraseAccessible,
          seedPhraseExpiresAt: user.temp_seed_phrase_expires,
          canRecoverWallets: deactivatedCount > 0
        },
        timestamps: {
          walletsCreatedAt: user.wallets_created_at,
          walletsDeactivatedAt: user.wallets_deactivated_at,
          walletsReactivatedAt: user.wallets_reactivated_at
        },
        activeWallets: activeWallets ? activeWallets.map(w => ({
          coinSymbol: w.coin_symbol,
          createdAt: w.created_at
        })) : [],
        deactivatedWallets: deactivatedWallets ? deactivatedWallets.map(w => ({
          coinSymbol: w.coin_symbol,
          deactivatedAt: w.deactivated_at,
          reason: w.deactivation_reason
        })) : []
      }
    });

  } catch (error) {
    console.error('Wallet security status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/transfer-and-deactivate - Help user transfer funds before deactivation
router.post('/transfer-and-deactivate', async (req, res) => {
  try {
    const { userId, transferInstructions } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user's active wallets
    const { data: activeWallets, error: walletError } = await supabase
      .from('crypto_wallets')
      .select('coin_symbol, coin_name, network, address')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (walletError || !activeWallets || activeWallets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active wallets found'
      });
    }

    // Create transfer instructions for each wallet
    const transferGuide = activeWallets.map(wallet => ({
      coin: wallet.coin_symbol,
      name: wallet.coin_name,
      network: wallet.network,
      fromAddress: wallet.address,
      instructions: getTransferInstructions(wallet.coin_symbol),
      warningMessage: `⚠️ Transfer all ${wallet.coin_symbol} from ${wallet.address} before deactivating`
    }));

    res.status(200).json({
      success: true,
      message: 'Transfer instructions generated',
      data: {
        walletsToTransfer: activeWallets.length,
        transferGuide,
        importantNotes: [
          '🚨 CRITICAL: Transfer ALL funds before deactivating wallets',
          '💰 Any remaining funds may become difficult to access',
          '📱 Use your seed phrase in a wallet app to make transfers',
          '✅ Verify all transfers are complete before proceeding with deactivation',
          '🔒 Keep your seed phrase safe even after deactivation'
        ],
        nextSteps: [
          '1. Review all wallet addresses above',
          '2. Check each address for any remaining balance',
          '3. Transfer funds to your new addresses or exchanges',
          '4. Wait for all transfers to confirm',
          '5. Only then proceed with wallet deactivation'
        ]
      }
    });

  } catch (error) {
    console.error('Transfer and deactivate error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to provide transfer instructions for different coins
function getTransferInstructions(coinSymbol) {
  const instructions = {
    BTC: {
      walletApps: ['Electrum', 'BlueWallet', 'Exodus'],
      steps: ['Import seed phrase', 'Wait for sync', 'Send to new address', 'Use appropriate fee'],
      networkFee: 'Bitcoin network fees apply'
    },
    ETH: {
      walletApps: ['MetaMask', 'Trust Wallet', 'MyEtherWallet'],
      steps: ['Import seed phrase', 'Select Ethereum network', 'Send ETH', 'Check gas fees'],
      networkFee: 'Ethereum gas fees required'
    },
    USDT: {
      walletApps: ['MetaMask', 'Trust Wallet', 'Atomic Wallet'],
      steps: ['Import seed phrase', 'Ensure you have ETH for gas', 'Send USDT', 'Wait for confirmation'],
      networkFee: 'ETH required for gas fees'
    },
    BNB: {
      walletApps: ['Trust Wallet', 'MetaMask (BSC)', 'Binance Wallet'],
      steps: ['Import seed phrase', 'Switch to BSC network', 'Send BNB', 'Low fees on BSC'],
      networkFee: 'BSC network fees (very low)'
    },
    SOL: {
      walletApps: ['Phantom', 'Solflare', 'Trust Wallet'],
      steps: ['Import seed phrase', 'Select Solana network', 'Send SOL', 'Fast confirmation'],
      networkFee: 'Very low Solana fees'
    }
  };

  return instructions[coinSymbol] || {
    walletApps: ['Trust Wallet', 'Atomic Wallet', 'Exodus'],
    steps: ['Import seed phrase', 'Find the correct network', 'Send funds', 'Verify transaction'],
    networkFee: 'Network fees apply'
  };
}

module.exports = {
  deactivateWallets: router,
  getTransferInstructions
};
