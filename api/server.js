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

// API info route (this will only match GET /api, not /api/signup)
app.get('/api', (req, res) => {
  res.json({
    message: 'Niha API endpoints',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api',
      'POST /api/signup'
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
