const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

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
            <h2 style="color: #00C853;">Welcome to Niha!</h2>
            <p>Hi ${firstName},</p>
            <p>Thanks for signing up for Niha. To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" style="background-color: #00C853; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
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

    // Update user as verified
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

    // Return success page
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
      return res.status(200).json({
        success: true,
        message: 'Virtual account already exists',
        data: {
          accountNumber: existingFiat.virtual_account_number,
          bankName: existingFiat.virtual_account_bank,
          accountName: `${user.first_name} ${user.last_name}`,
          balance: existingFiat.fiat_balance
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

      res.status(200).json({
        success: true,
        message: 'Virtual account created successfully with Flutterwave',
        data: {
          accountNumber: virtualAccount.account_number,
          bankName: virtualAccount.bank_name,
          accountName: `${firstName} ${lastName}`,
          accountReference: virtualAccount.flw_ref,
          balance: 0.00,
          provider: 'Flutterwave'
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

module.exports = router;
