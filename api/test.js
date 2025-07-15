module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple API response
  const response = {
    message: 'Niha API is working! 🚀 (JS version)',
    timestamp: new Date().toISOString(),
    method: req.method || 'GET',
    path: req.url || '/api',
    status: 'success'
  };

  res.status(200).json(response);
};
