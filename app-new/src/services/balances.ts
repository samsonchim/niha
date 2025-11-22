import { supabase } from '@/lib/supabase';

export async function getFiatBalance(userId: string): Promise<number> {
  // Assumes a 'transactions' table with columns: user_id (uuid), type ('credit'|'debit'), amount (numeric)
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('user_id', userId);
  if (error || !data) return 0;
  let balance = 0;
  for (const t of data) {
    balance += (t.type === 'credit' ? 1 : -1) * Number(t.amount || 0);
  }
  return balance;
}

export async function getCryptoBalances(userId: string): Promise<{ symbol: string; amount: number; fiatValue: number }[]> {
  // Assumes a 'crypto_balances' table: user_id, symbol, amount, fiat_value
  const { data, error } = await supabase
    .from('crypto_balances')
    .select('symbol, amount, fiat_value')
    .eq('user_id', userId);
  if (error || !data) return [];
  return data.map((row: any) => ({ symbol: row.symbol, amount: Number(row.amount || 0), fiatValue: Number(row.fiat_value || 0) }));
}
