// Quick Test Script for Backend APIs
// Run with: node test-api.js

// Local dev: run `vercel dev` (or `npm run dev` if configured) then use the serverless endpoints under /api
const API_BASE = 'http://localhost:3000/api';

// Test 1: Health Check
async function testHealth() {
    console.log('\n🔍 Test 1: Health Check');
    try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        console.log('✅ Health check passed:', data);
        return true;
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        return false;
    }
}

// Test 2: Onboarding
async function testOnboarding(userId, email, fullName) {
    console.log('\n🔍 Test 2: Onboarding');
    try {
        const res = await fetch(`${API_BASE}/onboarding`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, email, fullName })
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }

        const data = await res.json();
        console.log('✅ Onboarding successful:', data);
        return true;
    } catch (error) {
        console.error('❌ Onboarding failed:', error.message);
        return false;
    }
}

// Test 3: Fiat Transfer (requires balance)
async function testFiatTransfer(userId) {
    console.log('\n🔍 Test 3: Fiat Transfer');
    try {
        const res = await fetch(`${API_BASE}/transfer/fiat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                amount: 100,
                recipientAccount: '0123456789',
                bankCode: '044',
                narration: 'Test transfer'
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.log('⚠️  Fiat transfer failed (expected if no balance):', data);
            return false;
        }

        console.log('✅ Fiat transfer successful:', data);
        return true;
    } catch (error) {
        console.error('❌ Fiat transfer error:', error.message);
        return false;
    }
}

// Test 4: Crypto Transfer (requires balance)
async function testCryptoTransfer(userId) {
    console.log('\n🔍 Test 4: Crypto Transfer');
    try {
        const res = await fetch(`${API_BASE}/transfer/crypto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                amount: '1',
                blockchain: 'base'
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.log('⚠️  Crypto transfer failed (expected if no balance):', data);
            return false;
        }

        console.log('✅ Crypto transfer successful:', data);
        return true;
    } catch (error) {
        console.error('❌ Crypto transfer error:', error.message);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting Backend API Tests...');
    console.log('='.repeat(50));

    // Test health first
    const healthOk = await testHealth();
    if (!healthOk) {
        console.log('\n❌ Backend is not running. Start with: npm run dev');
        return;
    }

    // Use a test user ID (replace with actual user ID from Supabase)
    const TEST_USER_ID = 'YOUR_TEST_USER_ID_HERE';
    const TEST_EMAIL = 'test@example.com';
    const TEST_NAME = 'Test User';

    console.log('\n⚠️  NOTE: Replace TEST_USER_ID with actual user ID from Supabase Auth');
    console.log(`Current test user: ${TEST_USER_ID}`);

    // Run tests
    await testOnboarding(TEST_USER_ID, TEST_EMAIL, TEST_NAME);
    await testFiatTransfer(TEST_USER_ID);
    await testCryptoTransfer(TEST_USER_ID);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Test suite completed!');
    console.log('\nNext steps:');
    console.log('1. Check Supabase for profile creation');
    console.log('2. Add test balance via SQL');
    console.log('3. Test webhooks with actual payloads');
    console.log('4. Test frontend app');
}

// Run tests
runTests().catch(console.error);
