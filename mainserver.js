process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message, err.stack);
  // process.exit(1); // Removed to allow error visibility
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // process.exit(1); // Removed to allow error visibility
});

const express = require('express');
const dotenv = require('dotenv');
const moralisService = require('./services/moralisService');
const tatumService = require('./services/tatumService');

console.log("Modules loaded successfully");

dotenv.config();
console.log("dotenv configured");

const app = express();
app.use(express.json());

// === ROUTES ===

// Create a non-custodial wallet (EVM)
app.get('/wallet/create', async (req, res) => {
  console.log("Handling /wallet/create");
  try {
    const wallet = moralisService.createWallet();
    res.json(wallet);
  } catch (error) {
    console.error("Error in /wallet/create:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Create a custodial Tatum wallet (for testing)
app.get('/wallet/custodial', async (req, res) => {
  console.log("Handling /wallet/custodial");
  try {
    const wallet = await tatumService.createWallet();
    res.json(wallet);
  } catch (error) {
    console.error("Error in /wallet/custodial:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get balance
app.get('/wallet/balance/:address/:chain', async (req, res) => {
  console.log("Handling /wallet/balance");
  try {
    const { address, chain } = req.params;
    const balance = await moralisService.getBalance(address, chain);
    res.json(balance);
  } catch (error) {
    console.error("Error in /wallet/balance:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Send transaction (non-custodial)
app.post('/wallet/send', async (req, res) => {
  console.log("Handling /wallet/send", req.body);
  const { to, amount, privateKey, chain } = req.body;

  // Validate request body
  if (!to) {
    console.error("Validation Error: 'to' address is missing");
    return res.status(400).json({ error: "'to' address is required" });
  }
  if (!amount) {
    console.error("Validation Error: 'amount' is missing");
    return res.status(400).json({ error: "'amount' is required" });
  }
  if (!privateKey) {
    console.error("Validation Error: 'privateKey' is missing");
    return res.status(400).json({ error: "'privateKey' is required" });
  }
  if (!chain) {
    console.error("Validation Error: 'chain' is missing");
    return res.status(400).json({ error: "'chain' is required" });
  }

  try {
    const tx = await moralisService.sendTransaction(to, amount, privateKey, chain);
    res.json(tx);
  } catch (error) {
    console.error("Error in /wallet/send:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Send ERC-20 Token
app.post('/wallet/send-token', async (req, res) => {
  try {
    const { to, amount, tokenAddress, privateKey, chain } = req.body;
    const result = await moralisService.sendToken(to, amount, tokenAddress, privateKey, chain);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transaction History
app.get('/wallet/history/:address/:chain', async (req, res) => {
  try {
    const { address, chain } = req.params;
    const result = await moralisService.getTransactionHistory(address, chain);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Estimate Gas Fee
app.get('/wallet/estimate-gas/:to/:amount/:chain', async (req, res) => {
  try {
    const { to, amount, chain } = req.params;
    const result = await moralisService.estimateGas(to, amount, chain);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send transaction (custodial Tatum)
app.post('/wallet/send-custodial', async (req, res) => {
  console.log("Handling /wallet/send-custodial", req.body);
  try {
    const { from, to, amount, currency } = req.body;
    const tx = await tatumService.sendTransaction(from, to, amount, currency);
    res.json(tx);
  } catch (error) {
    console.error("Error in /wallet/send-custodial:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Commented out to prevent startup crashes due to invalid hardcoded values
/*
app.get('/test-send', async (req, res) => {
  try {
    console.log("Handling /test-send");
    const result = await moralisService.sendTransaction(
      '0xReceiverAddress',
      '0.001',
      '0xYourPrivateKey',
      'sepolia'
    );
    res.json(result);
  } catch (error) {
    console.error("Error in /test-send:", error.message);
    res.status(500).json({ error: error.message });
  }
});
*/