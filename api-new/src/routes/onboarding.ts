import { Router } from 'express';
import { runOnboarding } from '../services/onboarding';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { userId, email, fullName } = req.body;
    if (!userId || !email) return res.status(400).json({ error: 'userId and email required' });
    const result = await runOnboarding(userId, email, fullName);
    res.json({ success: true, data: result });
  } catch (e: any) {
    console.error('Onboarding route error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
