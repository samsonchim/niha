# NIHA App New (Expo)

This is a minimal Expo app scaffold for the new flow:
- Email/password signup.
- Backend-triggered onboarding: Dedicated Virtual Account (Flutterwave) + crypto wallets (BlockRadar).
- Track incoming payments to Supabase and display balances.
- Send/withdraw via Flutterwave (fiat) and BlockRadar (crypto).

## Prerequisites
- Node 18+
- Expo CLI (`npm i -g expo`)
- Supabase project (URL + anon key)
- Running backend (the `api` folder in this repo or your own server)

## Environment Variables
Set these in your shell or via `.env` and `app.config` as Expo public vars:

- `EXPO_PUBLIC_SUPABASE_URL` – your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` – your Supabase anon key
- `EXPO_PUBLIC_API_BASE_URL` – base URL of your backend, e.g. `http://localhost:3000`

## Install & Run
```powershell
# In a new terminal
cd "c:\Users\Samson Chi\Documents\niha\app-new"
npm install
npm run start
```

Open on device or emulator from the Expo dev tools.

## App Structure
- `app/auth/signup.tsx` – Sign up with email/password (Supabase auth). Triggers backend onboarding.
- `app/index.tsx` – Dashboard showing fiat total (sum of credits − debits) and crypto wallets with fiat equivalents.
- `app/send.tsx` – Forms for fiat and crypto transfers; calls backend endpoints.
- `src/lib/supabase.ts` – Supabase client initialized from env.
- `src/lib/config.ts` – Backend base URL from env.
- `src/services/backend.ts` – Axios calls to backend endpoints.
- `src/services/balances.ts` – Queries Supabase for balances.

## Expected Backend Endpoints
Implement these in your server (you can extend the existing `api/` folder):

1) POST `/onboarding`
- Input: `{ userId: string, email: string }`
- Actions (server-side only):
  - Create Flutterwave Dedicated Virtual Account (DVA) using BVN `2211903400` (do NOT request user BVN).
  - Create wallets on BlockRadar (USDC + generic ERC-20) using:
    - User ID: `9230322d-29ad-496f-b456-124b4c34f3ac`
    - API Key (test): `test_lkw47cFUCDBIkdPsNMLBNge3XVKqiNvuq4IEBP1KaQFHQdIciglusUItY4CfrIpbkrLpjYtBP00RUP9RNuXvpPzucHvNlu1RupA`
  - Save DVA + wallet metadata in Supabase (e.g., `profiles` or `accounts` tables).

2) Webhook `/webhooks/flutterwave`
- Receive incoming transactions to the DVA.
- Verify signature.
- On credit events, insert a row into Supabase `transactions` with `{ user_id, type: 'credit', amount, reference, meta }`.

3) POST `/transfer/fiat`
- Input: `{ userId, amount, recipientAccount, bankCode, narration? }`
- Validate user balance in Supabase; if sufficient, initiate transfer from YOUR Flutterwave wallet/account (not the DVA).
- On success, insert debit transaction in Supabase.

4) POST `/transfer/crypto`
- Input: `{ userId, symbol, toAddress, amount }`
- Perform on BlockRadar; on success, update `crypto_balances` and insert a corresponding fiat-equivalent debit at your admin-defined rate.

## Suggested Supabase Tables
```sql
-- Track fiat transactions
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text check (type in ('credit','debit')) not null,
  amount numeric not null,
  reference text,
  meta jsonb,
  created_at timestamptz default now()
);

-- Track crypto balances per user
create table if not exists crypto_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  symbol text not null,
  amount numeric not null default 0,
  fiat_value numeric not null default 0,
  updated_at timestamptz default now()
);
```

## Notes
- Flutterwave credentials and logic must remain server-side (see `/api` folder).
- Use BVN `2211903400` server-side when creating DVAs.
- BlockRadar API key and user ID must remain server-side.
- The app only calls your backend and reads balances from Supabase.
