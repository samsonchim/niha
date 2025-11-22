import { verifyFlutterwaveSignature } from './flutterwave';
import { insertTransaction, supabase, upsertCryptoBalance } from './supabase';

interface FlutterwaveEvent {
  event: string;
  data: any;
}

interface BlockRadarEvent {
  event: string;
  data: {
    id: string;
    type: string;
    amount: string;
    asset: {
      symbol: string;
      decimals: number;
    };
    recipientAddress: string;
    metadata?: any;
  };
}

export async function handleFlutterwaveWebhook(headers: any, rawBody: string, parsed: FlutterwaveEvent) {
  console.log('Received Flutterwave webhook:', parsed.event);

  const ok = verifyFlutterwaveSignature(headers, rawBody);
  if (!ok) {
    console.error('Invalid Flutterwave signature');
    throw new Error('Invalid Flutterwave signature');
  }

  if (parsed.event === 'charge.completed') {
    const { status, amount, customer, account_number, id: txId } = parsed.data;
    console.log(`Charge completed: ${amount} NGN to account ${account_number}, status: ${status}`);

    if (status === 'successful') {
      // Check for duplicate transaction (idempotency)
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('reference', txId)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`Transaction ${txId} already processed, skipping`);
        return { received: true, duplicate: true };
      }

      // Find user by account_number in profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('dva_account_number', account_number)
        .limit(1);

      const profile = profiles && profiles[0];
      if (profile) {
        console.log(`Crediting user ${profile.id} (${profile.email}) with ${amount} NGN`);
        await insertTransaction(profile.id, 'credit', Number(amount), txId, {
          kind: 'dva_credit',
          customer,
          account_number
        });
        console.log('Transaction recorded successfully');
      } else {
        console.warn(`No profile found for DVA account ${account_number}`);
      }
    }
  }

  return { received: true };
}

/**
 * Handle BlockRadar webhook for crypto deposits
 * BlockRadar sends webhooks when crypto is deposited to dedicated addresses
 */
export async function handleBlockRadarWebhook(parsed: BlockRadarEvent) {
  console.log('Received BlockRadar webhook:', parsed.event);

  // BlockRadar sends 'transaction.confirmed' event for deposits
  if (parsed.event === 'transaction.confirmed' && parsed.data.type === 'DEPOSIT') {
    const { id: txId, amount, asset, recipientAddress, metadata } = parsed.data;
    const symbol = asset.symbol;
    const numericAmount = Number(amount);

    console.log(`Crypto deposit: ${numericAmount} ${symbol} to ${recipientAddress}`);

    // Check for duplicate transaction (idempotency)
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', txId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`Transaction ${txId} already processed, skipping`);
      return { received: true, duplicate: true };
    }

    // Find user by crypto address
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .or(`usdc_address.eq.${recipientAddress},erc20_address.eq.${recipientAddress}`)
      .limit(1);

    const profile = profiles && profiles[0];
    if (profile) {
      console.log(`Crediting user ${profile.id} (${profile.email}) with ${numericAmount} ${symbol}`);

      // Calculate fiat equivalent
      const rate = Number(process.env.EXCHANGE_RATE_USDC_NGN || '1500');
      const fiatEquivalent = numericAmount * rate;

      // Insert credit transaction
      await insertTransaction(profile.id, 'credit', fiatEquivalent, txId, {
        kind: 'crypto_deposit',
        symbol,
        cryptoAmount: numericAmount,
        recipientAddress,
        metadata
      });

      // Update crypto balance
      await upsertCryptoBalance(profile.id, symbol, numericAmount, fiatEquivalent);

      console.log('Crypto deposit recorded successfully');
    } else {
      console.warn(`No profile found for crypto address ${recipientAddress}`);
    }
  }

  return { received: true };
}
