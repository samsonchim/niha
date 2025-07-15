# 🔧 Easy Monnify Configuration Switch

## Current Status: MOCK ACCOUNTS ENABLED ✅

To switch between mock and real Monnify integration:

### 🧪 Use Mock Accounts (Current Setting)
```env
USE_MOCK_ACCOUNTS=true
```
- ✅ Works immediately without real Monnify credentials
- ✅ Full app flow testing
- ✅ Database integration works
- ✅ BVN encryption works
- 📝 Shows "Development Mode" in UI

### 🚀 Use Real Monnify API
```env
USE_MOCK_ACCOUNTS=false
```
- ❗ Requires valid Monnify sandbox credentials
- ❗ Need real API key, secret key, and contract code
- ✅ Production-ready virtual accounts
- ✅ Real bank account numbers

## 🔄 How to Switch

### Option 1: Quick Switch (Recommended)
Just change this line in `.env`:
```env
# For mock accounts
USE_MOCK_ACCOUNTS=true

# For real Monnify
USE_MOCK_ACCOUNTS=false
```

### Option 2: Environment-Based
```env
# Development
NODE_ENV=development
USE_MOCK_ACCOUNTS=true

# Production  
NODE_ENV=production
USE_MOCK_ACCOUNTS=false
```

## 📋 When You Get Real Monnify Credentials

1. Update these in `.env`:
```env
MONNIFY_API_KEY=your_real_api_key
MONNIFY_SECRET_KEY=your_real_secret_key
MONNIFY_CONTRACT_CODE=your_real_contract_code
```

2. Set mock to false:
```env
USE_MOCK_ACCOUNTS=false
```

3. Restart server:
```bash
npm start
```

4. Test the integration:
```bash
curl -X GET "https://f142675f2ac4.ngrok-free.app/api/test-monnify"
```

## ✅ Current Benefits
- App development can continue immediately
- Full user flow testing works
- Database structure is production-ready
- Easy switch when real credentials are available
- No code changes needed, just environment variables
