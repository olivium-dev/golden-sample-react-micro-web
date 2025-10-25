/**
 * Shared API client with authentication interceptors
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for httpOnly cookies
});

// Request interceptor - attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Single-flight refresh promise to avoid concurrent refresh calls
let refreshPromise: Promise<string> | null = null;

// Response interceptor - handle 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
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

        // Ensure only one refresh request is in-flight
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_URL}/api/auth/refresh`, {
              refresh_token: refreshToken,
            })
            .then((response) => {
              const { access_token, refresh_token: new_refresh_token } = response.data as any;
              localStorage.setItem('access_token', access_token);
              localStorage.setItem('refresh_token', new_refresh_token);
              // Broadcast token update
              window.dispatchEvent(new CustomEvent('auth:token-refreshed'));
              return access_token as string;
            })
            .finally(() => {
              // Allow new refresh after current finishes
              refreshPromise = null;
            });
        }

        const newAccessToken = await refreshPromise;

        // Retry the original request with the new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
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





