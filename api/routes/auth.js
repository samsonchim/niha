const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { createHDWallet, formatWalletsForDB, generateAllWallets, testHDWalletGeneration } = require('../utils/hdWallet');

const router = express.Router();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const generateVerificationToken = () => uuidv4();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/signup
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, referral } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const token = generateVerificationToken();

    const newReferralCode = `${firstName.toLowerCase()}${Math.floor(1000 + Math.random() * 9000)}`;

    const { error: insertError } = await supabase.from('users').insert({
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: passwordHash,
      verification_token: token,
      referral_code: newReferralCode,
      referred_by: referral || null,
      is_verified: false,
      created_at: new Date().toISOString()
    });

    if (insertError) {
      console.error('Database error:', insertError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create account' 
      });
    }

    // Send verification email
    const verifyLink = `${process.env.VERIFY_URL}?token=${token}`;
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Niha Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #000000ff;">Welcome to Niha!</h2>
            <p>Hi ${firstName},</p>
            <p>Thanks for signing up for Niha. To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" style="background-color: #000000ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verifyLink}</p>
            <p>This link will expire in 24 hours.</p>
            <hr style="border: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              If you didn't create an account with Niha, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the signup if email fails
    }

    res.status(200).json({ 
      success: true, 
      message: 'Account created successfully. Check your email to verify.',
      data: { email }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// GET /api/signup - Info about the signup endpoint
router.get('/signup', (req, res) => {
  res.json({
    message: 'Signup endpoint information',
    method: 'This endpoint only accepts POST requests',
    url: 'POST /api/signup',
    requiredFields: ['firstName', 'lastName', 'email', 'password'],
    optionalFields: ['referral'],
    example: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      referral: 'optional_referral_code'
    },
    note: 'Use a tool like Postman, curl, or your React Native app to make POST requests'
  });
});

// GET /api/verify-status - Check if user email is verified
router.get('/verify-status/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check user verification status
    const { data: user, error } = await supabase
      .from('users')
      .select('is_verified, email')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      verified: user.is_verified,
      email: user.email
    });

  } catch (error) {
    console.error('Verify status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/verify - Verify user email with token
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Error - Niha</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #000000;
              color: #ffffff;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              padding: 40px;
              max-width: 500px;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 20px;
            }
            .error {
              color: #FF1744;
            }
            h1 {
              font-size: 2rem;
              margin-bottom: 20px;
              font-weight: 600;
            }
            p {
              font-size: 1.1rem;
              line-height: 1.6;
              color: #bbbbbb;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background-color: #2E2E2E;
              color: #ffffff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 1rem;
              transition: background-color 0.3s;
            }
            .button:hover {
              background-color: #404040;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon error">❌</div>
            <h1>Verification Error</h1>
            <p>Verification token is required. Please check your email for the correct verification link.</p>
            <a href="#" class="button">Back to App</a>
          </div>
        </body>
        </html>
      `);
    }

    // Find user with this token
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, is_verified, verification_token')
      .eq('verification_token', token)
      .single();

    if (findError || !user) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invalid Token - Niha</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #000000;
              color: #ffffff;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              padding: 40px;
              max-width: 500px;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 20px;
            }
            .error {
              color: #FF1744;
            }
            h1 {
              font-size: 2rem;
              margin-bottom: 20px;
              font-weight: 600;
            }
            p {
              font-size: 1.1rem;
              line-height: 1.6;
              color: #bbbbbb;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background-color: #2E2E2E;
              color: #ffffff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 1rem;
              transition: background-color 0.3s;
            }
            .button:hover {
              background-color: #404040;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon error">⚠️</div>
            <h1>Invalid Token</h1>
            <p>This verification link is invalid or has expired. Please request a new verification email.</p>
            <a href="#" class="button">Back to App</a>
          </div>
        </body>
        </html>
      `);
    }

    if (user.is_verified) {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Already Verified - Niha</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #000000;
              color: #ffffff;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              padding: 40px;
              max-width: 500px;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 20px;
            }
            .success {
              color: #00C853;
            }
            h1 {
              font-size: 2rem;
              margin-bottom: 20px;
              font-weight: 600;
            }
            p {
              font-size: 1.1rem;
              line-height: 1.6;
              color: #bbbbbb;
              margin-bottom: 30px;
            }
            .email {
              color: #00C853;
              font-weight: 600;
            }
            .button {
              display: inline-block;
              background-color: #00C853;
              color: #000000;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 1rem;
              transition: background-color 0.3s;
            }
            .button:hover {
              background-color: #00E676;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon success">✅</div>
            <h1>Already Verified</h1>
            <p>Your email <span class="email">${user.email}</span> is already verified. You can continue using your Niha account.</p>
            <a href="#" class="button">Continue to App</a>
          </div>
        </body>
        </html>
      `);
    }

    // Update user as verified and create HD wallets
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_verified: true,
        verification_token: null, // Clear the token
        verified_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Failed - Niha</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #000000;
              color: #ffffff;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              padding: 40px;
              max-width: 500px;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 20px;
            }
            .error {
              color: #FF1744;
            }
            h1 {
              font-size: 2rem;
              margin-bottom: 20px;
              font-weight: 600;
            }
            p {
              font-size: 1.1rem;
              line-height: 1.6;
              color: #bbbbbb;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background-color: #2E2E2E;
              color: #ffffff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 1rem;
              transition: background-color 0.3s;
            }
            .button:hover {
              background-color: #404040;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon error">❌</div>
            <h1>Verification Failed</h1>
            <p>We couldn't verify your email at this time. Please try again or contact support.</p>
            <a href="#" class="button">Back to App</a>
          </div>
        </body>
        </html>
      `);
    }

    // Return success page without wallet generation
    // Wallets will be created during BVN/DVA process instead
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified - Niha</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #000000;
            color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .container {
            text-align: center;
            padding: 40px;
            max-width: 500px;
            animation: fadeIn 0.8s ease-in;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .icon {
            font-size: 5rem;
            margin-bottom: 20px;
            animation: bounce 1.5s ease-in-out;
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          .success {
            color: #00C853;
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            font-weight: 600;
            color: #00C853;
          }
          p {
            font-size: 1.2rem;
            line-height: 1.6;
            color: #bbbbbb;
            margin-bottom: 30px;
          }
          .email {
            color: #00C853;
            font-weight: 600;
          }
          .button {
            display: inline-block;
            background-color: #00C853;
            color: #000000;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(0, 200, 83, 0.3);
          }
          .button:hover {
            background-color: #00E676;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 200, 83, 0.4);
          }
          .niha-logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: #00C853;
            margin-bottom: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="niha-logo">NIHA</div>
          <div class="icon success">🎉</div>
          <h1>Email Verified!</h1>
          <p>Congratulations! Your email <span class="email">${user.email}</span> has been successfully verified.</p>
          <p style="color: #888; font-size: 1rem;">You can now return to the app and continue with your account setup.</p>
          <a href="#" class="button">Continue to App</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Server Error - Niha</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #000000;
            color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .container {
            text-align: center;
            padding: 40px;
            max-width: 500px;
          }
          .icon {
            font-size: 4rem;
            margin-bottom: 20px;
          }
          .error {
            color: #FF1744;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 20px;
            font-weight: 600;
          }
          p {
            font-size: 1.1rem;
            line-height: 1.6;
            color: #bbbbbb;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background-color: #2E2E2E;
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #404040;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon error">🔧</div>
          <h1>Server Error</h1>
          <p>We're experiencing technical difficulties. Please try again later or contact support.</p>
          <a href="#" class="button">Back to App</a>
        </div>
      </body>
      </html>
    `);
  }
});

// GET /api/user-wallets/:userId - Retrieve user's crypto wallet addresses (PUBLIC ONLY)
router.get('/user-wallets/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user's crypto wallets from database
    const { data: wallets, error } = await supabase
      .from('crypto_wallets')
      .select('coin_symbol, coin_name, network, address, derivation_path, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('coin_symbol');

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve wallets'
      });
    }

    // Check if user has wallets
    if (!wallets || wallets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No wallets found for this user',
        hasWallets: false
      });
    }

    // Format wallets for response
    const formattedWallets = wallets.reduce((acc, wallet) => {
      acc[wallet.coin_symbol] = {
        name: wallet.coin_name,
        symbol: wallet.coin_symbol,
        network: wallet.network,
        address: wallet.address,
        createdAt: wallet.created_at
      };
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: 'Wallets retrieved successfully',
      data: {
        wallets: formattedWallets,
        totalWallets: wallets.length,
        supportedCoins: wallets.map(w => w.coin_symbol),
        hasWallets: true
      }
    });

  } catch (error) {
    console.error('Get wallets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/get-seed-phrase - Get seed phrase for newly verified user (ONE TIME ONLY)
router.post('/get-seed-phrase', async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: 'User ID or email is required'
      });
    }

    // Check if user was recently verified and has wallets
    const query = supabase
      .from('users')
      .select('id, email, is_verified, has_crypto_wallets, wallets_created_at, verified_at, temp_seed_phrase, temp_seed_phrase_expires');
    
    if (userId) {
      query.eq('id', userId);
    } else {
      query.eq('email', email);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.is_verified || !user.has_crypto_wallets) {
      return res.status(403).json({
        success: false,
        message: 'User not verified or wallets not created'
      });
    }

    // Check if temporary seed phrase exists and hasn't expired
    const now = new Date();
    const expiresAt = user.temp_seed_phrase_expires ? new Date(user.temp_seed_phrase_expires) : null;
    
    if (!user.temp_seed_phrase || !expiresAt || now > expiresAt) {
      return res.status(403).json({
        success: false,
        message: 'Seed phrase access expired. For security, seed phrases can only be accessed within 10 minutes of verification.',
        note: 'If you need your seed phrase, please contact support or use wallet recovery options.'
      });
    }

    try {
      // Decrypt the temporary seed phrase
      const decryptedData = Buffer.from(user.temp_seed_phrase, 'base64').toString();
      const [seedPhrase, timestamp] = decryptedData.split('_');
      
      // Verify timestamp matches verification time (additional security)
      const verifiedAt = new Date(user.verified_at);
      const seedTimestamp = new Date(parseInt(timestamp));
      const timeDiff = Math.abs(seedTimestamp.getTime() - verifiedAt.getTime()) / 1000 / 60; // minutes
      
      if (timeDiff > 5) { // Allow 5 minute tolerance
        return res.status(403).json({
          success: false,
          message: 'Seed phrase verification failed - timestamp mismatch'
        });
      }
      
      // Format seed phrase for display
      const seedWords = seedPhrase.split(' ');
      
      if (seedWords.length !== 12) {
        return res.status(500).json({
          success: false,
          message: 'Invalid seed phrase format'
        });
      }

      // Clear the temporary seed phrase from database (one-time access)
      await supabase
        .from('users')
        .update({
          temp_seed_phrase: null,
          temp_seed_phrase_expires: null
        })
        .eq('id', user.id);
      
      res.status(200).json({
        success: true,
        message: 'Seed phrase retrieved successfully',
        data: {
          seedPhrase: seedWords,
          warning: 'CRITICAL: Save this seed phrase in a secure location. This is the only time it will be shown.',
          instructions: [
            'Write down these 12 words in the exact order shown',
            'Store them in a secure, offline location',
            'Never share your seed phrase with anyone',
            'You will need these words to recover your wallet',
            'Loss of seed phrase means permanent loss of funds'
          ],
          expiresIn: 'One-time access only'
        }
      });

    } catch (decryptError) {
      console.error('Seed phrase decryption error:', decryptError);
      return res.status(500).json({
        success: false,
        message: 'Failed to decrypt seed phrase'
      });
    }

  } catch (error) {
    console.error('Get seed phrase error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/create-virtual-account - Create dedicated virtual account with Monnify
router.post('/create-virtual-account', async (req, res) => {
  try {
    const { email, bvn, firstName, lastName } = req.body;

    // Validation
    if (!email || !bvn || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: email, bvn, firstName, lastName'
      });
    }

    // Validate BVN format (11 digits)
    if (!/^\d{11}$/.test(bvn)) {
      return res.status(400).json({
        success: false,
        message: 'BVN must be exactly 11 digits'
      });
    }

    // Check if user exists and is verified
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, is_verified')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Check if user already has a fiat account
    const { data: existingFiat, error: fiatCheckError } = await supabase
      .from('fiat')
      .select('virtual_account_number, virtual_account_bank, fiat_balance')
      .eq('user_id', user.id)
      .single();

    if (existingFiat && !fiatCheckError) {
      // Check if user already has crypto wallets 
      const { data: existingWallets } = await supabase
        .from('users')
        .select('has_crypto_wallets')
        .eq('id', user.id)
        .single();
      
      let cryptoWalletsCreated = existingWallets?.has_crypto_wallets || false;
      
      // Always create/regenerate seed phrase when BVN is submitted (for now, until DB columns are added)
      console.log('🔐 Creating/regenerating crypto wallets for existing user:', user.id);
      
      try {
        // Generate HD wallet with seed phrase and all crypto wallets
        const walletData = createHDWallet(); // This creates both seed phrase and wallets
        
        // Store temporary seed phrase (expires in 10 minutes) - try to update if columns exist
        const seedPhraseExpires = new Date();
        seedPhraseExpires.setMinutes(seedPhraseExpires.getMinutes() + 10);
        
        const tempSeedPhrase = Buffer.from(walletData.seedPhrase + '_' + Date.now()).toString('base64');
        
            // Try to update user with crypto wallet flags and temporary seed phrase
            // If temp_seed_phrase columns don't exist, just update has_crypto_wallets
            try {
              const { error: updateUserError } = await supabase
                .from('users')
                .update({
                  has_crypto_wallets: true,
                  wallets_created_at: new Date().toISOString(),
                  temp_seed_phrase: tempSeedPhrase,
                  temp_seed_phrase_expires: seedPhraseExpires.toISOString()
                })
                .eq('id', user.id);

              if (updateUserError) {
                console.log('⚠️ Could not update temp_seed_phrase (columns may not exist), trying without...');
                // Try again without temp seed phrase columns
                const { error: fallbackError } = await supabase
                  .from('users')
                  .update({
                    has_crypto_wallets: true,
                    wallets_created_at: new Date().toISOString()
                  })
                  .eq('id', user.id);
                  
                if (fallbackError) {
                  console.error('Error updating user crypto wallet status:', fallbackError);
                }
              }
            } catch (columnError) {
              console.log('⚠️ Temp seed phrase columns not available, updating basic flags only');
              // Update without temp seed phrase columns
              const { error: basicUpdateError } = await supabase
                .from('users')
                .update({
                  has_crypto_wallets: true,
                  wallets_created_at: new Date().toISOString()
                })
                .eq('id', user.id);
                
              if (basicUpdateError) {
                console.error('Error updating user crypto wallet basic status:', basicUpdateError);
              }
            }

          // Store the seed phrase temporarily in memory/cache for immediate access
          // TODO: Move this to a proper cache/session store when temp_seed_phrase columns are added
          console.log('💾 Seed phrase generated for user:', user.id);
          console.log('🔑 Seed phrase (for immediate access):', walletData.seedPhrase.split(' ').slice(0, 3).join(' ') + '...');

          // Only insert wallets if they don't already exist
          if (!cryptoWalletsCreated) {
            const formattedWallets = formatWalletsForDB(user.id, walletData.wallets);
            
            // Store crypto wallets
            const { error: walletsError } = await supabase
              .from('crypto_wallets')
              .insert(formattedWallets);

            if (walletsError) {
              console.error('Error storing crypto wallets for existing user:', walletsError);
            } else {
              console.log('✅ Crypto wallets created for existing user:', user.id);
            }
          } else {
            console.log('✅ Temp seed phrase regenerated for existing user:', user.id);
          }
          
          cryptoWalletsCreated = true;

        } catch (walletError) {
          console.error('❌ Error creating/regenerating crypto wallets for existing user:', walletError);
        }
      } // Close the existing user section
      
      return res.status(200).json({
        success: true,
        message: 'Virtual account already exists',
        data: {
          userId: user.id,
          accountNumber: existingFiat.virtual_account_number,
          bankName: existingFiat.virtual_account_bank,
          accountName: `${user.first_name} ${user.last_name}`,
          balance: existingFiat.fiat_balance,
          isMockAccount: false,
          cryptoWalletsCreated: cryptoWalletsCreated
        }
      });
    }

    // Check if we should use mock accounts first (skip Flutterwave entirely)
    if (process.env.USE_MOCK_ACCOUNTS === 'true') {
      console.log('Using mock virtual account (USE_MOCK_ACCOUNTS=true)');
      
      const mockAccountNumber = `90${Date.now().toString().slice(-8)}`; // Generate 10-digit account
      const encryptedBVN = Buffer.from(bvn + process.env.BVN_ENCRYPTION_KEY).toString('base64');

      const { data: fiatData, error: insertError } = await supabase
        .from('fiat')
        .insert({
          user_id: user.id,
          bvn_encrypted: encryptedBVN,
          virtual_account_number: mockAccountNumber,
          virtual_account_bank: 'Flutterwave (Mock)',
          virtual_account_reference: `NIHA_MOCK_${user.id}_${Date.now()}`,
          monnify_customer_id: email,
          virtual_accounts: [{
            accountNumber: mockAccountNumber,
            bankName: 'Flutterwave Mock Bank',
            bankCode: '999'
          }],
          fiat_balance: 0.00,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        return res.status(500).json({
          success: false,
          message: 'Failed to save virtual account details'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Mock virtual account created successfully',
        data: {
          userId: user.id,
          accountNumber: mockAccountNumber,
          bankName: 'Flutterwave Mock Bank',
          accountName: `${firstName} ${lastName}`,
          accountReference: `NIHA_MOCK_${user.id}_${Date.now()}`,
          balance: 0.00,
          isMockAccount: true,
          note: 'This is a mock account. Set USE_MOCK_ACCOUNTS=false to use real Flutterwave API.'
        }
      });
    }

    // If not using mock accounts, proceed with real Flutterwave integration
    console.log('Attempting real Flutterwave integration...');

    try {
      // Create dedicated virtual account with Flutterwave
      const accountData = {
        email: email,
        is_permanent: true,
        bvn: bvn,
        tx_ref: `NIHA_${user.id}_${Date.now()}`,
        firstname: firstName,
        lastname: lastName,
        narration: `${firstName} ${lastName} - Niha Virtual Account`
      };

      console.log('Creating Flutterwave virtual account with data:', {
        email: accountData.email,
        firstname: accountData.firstname,
        lastname: accountData.lastname,
        tx_ref: accountData.tx_ref,
        is_permanent: accountData.is_permanent,
        bvn: 'PROVIDED'
      });

      const createAccountResponse = await axios.post(`${process.env.FLUTTERWAVE_BASE_URL}/virtual-account-numbers`, accountData, {
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const accountResult = createAccountResponse.data;
      console.log('Flutterwave API response:', {
        status: accountResult.status,
        message: accountResult.message
      });

      if (accountResult.status !== 'success') {
        console.error('Flutterwave account creation failed:', accountResult);
        return res.status(500).json({
          success: false,
          message: `Failed to create virtual account: ${accountResult.message}`,
          details: accountResult
        });
      }

      const virtualAccount = accountResult.data;

      // Encrypt BVN
      const encryptedBVN = Buffer.from(bvn + process.env.BVN_ENCRYPTION_KEY).toString('base64');

      // Create fiat record with encrypted BVN
      const { data: fiatData, error: insertError } = await supabase
        .from('fiat')
        .insert({
          user_id: user.id,
          bvn_encrypted: encryptedBVN,
          virtual_account_number: virtualAccount.account_number,
          virtual_account_bank: virtualAccount.bank_name,
          virtual_account_reference: virtualAccount.flw_ref,
          monnify_customer_id: email, // Keep field name for compatibility
          virtual_accounts: [{
            accountNumber: virtualAccount.account_number,
            bankName: virtualAccount.bank_name,
            bankCode: virtualAccount.bank_code || '000'
          }],
          fiat_balance: 0.00,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        return res.status(500).json({
          success: false,
          message: 'Failed to save virtual account details'
        });
      }

      // ✨ CREATE CRYPTO WALLETS NOW! ✨
      console.log('🔐 Creating crypto wallets for user:', user.id);
      
      try {
        // Generate HD wallet with seed phrase and all crypto wallets
        const walletData = createHDWallet(); // This creates both seed phrase and wallets
        const formattedWallets = formatWalletsForDB(user.id, walletData.wallets);
        
        // Store temporary seed phrase (expires in 10 minutes)
        const seedPhraseExpires = new Date();
        seedPhraseExpires.setMinutes(seedPhraseExpires.getMinutes() + 10);
        
        const tempSeedPhrase = Buffer.from(walletData.seedPhrase + '_' + Date.now()).toString('base64');
        
        // Update user with crypto wallet flags and temporary seed phrase
        // Handle case where temp_seed_phrase columns don't exist
        try {
          const { error: updateUserError } = await supabase
            .from('users')
            .update({
              has_crypto_wallets: true,
              wallets_created_at: new Date().toISOString(),
              temp_seed_phrase: tempSeedPhrase,
              temp_seed_phrase_expires: seedPhraseExpires.toISOString()
            })
            .eq('id', user.id);

          if (updateUserError) {
            console.log('⚠️ Could not update temp_seed_phrase (columns may not exist), trying without...');
            // Try again without temp seed phrase columns
            const { error: fallbackError } = await supabase
              .from('users')
              .update({
                has_crypto_wallets: true,
                wallets_created_at: new Date().toISOString()
              })
              .eq('id', user.id);
              
            if (fallbackError) {
              console.error('Error updating user crypto wallet status:', fallbackError);
            }
          }
        } catch (columnError) {
          console.log('⚠️ Temp seed phrase columns not available, updating basic flags only');
          // Update without temp seed phrase columns
          const { error: basicUpdateError } = await supabase
            .from('users')
            .update({
              has_crypto_wallets: true,
              wallets_created_at: new Date().toISOString()
            })
            .eq('id', user.id);
            
          if (basicUpdateError) {
            console.error('Error updating user crypto wallet basic status:', basicUpdateError);
          }
        }

        // Store crypto wallets
        const { error: walletsError } = await supabase
          .from('crypto_wallets')
          .insert(formattedWallets.map(wallet => ({
            ...wallet,
            user_id: user.id
          })));

        if (walletsError) {
          console.error('Error storing crypto wallets:', walletsError);
        } else {
          console.log('✅ Crypto wallets created successfully for user:', user.id);
        }

      } catch (walletError) {
        console.error('❌ Error creating crypto wallets:', walletError);
        // Don't fail the whole request, fiat account was created successfully
      }

      res.status(200).json({
        success: true,
        message: 'Virtual account created successfully with Flutterwave',
        data: {
          userId: user.id,
          accountNumber: virtualAccount.account_number,
          bankName: virtualAccount.bank_name,
          accountName: `${firstName} ${lastName}`,
          accountReference: virtualAccount.flw_ref,
          balance: 0.00,
          provider: 'Flutterwave',
          isMockAccount: false,
          cryptoWalletsCreated: true
        }
      });

    } catch (flutterwaveError) {
      console.error('Flutterwave API error:', flutterwaveError.response?.data || flutterwaveError.message);
      return res.status(500).json({
        success: false,
        message: 'Payment service error: ' + (flutterwaveError.response?.data?.message || flutterwaveError.message),
        details: flutterwaveError.response?.data
      });
    }

  } catch (error) {
    console.error('Create virtual account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/fiat-account/:email - Get user's fiat account details
router.get('/fiat-account/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Get user and their fiat account
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id, 
        first_name, 
        last_name, 
        email,
        fiat (
          virtual_account_number,
          virtual_account_bank,
          virtual_account_reference,
          fiat_balance,
          virtual_accounts,
          is_active,
          created_at
        )
      `)
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.fiat || user.fiat.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No fiat account found for this user'
      });
    }

    const fiatAccount = user.fiat[0];

    res.status(200).json({
      success: true,
      data: {
        accountNumber: fiatAccount.virtual_account_number,
        bankName: fiatAccount.virtual_account_bank,
        accountName: `${user.first_name} ${user.last_name}`,
        accountReference: fiatAccount.virtual_account_reference,
        balance: parseFloat(fiatAccount.fiat_balance),
        isActive: fiatAccount.is_active,
        allAccounts: fiatAccount.virtual_accounts,
        createdAt: fiatAccount.created_at
      }
    });

  } catch (error) {
    console.error('Get fiat account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/delete-dva/:accountNumber - Delete/disable a virtual account
router.delete('/delete-dva/:accountNumber', async (req, res) => {
  try {
    const { accountNumber } = req.params;

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Account number is required'
      });
    }

    console.log('Attempting to delete DVA:', accountNumber);

    // Delete the virtual account from Flutterwave
    const deleteResponse = await axios.delete(`${process.env.FLUTTERWAVE_BASE_URL}/virtual-account-numbers/${accountNumber}`, {
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const deleteResult = deleteResponse.data;
    console.log('Flutterwave delete response:', deleteResult);

    if (deleteResult.status === 'success') {
      // Also update the database to mark account as inactive
      const { error: updateError } = await supabase
        .from('fiat')
        .update({ is_active: false })
        .eq('virtual_account_number', accountNumber);

      if (updateError) {
        console.error('Database update error:', updateError);
      }

      res.status(200).json({
        success: true,
        message: 'Virtual account deleted successfully',
        data: deleteResult
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete virtual account',
        details: deleteResult
      });
    }

  } catch (error) {
    console.error('Delete DVA error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting virtual account',
      error: error.response?.data || error.message
    });
  }
});

// GET /api/test-flutterwave - Test Flutterwave connection
router.get('/test-flutterwave', async (req, res) => {
  try {
    console.log('Testing Flutterwave connection with:', {
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY ? `${process.env.FLUTTERWAVE_PUBLIC_KEY.substring(0, 15)}...` : 'NOT_SET',
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY ? `${process.env.FLUTTERWAVE_SECRET_KEY.substring(0, 15)}...` : 'NOT_SET',
      baseUrl: process.env.FLUTTERWAVE_BASE_URL,
      encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY ? 'SET' : 'NOT_SET'
    });

    // Test Flutterwave connection by getting banks
    const banksResponse = await axios.get(`${process.env.FLUTTERWAVE_BASE_URL}/banks/NG`, {
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const banksData = banksResponse.data;

    if (banksData.status !== 'success') {
      return res.status(500).json({
        success: false,
        message: 'Flutterwave connection failed',
        details: banksData
      });
    }

    res.status(200).json({
      success: true,
      message: 'Flutterwave connection successful',
      data: {
        authSuccessful: true,
        banksCount: banksData.data?.length || 0,
        baseUrl: process.env.FLUTTERWAVE_BASE_URL,
        provider: 'Flutterwave'
      }
    });

  } catch (error) {
    console.error('Flutterwave test error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Flutterwave test failed',
      error: error.response?.data || error.message
    });
  }
});

// POST /api/login - Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, is_verified')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is verified
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before signing in',
        needsVerification: true
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user has a fiat account
    const { data: fiatAccount, error: fiatError } = await supabase
      .from('fiat')
      .select('virtual_account_number, virtual_account_bank, fiat_balance, is_active')
      .eq('user_id', user.id)
      .single();

    const hasVirtualAccount = fiatAccount && !fiatError;

    // Successful login response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isVerified: user.is_verified
        },
        hasVirtualAccount,
        virtualAccount: hasVirtualAccount ? {
          accountNumber: fiatAccount.virtual_account_number,
          bankName: fiatAccount.virtual_account_bank,
          balance: parseFloat(fiatAccount.fiat_balance),
          isActive: fiatAccount.is_active
        } : null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/delete-dva/:accountNumber - Delete/disable a virtual account
router.delete('/delete-dva/:accountNumber', async (req, res) => {
  try {
    const { accountNumber } = req.params;

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Account number is required'
      });
    }

    console.log('Attempting to delete/disable DVA:', accountNumber);

    // First, let's try to get the virtual account details to see if it exists
    try {
      const getResponse = await axios.get(`${process.env.FLUTTERWAVE_BASE_URL}/virtual-account-numbers/${accountNumber}`, {
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Virtual account found:', getResponse.data);
      
      // Since DELETE might not be supported, let's try to update/deactivate instead
      try {
        const updateResponse = await axios.put(`${process.env.FLUTTERWAVE_BASE_URL}/virtual-account-numbers/${accountNumber}`, {
          is_active: false
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Flutterwave update response:', updateResponse.data);
        
        // Update the database to mark account as inactive
        const { error: updateError } = await supabase
          .from('fiat')
          .update({ is_active: false })
          .eq('virtual_account_number', accountNumber);

        if (updateError) {
          console.error('Database update error:', updateError);
        }

        res.status(200).json({
          success: true,
          message: 'Virtual account deactivated successfully',
          data: updateResponse.data,
          note: 'Account has been disabled on Flutterwave and in our database'
        });

      } catch (updateError) {
        console.log('Flutterwave update failed:', updateError.response?.data || updateError.message);
        
        // If Flutterwave update fails, just mark as inactive in our database
        const { error: dbUpdateError } = await supabase
          .from('fiat')
          .update({ is_active: false })
          .eq('virtual_account_number', accountNumber);

        if (dbUpdateError) {
          console.error('Database update error:', dbUpdateError);
          return res.status(500).json({
            success: false,
            message: 'Failed to update database'
          });
        }

        res.status(200).json({
          success: true,
          message: 'Virtual account disabled in our system',
          note: 'Account marked as inactive in our database. Flutterwave API does not support deletion/deactivation via API. Contact Flutterwave support for complete removal.',
          flutterwaveError: updateError.response?.data || updateError.message
        });
      }

    } catch (getError) {
      console.log('Account not found on Flutterwave:', getError.response?.data || getError.message);
      
      // Account might not exist on Flutterwave, just update our database
      const { data: dbAccount, error: findError } = await supabase
        .from('fiat')
        .select('virtual_account_number, is_active')
        .eq('virtual_account_number', accountNumber)
        .single();

      if (findError || !dbAccount) {
        return res.status(404).json({
          success: false,
          message: 'Virtual account not found in our database or Flutterwave'
        });
      }

      // Update database
      const { error: updateError } = await supabase
        .from('fiat')
        .update({ is_active: false })
        .eq('virtual_account_number', accountNumber);

      if (updateError) {
        console.error('Database update error:', updateError);
        return res.status(500).json({
          success: false,
          message: 'Failed to update database'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Virtual account disabled in our system',
        note: 'Account not found on Flutterwave but marked as inactive in our database'
      });
    }

  } catch (error) {
    console.error('Delete DVA error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing virtual account deletion',
      error: error.response?.data || error.message
    });
  }
});

// POST /api/deactivate-wallets - Securely deactivate all user wallets
router.post('/deactivate-wallets', async (req, res) => {
  try {
    const { userId, confirmationPhrase } = req.body;

    // Security confirmation required
    if (confirmationPhrase !== 'PERMANENTLY DEACTIVATE MY WALLETS') {
      return res.status(400).json({
        success: false,
        message: 'Security confirmation phrase required. Please type: "PERMANENTLY DEACTIVATE MY WALLETS"'
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
          '🚨 CRITICAL BLOCKCHAIN REALITY:',
          'Your wallet addresses still exist permanently on blockchain networks',
          'Any funds sent to these addresses can still be recovered with your seed phrase',
          'The addresses are hidden from your app interface but remain mathematically valid',
          'If you have funds in these wallets, transfer them before losing access'
        ],
        securityAdvice: [
          'Keep your seed phrase safe even after deactivation',
          'You can still recover funds with the seed phrase if needed',
          'Monitor these addresses for any unexpected transactions',
          'Consider this "hiding" rather than "deleting" your wallets'
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
    const { userId } = req.body;

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
          '🔒 Keep your seed phrase safe even after deactivation',
          '🌐 Remember: Blockchain addresses cannot be truly "deleted"'
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

// DEBUG: Check user wallet status
router.get('/debug-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, is_verified, has_crypto_wallets, wallets_created_at, temp_seed_phrase, temp_seed_phrase_expires')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: userError
      });
    }
    
    // Get crypto wallets count
    const { data: wallets, error: walletsError } = await supabase
      .from('crypto_wallets')
      .select('id, coin_type, wallet_address')
      .eq('user_id', userId);
    
    // Get fiat account
    const { data: fiat, error: fiatError } = await supabase
      .from('fiat')
      .select('virtual_account_number, virtual_account_bank, fiat_balance')
      .eq('user_id', userId)
      .single();
    
    const now = new Date();
    const expiresAt = user.temp_seed_phrase_expires ? new Date(user.temp_seed_phrase_expires) : null;
    const isExpired = expiresAt ? now > expiresAt : true;
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          is_verified: user.is_verified,
          has_crypto_wallets: user.has_crypto_wallets,
          wallets_created_at: user.wallets_created_at,
          temp_seed_phrase_exists: !!user.temp_seed_phrase,
          temp_seed_phrase_expires: user.temp_seed_phrase_expires,
          seed_phrase_expired: isExpired
        },
        crypto_wallets: {
          count: wallets ? wallets.length : 0,
          wallets: wallets || []
        },
        fiat_account: fiat || null,
        current_time: now.toISOString(),
        debug_notes: [
          user.is_verified ? '✅ User is verified' : '❌ User not verified',
          user.has_crypto_wallets ? '✅ Has crypto wallets flag set' : '❌ No crypto wallets flag',
          wallets && wallets.length > 0 ? `✅ ${wallets.length} crypto wallets in DB` : '❌ No crypto wallets in DB',
          user.temp_seed_phrase ? '✅ Temp seed phrase exists' : '❌ No temp seed phrase',
          !isExpired ? '✅ Seed phrase not expired' : '❌ Seed phrase expired or missing'
        ]
      }
    });
    
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// TEST: HD Wallet generation
router.get('/test-hdwallet', (req, res) => {
  try {
    console.log('🧪 Testing HD wallet generation via API...');
    const testResult = testHDWalletGeneration();
    
    res.status(200).json({
      success: true,
      message: 'HD Wallet test completed',
      data: testResult
    });
    
  } catch (error) {
    console.error('❌ HD Wallet test API error:', error);
    res.status(500).json({
      success: false,
      message: 'HD Wallet test failed',
      error: error.message
    });
  }
});

module.exports = router;
