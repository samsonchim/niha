import type { NextApiRequest, NextApiResponse } from 'next';
import { checkUnresolvedTransactions } from '../../lib/services/webhook';
import { supabase } from '../../lib/services/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('[Sync All] Starting sync for all users...');

    // Get all profiles with DVA accounts
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, dva_account_number, firstname, lastname')
      .not('dva_account_number', 'is', null);

    if (error) {
      console.error('[Sync All] Error fetching profiles:', error);
      return res.status(500).json({ error: 'Failed to fetch profiles' });
    }

    if (!profiles || profiles.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No profiles with DVA accounts found',
        processed: 0 
      });
    }

    console.log(`[Sync All] Found ${profiles.length} profiles with DVA accounts`);

    let totalProcessed = 0;
    const results: any[] = [];

    for (const profile of profiles) {
      try {
        console.log(`[Sync All] Checking transactions for ${profile.email} (${profile.dva_account_number})`);
        
        const result = await checkUnresolvedTransactions(profile.id, profile.dva_account_number);
        
        totalProcessed += result.processed;
        results.push({
          userId: profile.id,
          email: profile.email,
          name: `${profile.firstname || ''} ${profile.lastname || ''}`.trim(),
          processed: result.processed
        });

        console.log(`[Sync All] Processed ${result.processed} transactions for ${profile.email}`);
      } catch (error: any) {
        console.error(`[Sync All] Error processing ${profile.email}:`, error.message);
        results.push({
          userId: profile.id,
          email: profile.email,
          error: error.message
        });
      }
    }

    console.log(`[Sync All] Completed. Total transactions processed: ${totalProcessed}`);

    res.status(200).json({
      success: true,
      message: `Sync completed. Processed ${totalProcessed} unresolved transactions across ${profiles.length} users.`,
      totalProcessed,
      totalUsers: profiles.length,
      details: results
    });
  } catch (error: any) {
    console.error('[Sync All] Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
