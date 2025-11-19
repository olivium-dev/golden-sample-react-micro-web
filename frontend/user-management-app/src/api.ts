/**
 * User Management API
 * Contains all API calls related to user management
 */

import axios from 'axios';
import { ErrorCapture } from '../../shared-ui-lib/src';

// Configure axios for CORS and HTTPS
axios.defaults.timeout = 30000; // 30 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Create axios instance for gateway API calls
const apiClient = axios.create({
  baseURL: 'https://dev-creamat.fds-1.com/gateway/api/user',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
  // Disable credentials for cross-origin requests to avoid CORS issues
  withCredentials: false,
});

// Add request interceptor for authentication and CORS handling
apiClient.interceptors.request.use(
  (config) => {
    // Add Bearer token if available
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add minimal required headers
    if (config.headers) {
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

// API Configuration
const API_BASE_URL = 'https://dev-creamat.fds-1.com/gateway/api/user';

// Types
export interface User {
  userId: string;
  email: string;
  username: string;
  profilePic?: string;
  dateOfBirth?: string;
  createdDate: string;
}

export interface GetAllUsersResponse {
  users: User[];
  totalCount: number;
  skip: number;
  limit: number;
}

export interface GetAllUsersParams {
  skip?: number;
  limit?: number;
  onActive?: boolean;
}

/**
 * Fetch all users from the API
 * @param params - Query parameters for pagination and filtering
 * @returns Promise with users data
 */
export const fetchAllUsers = async (params: GetAllUsersParams = {}): Promise<GetAllUsersResponse> => {
  const { skip = 0, limit = 50, onActive } = params;
  
  try {
    console.log('🔄 Fetching users from API...', { skip, limit, onActive });
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    
    if (onActive !== undefined) {
      queryParams.append('onActive', onActive.toString());
    }
    
    const response = await apiClient.get(`/all?${queryParams.toString()}`);
    
    // Handle the GetAllUsersResponse structure from the API
    const data: GetAllUsersResponse = {
      users: response.data?.users || [],
      totalCount: response.data?.totalCount || 0,
      skip: response.data?.skip || skip,
      limit: response.data?.limit || limit,
    };
    
    console.log('✅ Successfully fetched users:', data.users.length, 'users');
    return data;
    
  } catch (error: any) {
    console.error('❌ Failed to fetch users:', error);
    
    // Enhanced error handling for different types of errors
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - API server may not be running');
      throw new Error('API server is not accessible. Please check if the server is running on https://localhost:7254');
    }
    
    if (error.message?.includes('Network Error')) {
      console.error('❌ Network Error - likely CORS issue');
      throw new Error('CORS Error: Unable to connect to API server. Please check CORS configuration.');
    }
    
    if (error.response?.status === 404) {
      console.error('❌ API endpoint not found');
      throw new Error('API endpoint /api/user/all not found. Please check the API server configuration.');
    }
    
    if (error.response?.status === 500) {
      console.error('❌ Internal server error');
      throw new Error('Internal server error. Please check the API server logs.');
    }
    
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    ErrorCapture.captureApiError(error, `${API_BASE_URL}/all`, 'GET');
    throw new Error(`Failed to fetch users from API: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Get users with search functionality
 * @param searchQuery - Search term to filter users
 * @param params - Additional query parameters
 * @returns Promise with filtered users data
 */
export const searchUsers = async (
  searchQuery: string = '', 
  params: GetAllUsersParams = {}
): Promise<User[]> => {
  try {
    const response = await fetchAllUsers(params);
    
    // If no search query, return all users
    if (!searchQuery.trim()) {
      return response.users;
    }
    
    // Client-side filtering (could be moved to server-side in the future)
    const filteredUsers = response.users.filter(user =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    console.log('🔍 Search results:', filteredUsers.length, 'users found for query:', searchQuery);
    return filteredUsers;
    
  } catch (error) {
    console.error('❌ Failed to search users:', error);
    throw error;
  }
};

/**
 * API client configuration and utilities
 */
export const userApi = {
  fetchAll: fetchAllUsers,
  search: searchUsers,
  baseUrl: API_BASE_URL,
};

export default userApi;
