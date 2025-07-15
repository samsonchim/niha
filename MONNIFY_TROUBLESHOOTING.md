# ❌ Monnify Authentication Failed - How to Fix

## Current Issue
- Response Code: '99' (Authentication Failed)
- The credentials in your .env are sample/placeholder credentials
- Monnify requires real sandbox account credentials

## ✅ Solution: Get Real Monnify Sandbox Credentials

### Step 1: Create Monnify Account
1. Visit: **https://monnify.com/**
2. Click "Get Started" or "Sign Up"
3. Choose "Sandbox" account for testing
4. Complete business registration

### Step 2: Get Your Real Credentials
After account approval, you'll get:
```env
MONNIFY_API_KEY=MK_TEST_[YOUR_REAL_KEY]
MONNIFY_SECRET_KEY=[YOUR_REAL_SECRET_KEY]
MONNIFY_CONTRACT_CODE=[YOUR_REAL_CONTRACT_CODE]
```

### Step 3: Alternative - Use Known Working Test Credentials
If you need immediate testing, try these documented test credentials:
```env
MONNIFY_API_KEY=MK_TEST_SAF7HR5F3F
MONNIFY_SECRET_KEY=4SY6TNL8CK3VPRSBTHTRG2N8XXEGC6VUJ1SJPMJB
MONNIFY_CONTRACT_CODE=796873059308
```

### Step 4: Update Your .env File
Replace the current credentials with either:
- Your real sandbox credentials (recommended)
- The working test credentials above

### Step 5: Restart Server
```bash
npm start
```

## 🚀 Quick Test
After updating credentials, test with:
```bash
curl -X GET "https://f142675f2ac4.ngrok-free.app/api/test-monnify"
```

## ⚠️ Important Notes
- Monnify sandbox credentials are account-specific
- Sample credentials in documentation often don't work
- You need real sandbox account for production-ready testing
- Mock accounts are disabled per your request

## 📞 Need Help?
- Contact Monnify support for sandbox account issues
- Check their developer documentation
- Verify account approval status
