import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Use 'access_token' to match the shared authService
    const token = localStorage.getItem('access_token');
    console.log('🔍 [Delivery apiClient] Token check:', token ? `Found (${token.substring(0, 20)}...)` : 'NOT FOUND');
    console.log('🔍 [Delivery apiClient] Request URL:', config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ [Delivery apiClient] Authorization header added');
    } else {
      console.error('❌ [Delivery apiClient] NO TOKEN - Request will fail with 401');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove both tokens to match authService
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Redirect to home (container will show login)
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
