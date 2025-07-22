#!/bin/bash

# Monnify Credential Tester Script
# Run this to test different credential combinations

echo "🧪 Testing Monnify Credentials..."
echo "=================================="

# Test 1: Current credentials
echo "Test 1: Current credentials in .env"
curl -s -X GET "https://f142675f2ac4.ngrok-free.app/api/test-monnify" | jq '.'

echo ""
echo "If authentication fails, you need REAL Monnify sandbox credentials."
echo ""
echo "🔧 How to get real credentials:"
echo "1. Go to https://monnify.com"
echo "2. Sign up for sandbox account"
echo "3. Wait for account approval (1-2 days)"
echo "4. Get your real API key, secret, and contract code"
echo "5. Replace the credentials in your .env file"
echo ""
echo "📧 For immediate help:"
echo "- Contact Monnify support at support@monnify.com"
echo "- Request sandbox access with business details"
echo "- Ask for documentation with working test credentials"
