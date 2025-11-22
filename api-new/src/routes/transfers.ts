import { Router } from 'express';
import { handleCryptoTransfer, handleFiatTransfer } from '../services/transfers';

const router = Router();

router.post('/fiat', async (req, res) => {
  try {
    const { userId, amount, recipientAccount, bankCode, narration } = req.body;
    if (!userId || !amount || !recipientAccount || !bankCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await handleFiatTransfer(userId, Number(amount), recipientAccount, bankCode, narration);
    res.json({ success: true, data: result });
  } catch (e: any) {
    console.error('Fiat transfer error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/crypto', async (req, res) => {
  try {
    const { userId, toAddress, amount, blockchain } = req.body;
    if (!userId || !toAddress || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await handleCryptoTransfer(userId, toAddress, amount, blockchain);
    res.json({ success: true, data: result });
  } catch (e: any) {
    console.error('Crypto transfer error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
