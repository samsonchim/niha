// Test script to create a new user for testing wallet functionality
// Run this in the browser console or as a Node.js script

const API_BASE = 'http://localhost:3001/api';

const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: `testuser${Date.now()}@example.com`, // Unique email
  password: 'TestPassword123!'
};

console.log('🚀 Creating test user:', testUser);

// Step 1: Sign up the user
fetch(`${API_BASE}/signup`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testUser)
})
.then(response => response.json())
.then(data => {
  console.log('📝 Signup response:', data);
  
  if (data.success) {
    console.log('✅ User created successfully! Email:', testUser.email);
    console.log('📧 Check your console for verification process or use the verification endpoint directly.');
    console.log('🔐 User ID:', data.data?.userId);
    
    // If you want to auto-verify for testing (uncomment below)
    /*
    return fetch(`${API_BASE}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        verificationCode: '123456' // Use actual code from email/console
      })
    });
    */
  } else {
    console.error('❌ Signup failed:', data.message);
  }
})
.then(response => {
  if (response) {
    return response.json();
  }
})
.then(verifyData => {
  if (verifyData) {
    console.log('✅ Verification response:', verifyData);
    if (verifyData.success) {
      console.log('🎉 User verified and wallets created!');
      console.log('📱 You can now login with:', testUser.email, testUser.password);
    }
  }
})
.catch(error => {
  console.error('❌ Error:', error);
});

// Export test user data for easy access
console.log('📋 Test User Credentials:');
console.log('Email:', testUser.email);
console.log('Password:', testUser.password);
