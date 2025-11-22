import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import onboardingRoute from './routes/onboarding';
import transfersRoute from './routes/transfers';
import webhookRoute from './routes/webhook';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/onboarding', onboardingRoute);
app.use('/transfer', transfersRoute);
app.use('/webhooks', webhookRoute);

const port = Number(process.env.PORT || 3000);
// Bind to 0.0.0.0 so other devices on LAN (e.g., emulator/phone) can reach it via machine IP.
app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on port ${port}. Access via http://<YOUR_MACHINE_IP>:${port}`);
});
