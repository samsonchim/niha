# NIHA New Backend (api-new)

Implements onboarding + transfers + webhook for the new mobile app.

## Features
- POST `/onboarding` – Create Flutterwave Dedicated Virtual Account (DVA) using BVN 2211903400 and BlockRadar wallets (USDC + ERC20). Persist profile + initial crypto balances.
- POST `/transfer/fiat` – Move funds from platform Flutterwave wallet to recipient; record debit in `transactions`.
- POST `/transfer/crypto` – Send crypto via BlockRadar; deduct crypto & fiat-equivalent (using `EXCHANGE_RATE_USDC_NGN`).
- POST `/webhooks/flutterwave` – Receive incoming credits, map DVA account number to user profile, record credit transaction.
- GET `/health` – Simple health check.

## Environment Variables (.env)
See `.env.example` (copy to `.env`).

| Variable | Description |
|----------|-------------|
| SUPABASE_URL | Project URL |
| SUPABASE_SERVICE_ROLE_KEY | Service role key (server only) |
| SUPABASE_ANON_KEY | Optional (not required server-side) |
| SUPABASE_JWT_SECRET | For generating custom JWT if needed |
| FLUTTERWAVE_PUBLIC_KEY | Flutterwave public key |
| FLUTTERWAVE_SECRET_KEY | Flutterwave secret key |
| FLUTTERWAVE_HASH | Webhook verification hash (verif-hash) |
| FLUTTERWAVE_BASE_URL | Defaults to https://api.flutterwave.com/v3 |
| BVN_FOR_DVA | BVN to use (default 2211903400) |
| BLOCKRADAR_API_KEY | BlockRadar API key (test) |
| BLOCKRADAR_USER_ID | BlockRadar user id |
| BLOCKRADAR_BASE_URL | BlockRadar base URL (placeholder) |
| EXCHANGE_RATE_USDC_NGN | Fiat conversion rate for crypto (e.g., 1500) |
| PORT | Server port |

## Supabase Tables (SQL)
```sql
create table if not exists profiles (
  id uuid primary key,
  email text,
  dva_account_number text,
  dva_bank_name text,
  dva_account_name text,
  usdc_address text,
  erc20_address text,
  updated_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text check (type in ('credit','debit')) not null,
  amount numeric not null,
  reference text,
  meta jsonb,
  created_at timestamptz default now()
);

create table if not exists crypto_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  symbol text not null,
  amount numeric not null default 0,
  fiat_value numeric not null default 0,
  updated_at timestamptz default now()
);
create index on crypto_balances (user_id, symbol);
```

## Install & Run
```powershell
cd "c:\Users\Samson Chi\Documents\niha\api-new"
npm install
npm run dev
```

## Endpoint Details
### POST /onboarding
Body: `{ "userId": "uuid", "email": "user@example.com" }`
Response: `{ success: true, data: { dva: {...}, wallets: { usdc, erc20 } } }`

### POST /transfer/fiat
Body: `{ "userId": "uuid", "amount": 5000, "recipientAccount": "0123456789", "bankCode": "044", "narration": "Payment" }`
Response: `{ success: true, data: {...flutterwaveTransfer} }`

### POST /transfer/crypto
Body: `{ "userId": "uuid", "symbol": "USDC", "toAddress": "0xRecipient", "amount": "10" }`
Response: `{ success: true, data: { txHash, fiatEquivalent } }`

### POST /webhooks/flutterwave
Headers: `verif-hash: <FLUTTERWAVE_HASH>`
Body: Flutterwave event JSON.
Response: `{ received: true }`

## Notes / TODO
- BlockRadar endpoints are placeholders; replace with actual API paths.
- Add retry / idempotency for webhook ingestion if needed.
- Consider securing transfer endpoints with authentication (JWT from Supabase session) – currently expects trusted calls.
- Add rate limiting & logging in production.

## Security
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the mobile app.
- Keep Flutterwave and BlockRadar keys in server environment only.
- Validate and sanitize all incoming request fields.

## License
Internal project boilerplate.
