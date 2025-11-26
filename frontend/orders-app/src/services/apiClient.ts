import axios from 'axios';

// Call gateway API directly
const API_BASE_URL = 'https://dev-creamat.fds-1.com/gateway/api/order';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'text/plain',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    // Add Bearer token authorization
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 API Request with token:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No access token found in localStorage');
    }
    console.log('📡 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.statusText);
    console.error('📍 Error URL:', error.config?.url);
    console.error('📄 Error Details:', error.response?.data);
    
    // Handle 401 Unauthorized specifically
    if (error.response?.status === 401) {
      console.error('🚫 Authentication failed - token may be invalid or expired');
      // Optionally clear the invalid token
      // localStorage.removeItem('access_token');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
