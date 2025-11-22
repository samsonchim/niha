import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const url = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  console.error('Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

export const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function insertTransaction(userId: string, type: 'credit' | 'debit', amount: number, reference?: string, meta?: any) {
  return supabase.from('transactions').insert({ user_id: userId, type, amount, reference, meta });
}

export async function upsertCryptoBalance(userId: string, symbol: string, amount: number, fiatValue: number) {
  const existing = await supabase
    .from('crypto_balances')
    .select('id, amount, fiat_value')
    .eq('user_id', userId)
    .eq('symbol', symbol)
    .maybeSingle();

  if (existing.data) {
    const newAmount = Number(existing.data.amount) + amount;
    const newFiat = Number(existing.data.fiat_value) + fiatValue;
    return supabase
      .from('crypto_balances')
      .update({ amount: newAmount, fiat_value: newFiat, updated_at: new Date().toISOString() })
      .eq('id', existing.data.id);
  } else {
    return supabase
      .from('crypto_balances')
      .insert({ user_id: userId, symbol, amount, fiat_value: fiatValue });
  }
}

export async function getFiatBalance(userId: string): Promise<number> {
  const { data } = await supabase
    .from('transactions')
    .select('amount,type')
    .eq('user_id', userId);
  if (!data) return 0;
  return data.reduce((acc: number, t: any) => acc + (t.type === 'credit' ? Number(t.amount) : -Number(t.amount)), 0);
}

export async function getCryptoBalance(userId: string, symbol: string): Promise<number> {
  const { data } = await supabase
    .from('crypto_balances')
    .select('amount')
    .eq('user_id', userId)
    .eq('symbol', symbol)
    .maybeSingle();
  return data ? Number(data.amount) : 0;
}
