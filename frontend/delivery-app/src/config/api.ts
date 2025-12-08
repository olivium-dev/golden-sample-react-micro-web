// API Configuration for Delivery App

export const API_CONFIG = {
  // Main backend API (existing mock data service)
  BACKEND_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  
  // Delivery Gateway API (new delivery service)
  DELIVERY_GATEWAY_URL: process.env.REACT_APP_DELIVERY_API_URL || 'https://dev-creamat.fds-1.com/gateway/api/Delivery',
  
  // Request timeout
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Retry configuration
  RETRY_CONFIG: {
    attempts: 3,
    delay: 1000,
  },
};

export default API_CONFIG;



