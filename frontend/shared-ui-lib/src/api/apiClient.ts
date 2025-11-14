/**
 * Shared API client with authentication interceptors
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Use empty base URL for relative paths - container app webpack proxy will route to BFF servers
// This avoids CORS issues by using the same origin as the frontend
const API_URL = 'https://localhost:7254/';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to false initially to avoid CORS issues
  timeout: 30000, // 30 second timeout
});

// Request interceptor - attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authorization token if available
    if (config.headers) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('🚨 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401, token refresh, and CORS errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    console.error(`❌ API Error: ${error.response?.status || 'Network'} ${error.config?.url}`, error.message);
    
    // Handle CORS errors
    if (!error.response && error.message.includes('Network Error')) {
      console.error('🚨 CORS Error detected - check server CORS configuration');
      const corsError = new Error('CORS Error: Unable to connect to server. Please check if the server allows cross-origin requests.');
      corsError.name = 'CORSError';
      return Promise.reject(corsError);
    }
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.dispatchEvent(new CustomEvent('auth:logout'));
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post('/api/users/refresh', {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: new_refresh_token } = response.data;

        // Store new tokens
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', new_refresh_token);

        // Broadcast token update
        window.dispatchEvent(new CustomEvent('auth:token-refreshed'));

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;





