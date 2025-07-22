// Test login with our created user
const API_BASE = 'http://localhost:3001/api';

// Use the test user credentials
const testCredentials = {
  email: 'testuser1753143305895@example.com',
  password: 'TestPassword123!'
};

console.log('🔐 Testing login with:', testCredentials.email);

fetch(`${API_BASE}/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testCredentials)
})
.then(response => response.json())
.then(data => {
  console.log('📡 Login response:', data);
  
  if (data.success) {
    console.log('✅ Login successful!');
    console.log('👤 User data:', data.data.user);
    console.log('🏦 Has virtual account:', data.data.hasVirtualAccount);
    console.log('💰 Has wallets:', data.data.user.has_crypto_wallets);
    
    if (data.data.virtualAccount) {
      console.log('🏦 Virtual account:', data.data.virtualAccount);
    }
    
    console.log('\n🎯 READY FOR LOGIN TESTING!');
    console.log('📱 Use these credentials in your app:');
    console.log('📧 Email:', testCredentials.email);
    console.log('🔑 Password:', testCredentials.password);
    console.log('\n✨ Expected behavior:');
    console.log('1. Show custom success popup');
    console.log('2. Navigate to main app/wallets');
    console.log('3. Display user\'s real wallets');
    
  } else {
    console.error('❌ Login failed:', data.message);
  }
})
.catch(error => {
  console.error('❌ Error:', error);
});
