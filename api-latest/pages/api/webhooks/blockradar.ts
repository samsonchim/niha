import type { NextApiRequest, NextApiResponse } from 'next';
import { handleBlockRadarWebhook } from '../../../lib/services/webhook';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const result = await handleBlockRadarWebhook(req.body);
    res.status(200).json(result);
  } catch (e: any) {
    console.error('BlockRadar webhook API error:', e);
    res.status(400).json({ error: e.message || String(e) });
  }
}
