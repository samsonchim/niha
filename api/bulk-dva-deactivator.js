// Bulk DVA Deactivation Script for Flutterwave API
// This script fetches all virtual accounts and deactivates them
require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class DVADeactivator {
  constructor() {
    this.baseURL = process.env.FLUTTERWAVE_BASE_URL;
    this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    this.headers = {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json'
    };
  }

  async getAllVirtualAccounts() {
    try {
      console.log('🔍 Fetching all virtual accounts from Flutterwave...');
      
      // Try different possible endpoints
      const endpoints = [
        '/virtual-account-numbers',
        '/virtual-accounts',
        '/virtual_accounts',
        '/accounts/virtual'
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`  Trying endpoint: ${endpoint}`);
          const response = await axios.get(`${this.baseURL}${endpoint}`, {
            headers: this.headers
          });

          if (response.data.status === 'success') {
            console.log(`✅ Found ${response.data.data.length} virtual accounts via ${endpoint}`);
            return response.data.data;
          }
        } catch (endpointError) {
          console.log(`  ⚠️ Endpoint ${endpoint} failed: ${endpointError.response?.data?.message || endpointError.message}`);
        }
      }

      console.log('ℹ️ No valid endpoint found for listing accounts. Will work with database records only.');
      return [];
    } catch (error) {
      console.error('❌ Error fetching virtual accounts:', error.response?.data || error.message);
      return [];
    }
  }

  async getVirtualAccountDetails(accountNumber) {
    try {
      const response = await axios.get(`${this.baseURL}/virtual-account-numbers/${accountNumber}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to get details for ${accountNumber}:`, error.response?.data?.message || error.message);
      return null;
    }
  }

  async deactivateVirtualAccount(accountNumber) {
    try {
      console.log(`🔄 Attempting to deactivate account: ${accountNumber}`);
      
      // Method 1: Try DELETE request
      try {
        const deleteResponse = await axios.delete(`${this.baseURL}/virtual-account-numbers/${accountNumber}`, {
          headers: this.headers
        });
        
        if (deleteResponse.data.status === 'success') {
          console.log(`✅ Successfully deleted account ${accountNumber}`);
          return { success: true, method: 'DELETE', data: deleteResponse.data };
        }
      } catch (deleteError) {
        console.log(`⚠️ DELETE method failed for ${accountNumber}: ${deleteError.response?.data?.message || deleteError.message}`);
      }

      // Method 2: Try PUT request to disable
      try {
        const updateResponse = await axios.put(`${this.baseURL}/virtual-account-numbers/${accountNumber}`, {
          is_active: false
        }, {
          headers: this.headers
        });
        
        if (updateResponse.data.status === 'success') {
          console.log(`✅ Successfully deactivated account ${accountNumber} via UPDATE`);
          return { success: true, method: 'PUT', data: updateResponse.data };
        }
      } catch (updateError) {
        console.log(`⚠️ PUT method failed for ${accountNumber}: ${updateError.response?.data?.message || updateError.message}`);
      }

      // Method 3: Try PATCH request
      try {
        const patchResponse = await axios.patch(`${this.baseURL}/virtual-account-numbers/${accountNumber}`, {
          is_active: false,
          status: 'inactive'
        }, {
          headers: this.headers
        });
        
        if (patchResponse.data.status === 'success') {
          console.log(`✅ Successfully deactivated account ${accountNumber} via PATCH`);
          return { success: true, method: 'PATCH', data: patchResponse.data };
        }
      } catch (patchError) {
        console.log(`⚠️ PATCH method failed for ${accountNumber}: ${patchError.response?.data?.message || patchError.message}`);
      }

      console.log(`❌ All deactivation methods failed for ${accountNumber}`);
      return { success: false, error: 'All HTTP methods failed' };

    } catch (error) {
      console.error(`❌ Critical error deactivating ${accountNumber}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async updateDatabaseRecord(accountNumber, success, method = null) {
    try {
      const updateData = {
        is_active: false,
        updated_at: new Date().toISOString()
      };

      if (success) {
        updateData.deactivation_method = method;
        updateData.deactivated_on_flutterwave = true;
      } else {
        updateData.deactivated_on_flutterwave = false;
        updateData.deactivation_note = 'Failed to deactivate on Flutterwave - marked inactive locally only';
      }

      const { error } = await supabase
        .from('fiat')
        .update(updateData)
        .eq('virtual_account_number', accountNumber);

      if (error) {
        console.error(`❌ Failed to update database for ${accountNumber}:`, error);
      } else {
        console.log(`✅ Updated database record for ${accountNumber}`);
      }
    } catch (error) {
      console.error(`❌ Database update error for ${accountNumber}:`, error);
    }
  }

  async deactivateAllAccounts() {
    console.log('🚀 Starting bulk DVA deactivation process...');
    console.log('='.repeat(60));

    // Test API connection first
    try {
      await axios.get(`${this.baseURL}/banks/NG`, { headers: this.headers });
      console.log('✅ Flutterwave API connection verified');
    } catch (error) {
      console.error('❌ Failed to connect to Flutterwave API:', error.response?.data || error.message);
      return;
    }

    // Get all accounts from our database
    const { data: localAccounts, error: dbError } = await supabase
      .from('fiat')
      .select('virtual_account_number, virtual_account_bank, is_active')
      .eq('is_active', true);

    if (dbError) {
      console.error('❌ Failed to fetch accounts from database:', dbError);
      return;
    }

    console.log(`📊 Found ${localAccounts?.length || 0} active accounts in database`);

    if (!localAccounts || localAccounts.length === 0) {
      console.log('ℹ️ No active virtual accounts found in database');
      return;
    }

    const results = {
      total: localAccounts.length,
      successful: 0,
      failed: 0,
      details: []
    };

    // Process each account
    for (let i = 0; i < localAccounts.length; i++) {
      const account = localAccounts[i];
      console.log(`\n[${i + 1}/${localAccounts.length}] Processing ${account.virtual_account_number}...`);

      // Get account details first
      const details = await this.getVirtualAccountDetails(account.virtual_account_number);
      
      if (details && details.status === 'success') {
        console.log(`📋 Account Details: ${details.data.account_name} - ${details.data.bank_name}`);
      }

      // Attempt deactivation
      const result = await this.deactivateVirtualAccount(account.virtual_account_number);
      
      // Update database
      await this.updateDatabaseRecord(account.virtual_account_number, result.success, result.method);

      if (result.success) {
        results.successful++;
        results.details.push({
          accountNumber: account.virtual_account_number,
          status: 'SUCCESS',
          method: result.method
        });
      } else {
        results.failed++;
        results.details.push({
          accountNumber: account.virtual_account_number,
          status: 'FAILED',
          error: result.error
        });
      }

      // Add delay to avoid rate limiting
      if (i < localAccounts.length - 1) {
        console.log('⏱️ Waiting 2 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Print final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎯 BULK DEACTIVATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Total Accounts Processed: ${results.total}`);
    console.log(`✅ Successfully Deactivated: ${results.successful}`);
    console.log(`❌ Failed to Deactivate: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.successful / results.total) * 100).toFixed(1)}%`);

    if (results.successful > 0) {
      console.log('\n✅ SUCCESSFUL DEACTIVATIONS:');
      results.details
        .filter(d => d.status === 'SUCCESS')
        .forEach(d => console.log(`  • ${d.accountNumber} (via ${d.method})`));
    }

    if (results.failed > 0) {
      console.log('\n❌ FAILED DEACTIVATIONS:');
      results.details
        .filter(d => d.status === 'FAILED')
        .forEach(d => console.log(`  • ${d.accountNumber}: ${d.error}`));
    }

    console.log('\n📝 IMPORTANT NOTES:');
    console.log('• All accounts have been marked inactive in your local database');
    console.log('• Flutterwave may not support API-based deactivation for all account types');
    console.log('• Contact Flutterwave support for complete account removal if needed');
    console.log('• Failed accounts are marked inactive locally but may still be active on Flutterwave');

    return results;
  }

  async listAllAccounts() {
    console.log('📋 Listing all virtual accounts...\n');

    // Get from Flutterwave
    const flutterwaveAccounts = await this.getAllVirtualAccounts();
    
    // Get from local database
    const { data: localAccounts } = await supabase
      .from('fiat')
      .select('virtual_account_number, virtual_account_bank, is_active, created_at')
      .order('created_at', { ascending: false });

    console.log('🌐 FLUTTERWAVE ACCOUNTS:');
    if (flutterwaveAccounts.length > 0) {
      flutterwaveAccounts.forEach((acc, index) => {
        console.log(`${index + 1}. ${acc.account_number} - ${acc.account_name} (${acc.bank_name})`);
      });
    } else {
      console.log('  No accounts found on Flutterwave');
    }

    console.log('\n🗄️ LOCAL DATABASE ACCOUNTS:');
    if (localAccounts && localAccounts.length > 0) {
      localAccounts.forEach((acc, index) => {
        const status = acc.is_active ? '🟢 ACTIVE' : '🔴 INACTIVE';
        console.log(`${index + 1}. ${acc.virtual_account_number} - ${acc.virtual_account_bank} ${status}`);
      });
    } else {
      console.log('  No accounts found in local database');
    }
  }
}

// Main execution
async function main() {
  const deactivator = new DVADeactivator();

  const command = process.argv[2];

  switch (command) {
    case 'list':
      await deactivator.listAllAccounts();
      break;
    case 'deactivate':
      console.log('⚠️ WARNING: This will attempt to deactivate ALL virtual accounts!');
      console.log('Press Ctrl+C within 5 seconds to cancel...\n');
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await deactivator.deactivateAllAccounts();
      break;
    case 'test':
      console.log('🧪 Testing Flutterwave API connection...');
      try {
        const response = await axios.get(`${process.env.FLUTTERWAVE_BASE_URL}/banks/NG`, {
          headers: {
            'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ API Connection Successful - Found ${response.data.data?.length} banks`);
      } catch (error) {
        console.error('❌ API Connection Failed:', error.response?.data || error.message);
      }
      break;
    default:
      console.log('🔧 DVA Bulk Deactivation Tool');
      console.log('Usage:');
      console.log('  node bulk-dva-deactivator.js list        - List all virtual accounts');
      console.log('  node bulk-dva-deactivator.js test        - Test Flutterwave API connection');
      console.log('  node bulk-dva-deactivator.js deactivate  - Deactivate all virtual accounts');
      console.log('\nNote: Make sure your .env file contains the required Flutterwave credentials');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DVADeactivator;
