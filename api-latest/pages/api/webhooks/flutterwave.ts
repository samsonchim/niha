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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const raw = await getRawBody(req);
    let parsed = {};
    try { parsed = JSON.parse(raw || '{}'); } catch {}
    const result = await handleFlutterwaveWebhook(req.headers, raw, parsed as any);
    res.status(200).json(result);
  } catch (e: any) {
    console.error('Flutterwave webhook API error:', e);
    res.status(400).json({ error: e.message || String(e) });
  }
}
