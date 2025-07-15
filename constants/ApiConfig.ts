// API Configuration
const API_CONFIG = {
  // Base URL for your API
  BASE_URL: 'https://f142675f2ac4.ngrok-free.app',
  
  // API Endpoints
  ENDPOINTS: {
    SIGNUP: '/api/signup',
    LOGIN: '/api/login',
    VERIFY: '/api/verify',
    VERIFY_STATUS: '/api/verify-status',
    FORGOT_PASSWORD: '/api/forgot-password',
    RESET_PASSWORD: '/api/reset-password',
    PROFILE: '/api/profile',
    // Add more endpoints as needed
  },
  
  // Helper function to get full URL
  getUrl: (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`,
  
  // Common URLs (ready to use)
  URLS: {
    get SIGNUP() { return `${API_CONFIG.BASE_URL}/api/signup`; },
    get LOGIN() { return `${API_CONFIG.BASE_URL}/api/login`; },
    get VERIFY() { return `${API_CONFIG.BASE_URL}/api/verify`; },
    get VERIFY_STATUS() { return `${API_CONFIG.BASE_URL}/api/verify-status`; },
    get FORGOT_PASSWORD() { return `${API_CONFIG.BASE_URL}/api/forgot-password`; },
    get RESET_PASSWORD() { return `${API_CONFIG.BASE_URL}/api/reset-password`; },
    get PROFILE() { return `${API_CONFIG.BASE_URL}/api/profile`; },
  }
};

export default API_CONFIG;
