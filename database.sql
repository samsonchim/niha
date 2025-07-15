[This is the database schema for the Users table in a PostgreSQL database. 
It includes fields for user identification, 
personal information, account verification, 
and referral tracking. The table uses UUIDs 
for unique identification and includes a timestamp for record creation.]


create extension if not exists "pgcrypto";
create table public.users (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  password_hash text not null,
  is_verified boolean default false,
  verification_token text,
  referral_code text unique,
  referred_by text,
  created_at timestamp with time zone default now()
);
