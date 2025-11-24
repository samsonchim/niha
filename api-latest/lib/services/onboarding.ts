import { createDedicatedAddress } from './blockradar';
import { createDedicatedVirtualAccount } from './flutterwave';
import { supabase } from './supabase';

export async function runOnboarding(userId: string, email: string, fullName?: string) {
  console.log(`Starting onboarding for user ${userId} (${email})`);

  try {
    console.log('Creating Flutterwave DVA...');
    const dva = await createDedicatedVirtualAccount(userId, email);
    console.log(`DVA created: ${dva.account_number}`);

    console.log('Creating BlockRadar dedicated address...');
    const cryptoAddress = await createDedicatedAddress(
      fullName || email,
      { userId, email }
    );
    console.log(`Crypto address created: ${cryptoAddress.address}`);

    console.log('Saving profile to database...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        dva_account_number: (dva as any).account_number,
        dva_bank_name: (dva as any).bank_name,
        dva_account_name: (dva as any).account_name,
        usdc_address: cryptoAddress.address,
        erc20_address: cryptoAddress.address,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

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
    console.error('Error details:', error.response?.data || error);
    throw new Error(`Onboarding failed: ${error.message}`);
  }
}
