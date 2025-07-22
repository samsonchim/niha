// API Configuration
const API_CONFIG = {
  // Base URL for your API
  BASE_URL: 'https://975601a12c38.ngrok-free.app',
  
  // API Endpoints
  ENDPOINTS: {
    SIGNUP: '/api/signup',
    LOGIN: '/api/login',
    VERIFY: '/api/verify',
    VERIFY_STATUS: '/api/verify-status',
    CREATE_VIRTUAL_ACCOUNT: '/api/create-virtual-account',
    FIAT_ACCOUNT: '/api/fiat-account',
    GET_SEED_PHRASE: '/api/get-seed-phrase',
    USER_WALLETS: '/api/user-wallets',
    WALLET_BALANCES: '/api/wallet-balances',
    FORGOT_PASSWORD: '/api/forgot-password',
    RESET_PASSWORD: '/api/reset-password',
    PROFILE: '/api/profile',
    TEST_FLUTTERWAVE: '/api/test-flutterwave',
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
    get CREATE_VIRTUAL_ACCOUNT() { return `${API_CONFIG.BASE_URL}/api/create-virtual-account`; },
    get FIAT_ACCOUNT() { return `${API_CONFIG.BASE_URL}/api/fiat-account`; },
    get GET_SEED_PHRASE() { return `${API_CONFIG.BASE_URL}/api/get-seed-phrase`; },
    get USER_WALLETS() { return `${API_CONFIG.BASE_URL}/api/user-wallets`; },
    get WALLET_BALANCES() { return `${API_CONFIG.BASE_URL}/api/wallet-balances`; },
    get FORGOT_PASSWORD() { return `${API_CONFIG.BASE_URL}/api/forgot-password`; },
    get RESET_PASSWORD() { return `${API_CONFIG.BASE_URL}/api/reset-password`; },
    get PROFILE() { return `${API_CONFIG.BASE_URL}/api/profile`; },
    get TEST_FLUTTERWAVE() { return `${API_CONFIG.BASE_URL}/api/test-flutterwave`; },
  }
};

export default API_CONFIG;
