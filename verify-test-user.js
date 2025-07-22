// Verification script for the test user
const API_BASE = 'http://localhost:3001/api';

const testUserEmail = 'testuser1753142903198@example.com';
const verificationCode = '123456'; // Mock verification code

console.log('📧 Verifying user:', testUserEmail);

fetch(`${API_BASE}/verify`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: testUserEmail,
    verificationCode: verificationCode
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Verification response:', data);
  
  if (data.success) {
    console.log('🎉 User verified successfully!');
    console.log('👤 User data:', data.data.user);
    console.log('💰 Wallets created:', data.data.wallets ? 'YES' : 'NO');
    
    if (data.data.wallets) {
      console.log('🏦 Available wallets:');
      Object.keys(data.data.wallets).forEach(symbol => {
        console.log(`  ${symbol}: ${data.data.wallets[symbol].address}`);
      });
    }
    
    console.log('\n📱 You can now login with:');
    console.log('Email:', testUserEmail);
    console.log('Password: TestPassword123!');
    console.log('User ID:', data.data.user.id);
    
    // Save user data to a temp file for easy testing
    const fs = require('fs');
    const testData = {
      user: data.data.user,
      email: testUserEmail,
      password: 'TestPassword123!',
      wallets: data.data.wallets
    };
    
    fs.writeFileSync('test-user-data.json', JSON.stringify(testData, null, 2));
    console.log('💾 Test user data saved to test-user-data.json');
    
  } else {
    console.error('❌ Verification failed:', data.message);
  }
})
.catch(error => {
  console.error('❌ Error:', error);
});
