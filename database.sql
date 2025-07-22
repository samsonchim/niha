[This is the database schema for the Users and Fiat tables in a PostgreSQL database. 
It includes fields for user identification, personal information, account verification, 
and referral tracking. The Fiat table stores encrypted BVN and virtual account details
with a one-to-one relationship to users. Uses UUIDs for unique identification.]

create extension if not exists "pgcrypto";

-- Users table for authentication and basic profile
create table public.users (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  password_hash text not null,
  is_verified boolean default false,
  verification_token text,
  verified_at timestamp with time zone,
  referral_code text unique,
  referred_by text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Fiat table for banking and virtual account details
create table public.fiat (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  bvn_encrypted text not null, -- Encrypted BVN for security
  virtual_account_number text unique,
  virtual_account_bank text default 'Monnify', -- Always Monnify/Moniepoint
  virtual_account_reference text unique, -- Monnify reference ID
  monnify_customer_id text,
  virtual_accounts jsonb, -- Store all available bank accounts from Monnify
  fiat_balance decimal(15,2) default 0.00, -- NGN balance with 2 decimal places
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Constraints
  constraint unique_user_fiat unique(user_id), -- One fiat account per user
  constraint positive_balance check(fiat_balance >= 0)
);

-- Indexes for performance
create index idx_users_email on public.users(email);
create index idx_users_verification_token on public.users(verification_token);
create index idx_users_referral_code on public.users(referral_code);
create index idx_fiat_user_id on public.fiat(user_id);
create index idx_fiat_virtual_account_number on public.fiat(virtual_account_number);
create index idx_fiat_virtual_account_reference on public.fiat(virtual_account_reference);

-- Function to encrypt BVN
create or replace function encrypt_bvn(bvn_plain text)
returns text as $$
begin
  return encode(pgp_sym_encrypt(bvn_plain, current_setting('app.encryption_key', true)), 'base64');
end;
$$ language plpgsql security definer;

-- Function to decrypt BVN
create or replace function decrypt_bvn(bvn_encrypted text)
returns text as $$
begin
  return pgp_sym_decrypt(decode(bvn_encrypted, 'base64'), current_setting('app.encryption_key', true));
end;
$$ language plpgsql security definer;

-- Trigger to update updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at before update on public.users
  for each row execute function update_updated_at_column();

create trigger update_fiat_updated_at before update on public.fiat
  for each row execute function update_updated_at_column();

-- Row Level Security (RLS) policies
alter table public.users enable row level security;
alter table public.fiat enable row level security;

-- Users can only see their own data
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Users can only see their own fiat data
create policy "Users can view own fiat data" on public.fiat
  for select using (auth.uid() = user_id);

create policy "Users can update own fiat data" on public.fiat
  for update using (auth.uid() = user_id);

-- Service role can access all data (for API operations)
create policy "Service role full access users" on public.users
  for all using (current_setting('role') = 'service_role');

create policy "Service role full access fiat" on public.fiat
  for all using (current_setting('role') = 'service_role');
