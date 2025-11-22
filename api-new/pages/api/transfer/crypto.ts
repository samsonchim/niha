import type { NextApiRequest, NextApiResponse } from 'next';
import { handleCryptoTransfer } from '../../../lib/services/transfers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, toAddress, amount, blockchain } = req.body || {};
  if (!userId || !toAddress || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await handleCryptoTransfer(userId, toAddress, amount, blockchain);
    res.status(200).json({ success: true, data: result });
  } catch (e: any) {
    console.error('Crypto transfer API error:', e);
    res.status(500).json({ success: false, error: e.message || String(e) });
  }
}
