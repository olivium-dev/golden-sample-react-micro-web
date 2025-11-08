// API Configuration
// This file contains all API-related configuration settings

export interface ApiConfig {
  baseUrl: string;
  catalogApi: string;
  cdnApi: string;
  timeout: number;
  retryAttempts: number;
}

// Environment-specific configurations
const configurations: Record<string, ApiConfig> = {
  development: {
    baseUrl: 'https://dev-creamat.fds-1.com', //, 'https://localhost:44355'
    catalogApi: 'https://dev-creamat.fds-1.com/catalog', // ,
    cdnApi: 'https://dev-creamat.fds-1.com/cdn',//', //  'https://localhost:7126' CDN API endpoint
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },
  staging: {
    baseUrl: 'https://dev-creamat.fds-1.com',
    catalogApi: 'https://dev-creamat.fds-1.com/catalog',
    cdnApi: 'https://dev-creamat.fds-1.com/cdn',
    timeout: 30000,
    retryAttempts: 3,
  },
  production: {
    baseUrl: 'https://dev-creamat.fds-1.com',
    catalogApi: 'https://dev-creamat.fds-1.com/catalog',
    cdnApi: 'https://dev-creamat.fds-1.com/cdn',
    timeout: 30000,
    retryAttempts: 3,
  },
};

// Get current environment from environment variables or default to development
const getCurrentEnvironment = (): string => {
  // Check for environment variables (common patterns)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV || process.env.REACT_APP_ENV || 'development';
  }
  
  // Check for global variables (if set by build process)
  if (typeof window !== 'undefined' && (window as any).APP_ENV) {
    return (window as any).APP_ENV;
  }
  
  // Default to development
  return 'development';
};

// Get configuration for current environment
export const getApiConfig = (): ApiConfig => {
  const environment = getCurrentEnvironment();
  const config = configurations[environment];
  
  if (!config) {
    console.warn(`No configuration found for environment: ${environment}. Using development config.`);
    return configurations.development;
  }
  
  return config;
};

// Export the current configuration
export const apiConfig = getApiConfig();

// Export individual values for convenience
export const API_BASE_URL = apiConfig.baseUrl;
export const CATALOG_API_URL = apiConfig.catalogApi;
export const CDN_API_URL = apiConfig.cdnApi;
export const API_TIMEOUT = apiConfig.timeout;
export const API_RETRY_ATTEMPTS = apiConfig.retryAttempts;

// Export default configuration
export default apiConfig;
