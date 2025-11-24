import { supabase } from '@/lib/supabase';

export async function getFiatBalance(userId: string): Promise<number> {
  // Fetch directly from profiles table fiat_balance column
  const { data, error } = await supabase
    .from('profiles')
    .select('fiat_balance')
    .eq('id', userId)
    .single();
  
  if (error || !data) return 0;
  return Number(data.fiat_balance || 0);
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
