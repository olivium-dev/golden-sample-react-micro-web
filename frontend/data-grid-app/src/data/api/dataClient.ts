/**
 * API Client Configuration
 * Axios instance configured for data service
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const dataClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds for debugging
  headers: {
    'Content-Type': 'application/json',
  },
  // Add additional debugging options
  validateStatus: function (status) {
    return status < 500; // Accept any status code less than 500
  },
});

// Auto-login function
const autoLogin = async () => {
  try {
    const response = await axios.post('http://localhost:8000/api/auth/login', {
      email: "admin@example.com",
      password: "admin123"
    });
    const token = response.data.access_token;
    localStorage.setItem('access_token', token);
    return token;
  } catch (error) {
    console.error('Auto-login failed:', error);
    return null;
  }
};

// Request interceptor with auto-refresh
dataClient.interceptors.request.use(
  async (config) => {
    // Skip auth for login requests to prevent loops
    if (config.url?.includes('/auth/login')) {
      return config;
    }
    
    let token = localStorage.getItem('access_token');
    if (!token) {
      token = await autoLogin();
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with auto-refresh
dataClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Skip retry for login requests to prevent loops
    if (error.config?.url?.includes('/auth/login') || error.config?._retry) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      error.config._retry = true; // Mark as retried
      const token = await autoLogin();
      if (token) {
        error.config.headers.Authorization = `Bearer ${token}`;
        return dataClient.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

