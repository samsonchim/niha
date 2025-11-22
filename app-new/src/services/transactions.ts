import { supabase } from '@/lib/supabase';

export interface Transaction {
    id: string;
    userId: string;
    type: 'credit' | 'debit';
    amount: number;
    reference: string;
    metadata?: any;
    createdAt: string;
}

export async function getTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from('transactions')
        .select('id, user_id, type, amount, reference, metadata, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error || !data) return [];

    return data.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        amount: Number(row.amount || 0),
        reference: row.reference,
        metadata: row.metadata,
        createdAt: row.created_at,
    }));
}
