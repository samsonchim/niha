// Complete test user setup script
// This manually creates a verified user for testing purposes

const API_BASE = 'http://localhost:3001/api';

const testUser = {
  firstName: 'TestWallet',
  lastName: 'User',
  email: `testwallet${Date.now()}@example.com`,
  password: 'TestPassword123!'
};

console.log('🚀 Setting up complete test user:', testUser.email);

async function setupTestUser() {
  try {
    // Create the user account first
    console.log('📝 Step 1: Creating user account...');
    const signupResponse = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    const signupData = await signupResponse.json();
    console.log('Signup result:', signupData);
    
    if (!signupData.success) {
      throw new Error('Signup failed: ' + signupData.message);
    }
    
    console.log('✅ User account created');
    
    // For testing, let's try to login first to see if we can work around verification
    console.log('🔐 Step 2: Attempting initial login to get user data...');
    
    const loginAttempt = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const loginData = await loginAttempt.json();
    console.log('Login attempt:', loginData);
    
    if (loginData.success && loginData.data.user) {
      console.log('🎉 User can login! User ID:', loginData.data.user.id);
      
      // Save the test user data 
      const fs = require('fs');
      const userData = {
        user: loginData.data.user,
        credentials: {
          email: testUser.email,
          password: testUser.password
        }
      };
      
      fs.writeFileSync('ready-test-user.json', JSON.stringify(userData, null, 2));
      console.log('💾 Test user data saved to ready-test-user.json');
      
      console.log('\n🎯 TEST USER READY FOR WALLET TESTING!');
      console.log('📧 Email:', testUser.email);
      console.log('🔑 Password:', testUser.password);
      console.log('🆔 User ID:', loginData.data.user.id);
      console.log('✅ Status: Ready for wallet screen testing');
      
      console.log('\n📱 AsyncStorage data to simulate logged-in user:');
      console.log(JSON.stringify(loginData.data.user, null, 2));
      
      return userData;
    } else {
      console.log('❌ Login failed - user needs verification');
      console.log('🔧 You may need to manually verify the user in the database');
      console.log('📧 Email:', testUser.email);
      
      // Let's try the DVA creation anyway to see what happens
      console.log('\n🏦 Step 3: Attempting DVA creation (this might auto-verify)...');
      
      const dvaResponse = await fetch(`${API_BASE}/create-virtual-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          bvn: '12345678901', // Mock BVN for testing
          firstName: testUser.firstName,
          lastName: testUser.lastName
        })
      });
      
      const dvaData = await dvaResponse.json();
      console.log('DVA attempt result:', dvaData);
      
      if (dvaData.success) {
        console.log('🎉 DVA creation succeeded! User is now verified.');
        
        // Try login again
        const retryLogin = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
          })
        });
        
        const retryLoginData = await retryLogin.json();
        console.log('Retry login result:', retryLoginData);
        
        if (retryLoginData.success) {
          const fs = require('fs');
          const userData = {
            user: retryLoginData.data.user,
            credentials: {
              email: testUser.email,
              password: testUser.password
            },
            virtualAccount: dvaData.data
          };
          
          fs.writeFileSync('complete-ready-test-user.json', JSON.stringify(userData, null, 2));
          
          console.log('\n🎯 COMPLETE TEST USER READY!');
          console.log('📧 Email:', testUser.email);
          console.log('🔑 Password:', testUser.password);
          console.log('🆔 User ID:', retryLoginData.data.user.id);
          console.log('🏦 DVA Created: YES');
          console.log('💰 Wallets: Ready for testing');
          
          return userData;
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error setting up test user:', error);
  }
}

// Run the setup
setupTestUser();
