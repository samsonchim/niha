export default function handler(req: any, res: any) {
  try {
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
      message: 'Niha API is working! 🚀',
      timestamp: new Date().toISOString(),
      method: req.method || 'GET',
      path: req.url || '/api',
      status: 'success',
      environment: process.env.NODE_ENV || 'development'
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
}
