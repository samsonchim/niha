import { getVirtualAccountTransactions, verifyFlutterwaveSignature } from './flutterwave';
import { insertTransaction, supabase, upsertCryptoBalance } from './supabase';

export async function handleFlutterwaveWebhook(headers: any, rawBody: string, parsed: any) {
  console.log('Received Flutterwave webhook:', JSON.stringify({ event: parsed?.event, data: parsed?.data }));

  const ok = verifyFlutterwaveSignature(headers, rawBody);
  if (!ok) {
    console.error('Invalid Flutterwave signature');
    throw new Error('Invalid Flutterwave signature');
  }

  if (parsed.event === 'charge.completed') {
    const { status, amount, customer, account_number, id: txId, tx_ref } = parsed.data;
    console.log(`Charge completed: ${amount} NGN to account ${account_number}, status: ${status}, txId: ${txId}`);

    if (status === 'successful') {
      await processDVACredit(txId, account_number, Number(amount), customer);
    } else {
      console.log(`Transaction ${txId} not successful, status: ${status}`);
    }
  }

  return { received: true };
}

async function processDVACredit(txId: string, account_number: string, amount: number, customer?: any) {
  // Check for duplicate
  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('reference', txId)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`Transaction ${txId} already processed, skipping`);
    return { duplicate: true };
  }

  // Find user by DVA account number
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, fiat_balance')
    .eq('dva_account_number', account_number)
    .limit(1);

  const profile = profiles && profiles[0];
  if (!profile) {
    console.warn(`No profile found for DVA account ${account_number}`);
    return { error: 'Profile not found' };
  }

  console.log(`Crediting user ${profile.id} (${profile.email}) with ${amount} NGN`);
  
  const currentBalance = profile.fiat_balance || 0;
  const newBalance = currentBalance + amount;
  
  // Update balance
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ fiat_balance: newBalance })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Failed to update balance:', updateError);
    throw new Error('Failed to update balance');
  }
  
  // Record transaction
  await insertTransaction(profile.id, 'credit', amount, txId, {
    kind: 'dva_credit',
    customer,
    account_number
  });
  
  console.log(`Transaction ${txId} recorded successfully. New balance: ${newBalance} NGN`);
  return { success: true, newBalance };
}

export async function checkUnresolvedTransactions(userId: string, accountNumber: string) {
  console.log(`Checking unresolved transactions for user ${userId}, account ${accountNumber}`);
  
  // Get transactions from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
  
  const flwTransactions = await getVirtualAccountTransactions(accountNumber, fromDate);
  
  if (!flwTransactions || flwTransactions.length === 0) {
    console.log('No transactions found from Flutterwave');
    return { processed: 0 };
  }

  let processedCount = 0;
  
  for (const tx of flwTransactions) {
    if (tx.status === 'successful' && tx.amount > 0) {
      try {
        const result = await processDVACredit(
          String(tx.id),
          accountNumber,
          Number(tx.amount),
          tx.customer
        );
        
        if (result.success) {
          processedCount++;
          console.log(`Processed unresolved transaction: ${tx.id}`);
        }
      } catch (error: any) {
        console.error(`Failed to process transaction ${tx.id}:`, error.message);
      }
    }
  }
  
  console.log(`Processed ${processedCount} unresolved transactions`);
  return { processed: processedCount };
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
