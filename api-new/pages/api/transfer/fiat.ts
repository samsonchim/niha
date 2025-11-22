import type { NextApiRequest, NextApiResponse } from 'next';
import { handleFiatTransfer } from '../../../lib/services/transfers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, amount, recipientAccount, bankCode, narration } = req.body || {};
  if (!userId || !amount || !recipientAccount || !bankCode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await handleFiatTransfer(userId, Number(amount), recipientAccount, bankCode, narration);
    res.status(200).json({ success: true, data: result });
  } catch (e: any) {
    console.error('Fiat transfer API error:', e);
    res.status(500).json({ success: false, error: e.message || String(e) });
  }
}
