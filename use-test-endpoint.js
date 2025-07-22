// Use the test user creation endpoint
const API_BASE = 'http://localhost:3001/api';

console.log('🧪 Creating test user via development endpoint...');

fetch(`${API_BASE}/create-test-user`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => response.json())
.then(data => {
  console.log('📡 Response:', data);
  
  if (data.success) {
    console.log('🎉 Test user created successfully!');
    console.log('👤 User data:', data.data.user);
    console.log('🔐 Credentials:', data.data.credentials);
    console.log('💰 Wallets available:', Object.keys(data.data.wallets).length);
    
    // Save to file for easy access
    const fs = require('fs');
    fs.writeFileSync('final-test-user.json', JSON.stringify(data.data, null, 2));
    
    console.log('\n🎯 READY FOR TESTING!');
    console.log('📧 Email:', data.data.credentials.email);
    console.log('🔑 Password:', data.data.credentials.password);
    console.log('🆔 User ID:', data.data.user.id);
    console.log('💾 Data saved to: final-test-user.json');
    
    console.log('\n📱 To test wallets screen:');
    console.log('1. Use these credentials to login in your app');
    console.log('2. Navigate to the wallets tab');
    console.log('3. Check console logs for API calls and responses');
    
    // Display available wallets
    console.log('\n💰 Available wallets:');
    Object.keys(data.data.wallets).forEach(symbol => {
      const wallet = data.data.wallets[symbol];
      console.log(`  ${symbol}: ${wallet.address}`);
    });
    
  } else {
    console.error('❌ Failed to create test user:', data.message);
  }
})
.catch(error => {
  console.error('❌ Error:', error);
});
