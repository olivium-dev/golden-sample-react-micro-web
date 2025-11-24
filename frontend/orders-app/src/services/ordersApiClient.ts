/**
 * Orders-specific API client that handles authentication gracefully
 * without triggering automatic logout
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getOrderServiceHeaders } from '../config/serviceAuth';

// Use the same base URL as shared API client
const API_URL = 'https://dev-creamat.fds-1.com/gateway/';

// Create axios instance for orders with service authentication headers
export const ordersApiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Service authentication headers required by the Order Service
    ...getOrderServiceHeaders(),
  },
  withCredentials: false,
  timeout: 30000, // 30 second timeout
});

// Request interceptor - attach access token and ensure service headers
ordersApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.headers) {
      // Ensure service authentication headers are always present
      const serviceHeaders = getOrderServiceHeaders();
      Object.assign(config.headers, serviceHeaders);
      
      // Add authorization token if available
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Orders API Request with token:', token.substring(0, 20) + '...');
      } else {
        console.warn('⚠️ No access token found for orders API request');
      }
      
      console.log('🔐 Service Auth Headers:', {
        'X-Service-API-Key': config.headers['X-Service-API-Key'],
        'X-Service-Token-Key': config.headers['X-Service-Token-Key']
      });
    }
    
    console.log(`📡 Orders API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Orders API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors gracefully without auto-logout
ordersApiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Orders API Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    console.error('❌ Orders API Error:', error.response?.status, error.response?.statusText);
    console.error('📍 Error URL:', error.config?.url);
    console.error('📄 Error Details:', error.response?.data);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error('🚫 Orders API: Authentication failed - user needs to log in');
      // Don't trigger automatic logout - let the component handle it
    }
    
    // Handle service authentication errors
    if (error.response?.status === 403 && error.response?.data?.error === 'Missing service authentication headers') {
      console.error('🔐 Orders API: Service authentication failed - missing or invalid service headers');
      console.error('Required headers: X-Service-API-Key, X-Service-Token-Key');
    }
    
    // Handle CORS errors
    if (!error.response && error.message.includes('Network Error')) {
      console.error('🚨 Orders API: CORS Error detected');
      const corsError = new Error('CORS Error: Unable to connect to server. Please check if the server allows cross-origin requests.');
      corsError.name = 'CORSError';
      return Promise.reject(corsError);
    }
    
    return Promise.reject(error);
  }
);

export default ordersApiClient;
