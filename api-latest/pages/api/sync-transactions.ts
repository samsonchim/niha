import type { NextApiRequest, NextApiResponse } from 'next';
import { checkUnresolvedTransactions } from '../../lib/services/webhook';
import { supabase } from '../../lib/services/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, accountNumber } = req.body;

    if (!userId && !accountNumber) {
      return res.status(400).json({ error: 'userId or accountNumber required' });
    }

    let finalUserId = userId;
    let finalAccountNumber = accountNumber;

    // If only userId provided, get the account number
    if (userId && !accountNumber) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('dva_account_number')
        .eq('id', userId)
        .single();

      if (!profile || !profile.dva_account_number) {
        return res.status(404).json({ error: 'User or DVA account not found' });
      }

      finalAccountNumber = profile.dva_account_number;
    }

    // If only accountNumber provided, get the userId
    if (!userId && accountNumber) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('dva_account_number', accountNumber)
        .single();

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found for this DVA account' });
      }

      finalUserId = profile.id;
    }

    const result = await checkUnresolvedTransactions(finalUserId, finalAccountNumber);
    
    res.status(200).json({
      success: true,
      message: `Processed ${result.processed} unresolved transactions`,
      ...result
    });
  } catch (error: any) {
    console.error('Sync transactions error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
