# Monnify Integration Setup Guide

## Current Status
- ✅ Mock virtual account system implemented for testing
- ❌ Need proper Monnify sandbox credentials
- ✅ Error handling and fallback system in place

## Getting Proper Monnify Credentials

### 1. Register for Monnify Sandbox
1. Visit: https://app.monnify.com/
2. Sign up for a developer/sandbox account
3. Complete business verification (may take 1-2 days)

### 2. Get Your Credentials
After approval, you'll receive:
- `MONNIFY_API_KEY` (format: MK_TEST_XXXXXXXXXX)
- `MONNIFY_SECRET_KEY` (long alphanumeric string)
- `MONNIFY_CONTRACT_CODE` (numeric string for your business)

### 3. Update Environment Variables
Replace the current test values in `.env`:
```env
MONNIFY_API_KEY=your_actual_api_key
MONNIFY_SECRET_KEY=your_actual_secret_key
MONNIFY_CONTRACT_CODE=your_actual_contract_code
```

### 4. Test Your Integration
Use the test endpoint: `GET /api/test-monnify` to verify connection

## Current Mock System
For immediate testing, the app uses mock virtual accounts when:
- `USE_MOCK_ACCOUNTS=true` in .env
- Monnify API fails (invalid credentials)
- Running in development mode

### Mock Account Features
- Generates realistic 10-digit account numbers
- Stores in database same as real accounts
- Shows "Test Mode" indicators in UI
- Encrypted BVN storage works the same

## Next Steps
1. Get proper Monnify credentials (recommended)
2. Or continue with mock system for development
3. Set `USE_MOCK_ACCOUNTS=false` when ready for production

## Error Handling
The system now handles:
- Invalid contract codes
- Network errors
- Authentication failures
- Database errors
- Graceful fallback to mock accounts
