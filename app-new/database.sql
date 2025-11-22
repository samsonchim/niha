-- ========================================
-- NIHA WALLET DATABASE SCHEMA
-- Complete database schema for HD Wallet & DVA system
-- ========================================

-- Enable UUID extension (for PostgreSQL/Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. USERS TABLE
-- Core user authentication and profile data
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  
  -- Email verification
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_token_expires TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Password reset
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  
  -- Wallet status flags
  has_crypto_wallets BOOLEAN DEFAULT FALSE,
  wallets_created_at TIMESTAMP WITH TIME ZONE,
  wallets_deactivated_at TIMESTAMP WITH TIME ZONE,
  wallets_reactivated_at TIMESTAMP WITH TIME ZONE,
  
  -- Temporary seed phrase storage (expires in 10 minutes)
  temp_seed_phrase TEXT, -- Base64 encoded, only stored temporarily
  temp_seed_phrase_expires TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_users_has_crypto_wallets ON users(has_crypto_wallets);

-- ========================================
-- 2. FIAT ACCOUNTS TABLE
-- DVA (Dedicated Virtual Account) data
-- ========================================
CREATE TABLE IF NOT EXISTS fiat (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- BVN (Bank Verification Number) - encrypted
  bvn_encrypted TEXT NOT NULL,
  
  -- Virtual account details
  virtual_account_number VARCHAR(20) NOT NULL,
  virtual_account_bank VARCHAR(100) NOT NULL,
  virtual_account_reference VARCHAR(100) NOT NULL,
  
  -- Payment provider details
  monnify_customer_id VARCHAR(255), -- For Monnify integration
  flutterwave_customer_id VARCHAR(255), -- For Flutterwave integration
  
  -- Account metadata
  virtual_accounts JSONB, -- Store array of virtual account details
  provider VARCHAR(50) DEFAULT 'Flutterwave', -- Payment provider used
  
  -- Balance and status
  fiat_balance DECIMAL(15,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fiat table indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_fiat_user_id ON fiat(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fiat_virtual_account_number ON fiat(virtual_account_number);
CREATE INDEX IF NOT EXISTS idx_fiat_provider ON fiat(provider);
CREATE INDEX IF NOT EXISTS idx_fiat_is_active ON fiat(is_active);

-- ========================================
-- 3. CRYPTO WALLETS TABLE
-- HD Wallet addresses for multiple cryptocurrencies
-- ========================================
CREATE TABLE IF NOT EXISTS crypto_wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Cryptocurrency details
  coin_symbol VARCHAR(10) NOT NULL, -- BTC, ETH, USDT, BNB, SOL, etc.
  coin_name VARCHAR(50) NOT NULL, -- Bitcoin, Ethereum, Tether, etc.
  network VARCHAR(20) NOT NULL, -- mainnet, testnet, polygon, bsc, etc.
  
  -- Wallet address (PUBLIC ONLY - never store private keys)
  address TEXT NOT NULL,
  
  -- HD wallet derivation details
  derivation_path VARCHAR(50), -- BIP44 path like m/44'/0'/0'/0/0
  address_index INTEGER DEFAULT 0, -- For generating multiple addresses per coin
  
  -- Wallet status
  is_active BOOLEAN DEFAULT TRUE,
  deactivated_at TIMESTAMP WITH TIME ZONE,
  deactivation_reason TEXT,
  reactivated_at TIMESTAMP WITH TIME ZONE,
  
  -- Balance cache (updated periodically)
  balance_cache DECIMAL(18,8) DEFAULT 0,
  balance_usd_cache DECIMAL(10,2) DEFAULT 0,
  balance_last_updated TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crypto wallets table indexes
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user_id ON crypto_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_coin_symbol ON crypto_wallets(coin_symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_network ON crypto_wallets(network);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_is_active ON crypto_wallets(is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crypto_wallets_user_coin ON crypto_wallets(user_id, coin_symbol, address_index);

-- ========================================
-- 4. TRANSACTIONS TABLE
-- Track all crypto and fiat transactions
-- ========================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES crypto_wallets(id) ON DELETE SET NULL,
  
  -- Transaction identification
  tx_hash VARCHAR(255), -- Blockchain transaction hash
  tx_reference VARCHAR(100), -- Internal reference
  
  -- Transaction details
  transaction_type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'transfer', 'swap'
  currency VARCHAR(10) NOT NULL, -- BTC, ETH, NGN, USD, etc.
  amount DECIMAL(18,8) NOT NULL,
  amount_usd DECIMAL(10,2), -- USD equivalent at time of transaction
  
  -- Addresses
  from_address TEXT,
  to_address TEXT,
  
  -- Transaction status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed', 'cancelled'
  confirmations INTEGER DEFAULT 0,
  block_number BIGINT,
  
  -- Fees
  network_fee DECIMAL(18,8) DEFAULT 0,
  service_fee DECIMAL(18,8) DEFAULT 0,
  
  -- Provider details
  provider VARCHAR(50), -- 'blockchain', 'flutterwave', 'monnify'
  provider_reference VARCHAR(255),
  
  -- Metadata
  metadata JSONB, -- Additional transaction data
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_currency ON transactions(currency);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- ========================================
-- 5. EXCHANGE RATES TABLE
-- Cache cryptocurrency and fiat exchange rates
-- ========================================
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Currency pair
  base_currency VARCHAR(10) NOT NULL, -- BTC, ETH, NGN, etc.
  quote_currency VARCHAR(10) NOT NULL, -- USD, NGN, etc.
  
  -- Rate details
  rate DECIMAL(18,8) NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'coingecko', 'binance', 'cbn', etc.
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exchange rates table indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(base_currency, quote_currency, source);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_updated_at ON exchange_rates(updated_at);

-- ========================================
-- 6. USER SESSIONS TABLE
-- Track user login sessions and devices
-- ========================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session details
  session_token VARCHAR(255) UNIQUE NOT NULL,
  device_info TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Session status
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

-- ========================================
-- 7. AUDIT LOGS TABLE
-- Security and activity logging
-- ========================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Action details
  action VARCHAR(100) NOT NULL, -- 'login', 'wallet_created', 'transaction', etc.
  resource VARCHAR(100), -- 'user', 'wallet', 'transaction', etc.
  resource_id VARCHAR(255), -- ID of the affected resource
  
  -- Request details
  ip_address INET,
  user_agent TEXT,
  
  -- Result
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);

-- ========================================
-- 8. SYSTEM SETTINGS TABLE
-- Application configuration and feature flags
-- ========================================
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Setting details
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  
  -- Access control
  is_public BOOLEAN DEFAULT FALSE, -- Can be accessed by frontend
  is_encrypted BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_is_public ON system_settings(is_public);

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
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fiat_updated_at BEFORE UPDATE ON fiat 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crypto_wallets_updated_at BEFORE UPDATE ON crypto_wallets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exchange_rates_updated_at BEFORE UPDATE ON exchange_rates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- For Supabase/PostgreSQL security
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiat ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can only access their own fiat accounts
CREATE POLICY "Users can view own fiat accounts" ON fiat
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own fiat accounts" ON fiat
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only access their own crypto wallets
CREATE POLICY "Users can view own crypto wallets" ON crypto_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own crypto wallets" ON crypto_wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only access their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- INITIAL SYSTEM SETTINGS
-- Default configuration values
-- ========================================
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('app_name', 'Niha Wallet', 'string', 'Application name', true),
('app_version', '1.0.0', 'string', 'Current application version', true),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', true),
('max_wallets_per_user', '50', 'number', 'Maximum crypto wallets per user', false),
('seed_phrase_expiry_minutes', '10', 'number', 'Seed phrase access expiry time', false),
('supported_cryptocurrencies', '["BTC","ETH","USDT","USDC","BNB","MATIC","SOL","DOGE"]', 'json', 'List of supported cryptocurrencies', true),
('fiat_currency', 'NGN', 'string', 'Default fiat currency', true),
('min_withdrawal_amount', '10.00', 'number', 'Minimum withdrawal amount in USD', true),
('max_daily_withdrawal', '50000.00', 'number', 'Maximum daily withdrawal in USD', false),
('transaction_fee_percentage', '0.5', 'number', 'Service fee percentage for transactions', false),
('enable_kyc_verification', 'true', 'boolean', 'Enable KYC verification requirement', true),
('api_rate_limit_per_minute', '100', 'number', 'API rate limit per user per minute', false)
ON CONFLICT (setting_key) DO NOTHING;

-- ========================================
-- USEFUL VIEWS
-- Pre-built queries for common operations
-- ========================================

-- User wallet summary view
CREATE OR REPLACE VIEW user_wallet_summary AS
SELECT 
  u.id as user_id,
  u.email,
  u.first_name,
  u.last_name,
  u.has_crypto_wallets,
  u.wallets_created_at,
  COUNT(cw.id) as total_wallets,
  COUNT(CASE WHEN cw.is_active = true THEN 1 END) as active_wallets,
  COUNT(CASE WHEN cw.is_active = false THEN 1 END) as deactivated_wallets,
  f.virtual_account_number,
  f.virtual_account_bank,
  f.fiat_balance,
  u.created_at as user_created_at
FROM users u
LEFT JOIN crypto_wallets cw ON u.id = cw.user_id
LEFT JOIN fiat f ON u.id = f.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name, u.has_crypto_wallets, 
         u.wallets_created_at, f.virtual_account_number, f.virtual_account_bank, 
         f.fiat_balance, u.created_at;

-- Transaction summary view
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
  t.*,
  u.email as user_email,
  u.first_name,
  u.last_name,
  cw.coin_symbol,
  cw.coin_name,
  cw.address as wallet_address
FROM transactions t
JOIN users u ON t.user_id = u.id
LEFT JOIN crypto_wallets cw ON t.wallet_id = cw.id;

-- ========================================
-- COMMENTS AND DOCUMENTATION
-- ========================================

COMMENT ON TABLE users IS 'Core user accounts with authentication and profile data';
COMMENT ON TABLE fiat IS 'Dedicated Virtual Account (DVA) information for fiat transactions';
COMMENT ON TABLE crypto_wallets IS 'HD wallet addresses for multiple cryptocurrencies (PUBLIC ADDRESSES ONLY)';
COMMENT ON TABLE transactions IS 'All cryptocurrency and fiat transaction records';
COMMENT ON TABLE exchange_rates IS 'Cached exchange rates for currencies and cryptocurrencies';
COMMENT ON TABLE user_sessions IS 'User login sessions and device tracking';
COMMENT ON TABLE audit_logs IS 'Security and activity audit trail';
COMMENT ON TABLE system_settings IS 'Application configuration and feature flags';

COMMENT ON COLUMN users.temp_seed_phrase IS 'SECURITY: Temporary storage only, expires in 10 minutes';
COMMENT ON COLUMN fiat.bvn_encrypted IS 'SECURITY: BVN is encrypted using application encryption key';
COMMENT ON COLUMN crypto_wallets.address IS 'SECURITY: PUBLIC addresses only, never store private keys';

-- ========================================
-- DATABASE SCHEMA COMPLETE
-- ========================================

-- Final verification query
SELECT 'Database schema created successfully!' as status,
       NOW() as created_at,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public') as total_columns;
