# NIHA API (api-latest)

Serverless-only Next.js API project.

## Commands

```powershell
npm install
npm run dev
npm run build
```

## Endpoints
- /api/health
- /api/onboarding (POST)
- /api/transfer/fiat (POST)
- /api/transfer/crypto (POST)
- /api/webhooks/flutterwave (POST)
- /api/webhooks/blockradar (POST)

## Env Vars
Set the following (Vercel Project Settings or .env for local):
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- FLUTTERWAVE_SECRET_KEY
- FLUTTERWAVE_HASH
- BLOCKRADAR_API_KEY
- BLOCKRADAR_MASTER_WALLET_ID
- (optional) EXCHANGE_RATE_USDC_NGN
