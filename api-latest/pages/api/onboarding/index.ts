import type { NextApiRequest, NextApiResponse } from 'next';
import { runOnboarding } from '../../../lib/services/onboarding';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, email, fullName } = req.body || {};
  if (!userId || !email) return res.status(400).json({ error: 'userId and email required' });

  try {
    const result = await runOnboarding(userId, email, fullName);
    res.status(200).json({ success: true, data: result });
  } catch (e: any) {
    console.error('Onboarding API error:', e);
    res.status(500).json({ success: false, error: e.message || String(e) });
  }
}
