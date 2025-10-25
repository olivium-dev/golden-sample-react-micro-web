// Mock shared-ui-lib for standalone testing

// Mock ErrorCapture
export const ErrorCapture = {
  initialize: () => console.log('Mock ErrorCapture initialized'),
  captureApiError: (error: any, endpoint: string, method: string) => {
    console.warn('Mock ErrorCapture - API Error:', { error, endpoint, method });
  },
  captureReactError: (error: Error, errorInfo: any) => {
    console.warn('Mock ErrorCapture - React Error:', { error, errorInfo });
  },
  captureModuleFederationError: (module: string, error: Error) => {
    console.warn('Mock ErrorCapture - Module Federation Error:', { module, error });
  }
};

// Mock ErrorBoundary
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  componentName: string;
  fallback?: React.ComponentType<any>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  componentName, 
  onError 
}) => {
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setHasError(true);
      if (onError) {
        onError(new Error(error.message), { componentStack: error.filename || '' });
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);
  
  if (hasError) {
    return React.createElement('div', 
      { style: { padding: '20px', border: '1px solid red', margin: '10px' } },
      React.createElement('h3', null, `Error in ${componentName}`),
      React.createElement('p', null, 'Something went wrong in this component.'),
      React.createElement('button', 
        { onClick: () => setHasError(false) }, 
        'Retry'
      )
    );
  }
  
  return React.createElement(React.Fragment, null, children);
};

// Mock apiClient
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Mock auth interceptor
apiClient.interceptors.request.use(
  (config) => {
    // For standalone testing, we'll use a mock token
    const mockToken = 'mock-jwt-token-for-standalone-testing';
    if (config.headers) {
      config.headers.Authorization = `Bearer ${mockToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mock response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('Mock apiClient - Request failed:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

// Mock useAuth hook
export const useAuth = () => ({
  isAuthenticated: true,
  isLoading: false,
  user: {
    id: 1,
    email: 'mock@example.com',
    name: 'Mock User',
    role: 'admin'
  },
  login: async (credentials: any) => {
    console.log('Mock login:', credentials);
    return Promise.resolve();
  },
  logout: async () => {
    console.log('Mock logout');
    return Promise.resolve();
  },
  refreshToken: async () => {
    console.log('Mock token refresh');
    return Promise.resolve();
  },
  clearError: () => console.log('Mock clear error')
});

// Mock AuthProvider
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

// Mock other common exports
export const useErrorMonitor = () => ({
  errors: [],
  stats: { total: 0, byType: {}, bySeverity: {} },
  clearErrors: () => console.log('Mock clear errors'),
  refreshErrors: () => console.log('Mock refresh errors'),
  filter: undefined
});

// Re-export MUI components for convenience - but avoid conflicts
export * from '@mui/material';
// Don't re-export @mui/icons-material to avoid conflicts - import directly in components
