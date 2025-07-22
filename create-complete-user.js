// Direct user creation and verification for testing
const API_BASE = 'http://localhost:3001/api';

// Step 1: Create user
const testUser = {
  firstName: 'John',
  lastName: 'Doe', 
  email: `john.doe${Date.now()}@test.com`,
  password: 'TestPassword123!'
};

console.log('🚀 Creating and setting up test user...', testUser.email);

// Function to create user and then verify via direct create-virtual-account
async function createTestUser() {
  try {
    // Step 1: Create user account
    const signupResponse = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    const signupData = await signupResponse.json();
    console.log('📝 Signup response:', signupData);
    
    if (!signupData.success) {
      console.error('❌ Signup failed:', signupData.message);
      return;
    }
    
    console.log('✅ User created successfully!');
    
    // Step 2: Create virtual account (this also verifies the user and creates wallets)
    console.log('🏦 Creating virtual account and wallets...');
    
    const dvaResponse = await fetch(`${API_BASE}/create-virtual-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        bvn: '12345678901', // Mock BVN
        firstName: testUser.firstName,
        lastName: testUser.lastName
      })
    });
    
    const dvaData = await dvaResponse.json();
    console.log('🏦 DVA response:', dvaData);
    
    if (dvaData.success) {
      console.log('🎉 Virtual account and wallets created successfully!');
      console.log('💰 User ID:', dvaData.data.userId);
      console.log('🏦 Account Number:', dvaData.data.accountNumber);
      console.log('🏦 Bank:', dvaData.data.bankName);
      
      // Step 3: Test login to get complete user data
      console.log('🔐 Testing login...');
      
      const loginResponse = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('🔐 Login response:', loginData);
      
      if (loginData.success) {
        console.log('✅ Login successful!');
        console.log('👤 Complete user data:', loginData.data.user);
        
        // Save test user data
        const fs = require('fs');
        const testUserData = {
          user: loginData.data.user,
          credentials: {
            email: testUser.email,
            password: testUser.password
          },
          virtualAccount: dvaData.data
        };
        
        fs.writeFileSync('complete-test-user.json', JSON.stringify(testUserData, null, 2));
        console.log('💾 Complete test user data saved to complete-test-user.json');
        
        console.log('\n🎯 TEST USER READY!');
        console.log('📧 Email:', testUser.email);
        console.log('🔑 Password:', testUser.password);
        console.log('🆔 User ID:', loginData.data.user.id);
        console.log('\n📱 You can now test the wallet screen with this user!');
        
        return testUserData;
      } else {
        console.error('❌ Login failed:', loginData.message);
      }
    } else {
      console.error('❌ DVA creation failed:', dvaData.message);
    }
    
  } catch (error) {
    console.error('❌ Error during user creation:', error);
  }
}

// Execute the function
createTestUser();
