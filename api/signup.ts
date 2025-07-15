import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const generateVerificationToken = () => uuidv4();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

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
            <h2 style="color:rgb(0, 0, 0);">Welcome to Niha!</h2>
            <p>Hi ${firstName},</p>
            <p>Thanks for signing up for Niha. To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" style="background-color:rgb(0, 0, 0); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
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
}