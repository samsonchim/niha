// Create a development test user endpoint
// Add this to your API for easy testing

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create a verified test user for development
router.post('/create-test-user', async (req, res) => {
  try {
    console.log('🧪 Creating test user for development...');
    
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `testuser${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };
    
    // Hash password
    const passwordHash = await bcrypt.hash(testUser.password, 10);
    const referralCode = `test${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Insert user as already verified
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        first_name: testUser.firstName,
        last_name: testUser.lastName,
        email: testUser.email,
        password_hash: passwordHash,
        referral_code: referralCode,
        is_verified: true, // Skip verification
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (userError) {
      throw new Error('Failed to create user: ' + userError.message);
    }
    
    console.log('✅ Test user created:', userData);
    
    // Import HD wallet utilities
    const { createHDWallet, formatWalletsForDB } = require('./utils/hdWallet');
    
    // Create HD wallets for the test user
    console.log('💰 Creating wallets for test user...');
    const hdWallet = createHDWallet();
    const walletsForDB = formatWalletsForDB(userData.id, hdWallet.wallets);
    
    // Insert wallets into database
    const { error: walletError } = await supabase
      .from('crypto_wallets')
      .insert(walletsForDB);
    
    if (walletError) {
      console.error('Wallet creation error:', walletError);
    } else {
      // Create temp seed phrase for testing (normally done during verification)
      const tempSeedPhrase = hdWallet.seedPhrase.join(' ') + '_' + Date.now();
      const encodedSeedPhrase = Buffer.from(tempSeedPhrase).toString('base64');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      
      // Update user to mark wallets as created and add temp seed phrase
      await supabase
        .from('users')
        .update({
          has_crypto_wallets: true,
          wallets_created_at: new Date().toISOString(),
          temp_seed_phrase: encodedSeedPhrase,
          temp_seed_phrase_expires: expiresAt.toISOString(),
          verified_at: new Date().toISOString()
        })
        .eq('id', userData.id);
      
      console.log('✅ Wallets and seed phrase created for test user');
    }
    
    // Return complete test user data
    res.json({
      success: true,
      message: 'Test user created successfully',
      data: {
        user: {
          id: userData.id,
          email: testUser.email,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        credentials: {
          email: testUser.email,
          password: testUser.password
        },
        wallets: hdWallet.wallets,
        instructions: {
          login: `Use email: ${testUser.email} and password: ${testUser.password}`,
          userId: userData.id
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test user: ' + error.message
    });
  }
});

module.exports = router;
