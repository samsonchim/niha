const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

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

module.exports = router;
