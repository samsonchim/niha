import type { NextApiRequest, NextApiResponse } from 'next';
import { handleBlockRadarWebhook } from '../../../lib/services/webhook';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[BlockRadar Webhook] ${req.method} request received`);
  
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'active', 
      endpoint: 'blockradar webhook',
      message: 'Send POST requests to this endpoint' 
    });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[BlockRadar Webhook] Body:', req.body);
    const result = await handleBlockRadarWebhook(req.body);
    console.log('[BlockRadar Webhook] Success:', result);
    res.status(200).json(result);
  } catch (e: any) {
    console.error('[BlockRadar Webhook] Error:', e);
    res.status(400).json({ error: e.message || String(e) });
  }
}
