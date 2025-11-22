import { sendCrypto } from './blockradar';
import { initiateFiatTransfer } from './flutterwave';
import { getCryptoBalance, getFiatBalance, insertTransaction, upsertCryptoBalance } from './supabase';

export async function handleFiatTransfer(userId: string, amount: number, recipientAccount: string, bankCode: string, narration?: string) {
  const balance = await getFiatBalance(userId);
  if (balance < amount) throw new Error('Insufficient fiat balance');

  const transferResult = await initiateFiatTransfer({ amount, account_number: recipientAccount, bank_code: bankCode, narration });

  await insertTransaction(userId, 'debit', amount, transferResult.id, { kind: 'fiat_transfer' });
  return transferResult;
}

export async function handleCryptoTransfer(userId: string, toAddress: string, amount: string, blockchain?: string) {
  const numericAmount = Number(amount);
  if (numericAmount <= 0) throw new Error('Amount must be positive');

  const symbol = 'USDC';
  const balance = await getCryptoBalance(userId, symbol);
  if (balance < numericAmount) throw new Error('Insufficient crypto balance');

  console.log(`Initiating crypto transfer: ${numericAmount} ${symbol} to ${toAddress}`);

  const txResult = await sendCrypto({
    toAddress,
    amount,
    blockchain: blockchain || 'base',
    reference: `user-${userId}-${Date.now()}`,
    metadata: { userId, symbol }
  });

  console.log(`Crypto transfer initiated: ${txResult.txId}, status: ${txResult.status}`);

  const rate = Number(process.env.EXCHANGE_RATE_USDC_NGN || '1500');
  const fiatEquivalent = numericAmount * rate;

  await insertTransaction(userId, 'debit', fiatEquivalent, txResult.txId, {
    kind: 'crypto_transfer',
    symbol,
    blockchain: blockchain || 'base',
    txHash: txResult.txHash,
    recipientAddress: toAddress
  });

  await upsertCryptoBalance(userId, symbol, -numericAmount, -fiatEquivalent);

  return {
    txHash: txResult.txHash,
    txId: txResult.txId,
    status: txResult.status,
    fiatEquivalent
  };
}
