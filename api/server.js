const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route to test if server is working
app.get('/', (req, res) => {
  res.json({
    message: 'Niha API is working! 🚀',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    status: 'success',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Import and use auth routes BEFORE the general /api route
app.use('/api', require('./routes/auth'));

// Wallet balance endpoint
const BlockchainBalanceFetcher = require('./utils/blockchainBalances');
const balanceFetcher = new BlockchainBalanceFetcher();

app.post('/api/wallet-balances', async (req, res) => {
  try {
    console.log('🔄 Wallet balance request received:', req.body);
    
    const { wallets } = req.body;
    
    if (!wallets || !Array.isArray(wallets)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: wallets array is required'
      });
    }

    console.log(`📊 Fetching balances for ${wallets.length} wallets...`);
    
    const balances = await balanceFetcher.batchFetchBalances(wallets);
    
    console.log('✅ Balances fetched successfully:', balances);
    
    res.json({
      success: true,
      balances,
      timestamp: new Date().toISOString(),
      count: balances.length
    });
    
  } catch (error) {
    console.error('❌ Wallet balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet balances',
      error: error.message
    });
  }
});

// Development test user route (only in development)
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use('/api', require('./test-user-route'));
  console.log('🧪 Test user routes enabled for development');
}

// DVA Management Interface
app.get('/delete-dva', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DVA Management - Niha</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                padding: 2rem;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                width: 100%;
                max-width: 500px;
            }
            .header {
                text-align: center;
                margin-bottom: 2rem;
            }
            .header h1 {
                color: #333;
                margin: 0;
                font-size: 2rem;
            }
            .header p {
                color: #666;
                margin: 0.5rem 0 0 0;
            }
            .form-group {
                margin-bottom: 1.5rem;
            }
            label {
                display: block;
                margin-bottom: 0.5rem;
                color: #333;
                font-weight: 500;
            }
            input[type="text"] {
                width: 100%;
                padding: 12px;
                border: 2px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
                transition: border-color 0.3s;
            }
            input[type="text"]:focus {
                outline: none;
                border-color: #667eea;
            }
            .btn {
                width: 100%;
                padding: 12px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                transition: background 0.3s;
                margin-bottom: 1rem;
            }
            .btn:hover {
                background: #c82333;
            }
            .btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            .result {
                margin-top: 1rem;
                padding: 1rem;
                border-radius: 5px;
                display: none;
            }
            .result.success {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }
            .result.error {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }
            .loading {
                text-align: center;
                display: none;
            }
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 1rem;
                border-radius: 5px;
                margin-bottom: 1rem;
            }
            .footer {
                text-align: center;
                margin-top: 2rem;
                color: #666;
                font-size: 0.9rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🗑️ DVA Management</h1>
                <p>Delete/Disable Virtual Accounts</p>
            </div>
            
            <div class="warning">
                <strong>⚠️ Warning:</strong> This action will permanently delete the virtual account from Flutterwave and mark it as inactive in the database.
            </div>
            
            <form id="deleteDvaForm">
                <div class="form-group">
                    <label for="accountNumber">Virtual Account Number:</label>
                    <input type="text" id="accountNumber" name="accountNumber" placeholder="Enter DVA number (e.g., 1234567890)" required>
                </div>
                
                <button type="submit" class="btn" id="deleteBtn">Delete Virtual Account</button>
            </form>
            
            <div class="loading" id="loading">
                <p>🔄 Deleting virtual account...</p>
            </div>
            
            <div class="result" id="result"></div>
            
            <div class="footer">
                <p>Niha API Management Interface</p>
                <p><a href="/">← Back to API Home</a></p>
            </div>
        </div>

        <script>
            document.getElementById('deleteDvaForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const accountNumber = document.getElementById('accountNumber').value.trim();
                const deleteBtn = document.getElementById('deleteBtn');
                const loading = document.getElementById('loading');
                const result = document.getElementById('result');
                
                if (!accountNumber) {
                    showResult('Please enter a valid account number', 'error');
                    return;
                }
                
                // Show loading state
                deleteBtn.disabled = true;
                loading.style.display = 'block';
                result.style.display = 'none';
                
                try {
                    const response = await fetch('/api/delete-dva/' + accountNumber, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        showResult('✅ Virtual account deleted successfully!\\nAccount: ' + accountNumber, 'success');
                        document.getElementById('accountNumber').value = '';
                    } else {
                        showResult('❌ Failed to delete virtual account:\\n' + data.message, 'error');
                    }
                } catch (error) {
                    showResult('❌ Network error: ' + error.message, 'error');
                }
                
                // Hide loading state
                deleteBtn.disabled = false;
                loading.style.display = 'none';
            });
            
            function showResult(message, type) {
                const result = document.getElementById('result');
                result.textContent = message;
                result.className = 'result ' + type;
                result.style.display = 'block';
            }
        </script>
    </body>
    </html>
  `);
});

// API info route (this will only match GET /api, not /api/signup)
app.get('/api', (req, res) => {
  res.json({
    message: 'Niha API endpoints',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api',
      'GET /delete-dva - DVA Management Interface',
      'POST /api/signup',
      'POST /api/login',
      'POST /api/create-virtual-account',
      'DELETE /api/delete-dva/:accountNumber'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Niha API server is running on port ${PORT}`);
  console.log(`📱 Local: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
