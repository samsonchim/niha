import { Router } from 'express';
import { handleBlockRadarWebhook, handleFlutterwaveWebhook } from '../services/webhook';

const router = Router();

router.post('/flutterwave', expressRawBody, async (req: any, res) => {
  try {
    const result = await handleFlutterwaveWebhook(req.headers, req.rawBody, req.body);
    res.json(result);
  } catch (e: any) {
    console.error('Flutterwave webhook error:', e);
    res.status(400).json({ error: e.message });
  }
});

router.post('/blockradar', async (req, res) => {
  try {
    const result = await handleBlockRadarWebhook(req.body);
    res.json(result);
  } catch (e: any) {
    console.error('BlockRadar webhook error:', e);
    res.status(400).json({ error: e.message });
  }
});

// Middleware to capture raw body for signature verification
function expressRawBody(req: any, res: any, next: any) {
  req.rawBody = '';
  req.setEncoding('utf8');
  req.on('data', (chunk: string) => { req.rawBody += chunk; });
  req.on('end', () => {
    try {
      req.body = JSON.parse(req.rawBody || '{}');
    } catch {
      req.body = {};
    }
    next();
  });
}

export default router;
