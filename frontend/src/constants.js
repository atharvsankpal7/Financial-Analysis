// API Configuration
export const BACKEND_URL = 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  USER: '/api/user',
  RECOMMENDATION: '/api/recommendation',
  MARKET: '/api/market',
  PORTFOLIO_OPERATION: '/api/portfolio/operation',
  USER_HISTORY: '/api/user'
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint, params = '') => {
  return `${BACKEND_URL}${endpoint}${params}`;
};