-- SQL Schema for Non-Custodial HD Wallets
-- This creates tables to store only public addresses (never private keys or seed phrases)

-- Table to store user's crypto wallet addresses
CREATE TABLE IF NOT EXISTS crypto_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coin_symbol VARCHAR(10) NOT NULL, -- BTC, ETH, USDT, BNB, SOL, etc.
  coin_name VARCHAR(50) NOT NULL, -- Bitcoin, Ethereum, Tether, etc.
  network VARCHAR(20) NOT NULL, -- mainnet, testnet, polygon, bsc, etc.
  address TEXT NOT NULL, -- Public wallet address only
  derivation_path VARCHAR(50), -- BIP44 path like m/44'/0'/0'/0/0
  address_index INTEGER DEFAULT 0, -- For generating multiple addresses per coin
  is_active BOOLEAN DEFAULT true,
  deactivated_at TIMESTAMP WITH TIME ZONE, -- When wallet was deactivated
  deactivation_reason TEXT, -- Why wallet was deactivated
  reactivated_at TIMESTAMP WITH TIME ZONE, -- When wallet was reactivated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user_id ON crypto_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_coin_symbol ON crypto_wallets(coin_symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_address ON crypto_wallets(address);

-- Unique constraint to prevent duplicate addresses per user per coin
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_coin_address 
ON crypto_wallets(user_id, coin_symbol, address);

-- RLS (Row Level Security) Policies
ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own wallets
CREATE POLICY "Users can view own wallets" ON crypto_wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own wallets
CREATE POLICY "Users can insert own wallets" ON crypto_wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own wallets
CREATE POLICY "Users can update own wallets" ON crypto_wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- Add wallet creation flag to users table (to track if wallets were generated)
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_crypto_wallets BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallets_created_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallets_deactivated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallets_reactivated_at TIMESTAMP WITH TIME ZONE;

-- Add temporary seed phrase storage (for 10 minutes after verification, then cleared)
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_seed_phrase TEXT; -- Encrypted, only stored temporarily
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_seed_phrase_expires TIMESTAMP WITH TIME ZONE;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_crypto_wallets_updated_at
  BEFORE UPDATE ON crypto_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for easy wallet retrieval with coin info
CREATE OR REPLACE VIEW user_wallet_summary AS
SELECT 
  cw.user_id,
  cw.coin_symbol,
  cw.coin_name,
  cw.network,
  cw.address,
  cw.derivation_path,
  cw.is_active,
  cw.created_at
FROM crypto_wallets cw
WHERE cw.is_active = true
ORDER BY cw.coin_symbol;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON crypto_wallets TO authenticated;
GRANT SELECT ON user_wallet_summary TO authenticated;
