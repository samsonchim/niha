#!/usr/bin/env node

// Test script for Flutterwave integration
const axios = require('axios');

const API_BASE = 'https://f142675f2ac4.ngrok-free.app';

async function testFlutterwaveIntegration() {
  console.log('🧪 Testing Flutterwave Integration...');
  console.log('=====================================');

  try {
    // Test 1: Flutterwave connection
    console.log('\n1️⃣ Testing Flutterwave Connection...');
    const testResponse = await axios.get(`${API_BASE}/api/test-flutterwave`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    
    if (testResponse.data.success) {
      console.log('✅ Flutterwave connection successful!');
      console.log(`📊 Banks available: ${testResponse.data.data.banksCount}`);
    } else {
      console.log('❌ Flutterwave connection failed');
    }

    // Test 2: Virtual account creation (requires a verified user)
    console.log('\n2️⃣ Testing Virtual Account Creation...');
    console.log('ℹ️  This requires a verified user in the database');
    console.log('   Run this from your app after email verification');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFlutterwaveIntegration();
