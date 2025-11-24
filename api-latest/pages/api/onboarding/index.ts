import type { NextApiRequest, NextApiResponse } from 'next';
import { runOnboarding } from '../../../lib/services/onboarding';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, email, firstName, lastName, phone } = req.body || {};
  const debug = (req.query.debug === '1');
  if (!userId || !email) return res.status(400).json({ error: 'userId and email required' });

  try {
    const result = await runOnboarding(userId, email, firstName, lastName, phone);
    res.status(200).json({ success: true, data: result });
  } catch (e: any) {
    console.error('Onboarding API error:', e);
    // Return extra details only when debug=1 is present to aid diagnosis
    const details = (e?.response?.data || e?.cause || null);
    res.status(500).json({ success: false, error: e.message || String(e), ...(debug && details ? { details } : {}) });
  }
}
