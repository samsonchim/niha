import type { NextApiRequest, NextApiResponse } from 'next';
import { handleFlutterwaveWebhook } from '../../../lib/services/webhook';

export const config = {
  api: {
    bodyParser: false
  }
};

async function getRawBody(req: NextApiRequest) {
  const chunks: Buffer[] = [];
  for await (const chunk of req as any) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[Flutterwave Webhook] ${req.method} request received`);
  
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'active', 
      endpoint: 'flutterwave webhook',
      message: 'Send POST requests to this endpoint' 
    });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const raw = await getRawBody(req);
    console.log('[Flutterwave Webhook] Raw body length:', raw.length);
    
    let parsed = {};
    try { 
      parsed = JSON.parse(raw || '{}');
      console.log('[Flutterwave Webhook] Event:', parsed);
    } catch (parseError) {
      console.error('[Flutterwave Webhook] Parse error:', parseError);
    }
    
    const result = await handleFlutterwaveWebhook(req.headers, raw, parsed as any);
    console.log('[Flutterwave Webhook] Success:', result);
    res.status(200).json(result);
  } catch (e: any) {
    console.error('[Flutterwave Webhook] Error:', e);
    res.status(400).json({ error: e.message || String(e) });
  }
}
