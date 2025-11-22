import { verifyFlutterwaveSignature } from './flutterwave';
import { insertTransaction, supabase, upsertCryptoBalance } from './supabase';

export async function handleFlutterwaveWebhook(headers: any, rawBody: string, parsed: any) {
  console.log('Received Flutterwave webhook:', parsed?.event);

  const ok = verifyFlutterwaveSignature(headers, rawBody);
  if (!ok) {
    console.error('Invalid Flutterwave signature');
    throw new Error('Invalid Flutterwave signature');
  }

  if (parsed.event === 'charge.completed') {
    const { status, amount, customer, account_number, id: txId } = parsed.data;
    console.log(`Charge completed: ${amount} NGN to account ${account_number}, status: ${status}`);

    if (status === 'successful') {
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('reference', txId)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`Transaction ${txId} already processed, skipping`);
        return { received: true, duplicate: true };
      }

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

export async function handleBlockRadarWebhook(parsed: any) {
  console.log('Received BlockRadar webhook:', parsed?.event);

  if (parsed.event === 'transaction.confirmed' && parsed.data.type === 'DEPOSIT') {
    const { id: txId, amount, asset, recipientAddress, metadata } = parsed.data;
    const symbol = asset.symbol;
    const numericAmount = Number(amount);

    console.log(`Crypto deposit: ${numericAmount} ${symbol} to ${recipientAddress}`);

    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', txId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`Transaction ${txId} already processed, skipping`);
      return { received: true, duplicate: true };
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .or(`usdc_address.eq.${recipientAddress},erc20_address.eq.${recipientAddress}`)
      .limit(1);

    const profile = profiles && profiles[0];
    if (profile) {
      console.log(`Crediting user ${profile.id} (${profile.email}) with ${numericAmount} ${symbol}`);

      const rate = Number(process.env.EXCHANGE_RATE_USDC_NGN || '1500');
      const fiatEquivalent = numericAmount * rate;

      await insertTransaction(profile.id, 'credit', fiatEquivalent, txId, {
        kind: 'crypto_deposit',
        symbol,
        cryptoAmount: numericAmount,
        recipientAddress,
        metadata
      });

      await upsertCryptoBalance(profile.id, symbol, numericAmount, fiatEquivalent);

      console.log('Crypto deposit recorded successfully');
    } else {
      console.warn(`No profile found for crypto address ${recipientAddress}`);
    }
  }

  return { received: true };
}
