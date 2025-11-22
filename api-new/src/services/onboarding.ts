import { createDedicatedAddress } from './blockradar';
import { createDedicatedVirtualAccount } from './flutterwave';
import { supabase } from './supabase';

export async function runOnboarding(userId: string, email: string, fullName?: string) {
  console.log(`Starting onboarding for user ${userId} (${email})`);

  try {
    // 1. Create DVA
    console.log('Creating Flutterwave DVA...');
    const dva = await createDedicatedVirtualAccount(userId, email);
    console.log(`DVA created: ${dva.account_number}`);

    // 2. Create dedicated address for crypto (USDC on Base/Ethereum)
    console.log('Creating BlockRadar dedicated address...');
    const cryptoAddress = await createDedicatedAddress(
      fullName || email,
      { userId, email }
    );
    console.log(`Crypto address created: ${cryptoAddress.address}`);

    // 3. Persist profile data
    console.log('Saving profile to database...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        dva_account_number: dva.account_number,
        dva_bank_name: dva.bank_name,
        dva_account_name: dva.account_name,
        usdc_address: cryptoAddress.address,
        erc20_address: cryptoAddress.address, // Same address for all ERC-20 tokens
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    // 4. Initialize crypto balance row (USDC)
    console.log('Initializing crypto balance...');
    await supabase.from('crypto_balances').upsert([
      { user_id: userId, symbol: 'USDC', amount: 0, fiat_value: 0 }
    ]);

    console.log(`Onboarding completed successfully for user ${userId}`);

    return {
      dva,
      cryptoAddress: {
        address: cryptoAddress.address,
        blockchain: cryptoAddress.blockchain,
        network: cryptoAddress.network,
      }
    };
  } catch (error: any) {
    console.error('Onboarding failed:', error.message);
    // TODO: Consider implementing rollback logic here
    // For now, we'll let the error propagate
    throw new Error(`Onboarding failed: ${error.message}`);
  }
}
