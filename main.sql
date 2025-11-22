-- ========================================
-- NIHA CRYPTO-NAIRA PLATFORM DATABASE SCHEMA
-- Simplified schema for Supabase with Auth integration
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. PROFILES TABLE
-- User profile data (extends Supabase auth.users)
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  
  -- Flutterwave DVA (Dedicated Virtual Account) details
  dva_account_number TEXT,
  dva_bank_name TEXT,
  dva_reference TEXT,
  flutterwave_customer_id TEXT,
  
  -- BlockRadar crypto wallet details
  usdc_address TEXT, -- USDC wallet address (Base network)
  erc20_address TEXT, -- Generic ERC-20 address (for future use)
  blockradar_address_id TEXT, -- BlockRadar dedicated address ID
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_dva_account_number ON profiles(dva_account_number);
CREATE INDEX IF NOT EXISTS idx_profiles_usdc_address ON profiles(usdc_address);

-- ========================================
-- 2. TRANSACTIONS TABLE
-- Track all fiat and crypto transactions
-- ========================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Transaction details
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC(15, 2) NOT NULL,
  reference TEXT NOT NULL, -- Transaction reference/hash
  
  -- Metadata (stores additional transaction info as JSON)
  -- Examples: { "kind": "dva_credit", "customer": {...} }
  --           { "kind": "crypto_deposit", "symbol": "USDC", "cryptoAmount": 100 }
  --           { "kind": "fiat_transfer", "recipientAccount": "..." }
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- ========================================
-- 3. CRYPTO_BALANCES TABLE
-- Track cryptocurrency balances per user
-- ========================================
CREATE TABLE IF NOT EXISTS crypto_balances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Cryptocurrency details
  symbol TEXT NOT NULL, -- USDC, ETH, BTC, etc.
  amount NUMERIC(18, 8) DEFAULT 0, -- Crypto amount
  fiat_value NUMERIC(15, 2) DEFAULT 0, -- Fiat equivalent (NGN)
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crypto balances table indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_crypto_balances_user_symbol ON crypto_balances(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_balances_user_id ON crypto_balances(user_id);

-- ========================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables with updated_at columns
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crypto_balances_updated_at 
  BEFORE UPDATE ON crypto_balances 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Supabase security policies
-- ========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_balances ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert transactions" ON transactions
  FOR INSERT WITH CHECK (true); -- Backend service inserts transactions

-- Crypto balances policies
CREATE POLICY "Users can view own crypto balances" ON crypto_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage crypto balances" ON crypto_balances
  FOR ALL USING (true); -- Backend service manages balances

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to get user's total fiat balance
CREATE OR REPLACE FUNCTION get_fiat_balance(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  balance NUMERIC;
BEGIN
  SELECT COALESCE(SUM(
    CASE 
      WHEN type = 'credit' THEN amount
      WHEN type = 'debit' THEN -amount
      ELSE 0
    END
  ), 0) INTO balance
  FROM transactions
  WHERE user_id = p_user_id;
  
  RETURN balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's crypto balance for a specific symbol
CREATE OR REPLACE FUNCTION get_crypto_balance(p_user_id UUID, p_symbol TEXT)
RETURNS NUMERIC AS $$
DECLARE
  balance NUMERIC;
BEGIN
  SELECT COALESCE(amount, 0) INTO balance
  FROM crypto_balances
  WHERE user_id = p_user_id AND symbol = p_symbol;
  
  RETURN balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- USEFUL VIEWS
-- ========================================

-- User balance summary view
CREATE OR REPLACE VIEW user_balance_summary AS
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  p.dva_account_number,
  p.dva_bank_name,
  p.usdc_address,
  get_fiat_balance(p.id) as fiat_balance,
  COALESCE(
    (SELECT SUM(fiat_value) FROM crypto_balances WHERE user_id = p.id),
    0
  ) as total_crypto_value_ngn,
  p.created_at
FROM profiles p;

-- Recent transactions view
CREATE OR REPLACE VIEW recent_transactions AS
SELECT 
  t.*,
  p.email as user_email,
  p.full_name as user_name
FROM transactions t
JOIN profiles p ON t.user_id = p.id
ORDER BY t.created_at DESC;

-- ========================================
-- COMMENTS AND DOCUMENTATION
-- ========================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users with DVA and crypto wallet details';
COMMENT ON TABLE transactions IS 'All fiat and crypto transactions (credits and debits)';
COMMENT ON TABLE crypto_balances IS 'Cryptocurrency balances per user with fiat equivalent';

COMMENT ON COLUMN profiles.dva_account_number IS 'Flutterwave Dedicated Virtual Account number';
COMMENT ON COLUMN profiles.usdc_address IS 'BlockRadar USDC wallet address on Base network';
COMMENT ON COLUMN transactions.metadata IS 'JSON metadata: kind (dva_credit, crypto_deposit, fiat_transfer, crypto_transfer), and additional details';
COMMENT ON COLUMN crypto_balances.fiat_value IS 'Fiat equivalent in NGN based on exchange rate';

-- ========================================
-- DATABASE SCHEMA COMPLETE
-- ========================================

SELECT 'Niha Crypto-Naira Platform database schema created successfully!' as status,
       NOW() as created_at,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'transactions', 'crypto_balances')) as core_tables;
