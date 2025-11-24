-- Create profiles table for Supabase auth
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  dva_account_number TEXT,
  dva_bank_name TEXT,
  dva_account_name TEXT,
  usdc_address TEXT,
  erc20_address TEXT,
  fiat_balance DECIMAL(15,2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crypto_balances table
CREATE TABLE IF NOT EXISTS crypto_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  symbol TEXT NOT NULL,
  amount DECIMAL(36,18) DEFAULT 0,
  fiat_value DECIMAL(36,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table to record credits/debits (used by webhooks)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT CHECK (type IN ('credit','debit')) NOT NULL,
  amount DECIMAL(36,2) NOT NULL,
  reference TEXT,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for crypto_balances
CREATE POLICY "Users can view own balances" ON crypto_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own balances" ON crypto_balances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own balances" ON crypto_balances FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for transactions (read-only to owner; inserts happen server-side with service role)
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);