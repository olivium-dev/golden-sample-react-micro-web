# API Configuration

This document explains how to configure API URLs and settings for the Creamati Catalog Management System.

## Configuration File

The API configuration is managed in `apiConfig.ts`. This file contains environment-specific settings for API endpoints and connection parameters.

## Environment Configuration

The system supports three environments:

### Development
- **Base URL**: `https://localhost:44355`
- **Catalog API**: `https://localhost:44355`
- **Timeout**: 30 seconds
- **Retry Attempts**: 3

### Staging
- **Base URL**: `https://staging-api.creamati.com`
- **Catalog API**: `https://staging-catalog-api.creamati.com`
- **Timeout**: 30 seconds
- **Retry Attempts**: 3

### Production
- **Base URL**: `https://api.creamati.com`
- **Catalog API**: `https://catalog-api.creamati.com`
- **Timeout**: 30 seconds
- **Retry Attempts**: 3

## Environment Detection

The system automatically detects the current environment using:

1. `process.env.NODE_ENV` (Node.js environment variable)
2. `process.env.REACT_APP_ENV` (React app environment variable)
3. `window.APP_ENV` (Global window variable set by build process)
4. Defaults to `development` if none are found

## Usage

### Importing Configuration

```typescript
// Import the entire configuration object
import { apiConfig } from '../config/apiConfig';

// Import specific values
import { API_BASE_URL, CATALOG_API_URL, API_TIMEOUT } from '../config/apiConfig';

// Import configuration getter function
import { getApiConfig } from '../config/apiConfig';
```

### Using in API Services

```typescript
import { CATALOG_API_URL, API_TIMEOUT } from '../config/apiConfig';

const apiClient = axios.create({
  baseURL: CATALOG_API_URL,
  timeout: API_TIMEOUT,
  // ... other config
});
```

## Customizing Configuration

### Adding New Environments

To add a new environment (e.g., `testing`):

```typescript
const configurations: Record<string, ApiConfig> = {
  // ... existing environments
  testing: {
    baseUrl: 'https://test-api.creamati.com',
    catalogApi: 'https://test-catalog-api.creamati.com',
    timeout: 30000,
    retryAttempts: 3,
  },
};
```

### Adding New Configuration Options

To add new configuration options, update the `ApiConfig` interface:

```typescript
export interface ApiConfig {
  baseUrl: string;
  catalogApi: string;
  timeout: number;
  retryAttempts: number;
  // Add new options here
  enableLogging: boolean;
  maxConcurrentRequests: number;
}
```

Then update all environment configurations to include the new options.

### Environment Variables

You can override configuration using environment variables:

```bash
# For React apps
REACT_APP_ENV=production npm start

# For Node.js
NODE_ENV=production npm start
```

### Build-time Configuration

For build-time configuration, set the `APP_ENV` global variable:

```javascript
// In webpack config or similar
new webpack.DefinePlugin({
  'window.APP_ENV': JSON.stringify('production')
});
```

## Migration from Hardcoded URLs

The system has been migrated from hardcoded URLs to this configuration system:

**Before:**
```typescript
declare const API_BASE_URL: string;
const CATALOG_API = API_BASE_URL || 'https://localhost:44355';
```

**After:**
```typescript
import { CATALOG_API_URL, API_TIMEOUT } from '../config/apiConfig';
```

## Benefits

1. **Environment Management**: Easy switching between development, staging, and production
2. **Centralized Configuration**: All API settings in one place
3. **Type Safety**: TypeScript interfaces ensure configuration consistency
4. **Flexibility**: Easy to add new environments or configuration options
5. **Build Integration**: Works with various build systems and deployment strategies

## Troubleshooting

### Configuration Not Loading

If configuration is not loading correctly:

1. Check that the environment variable is set correctly
2. Verify the environment name matches exactly (case-sensitive)
3. Check browser console for configuration warnings
4. Ensure the configuration file is properly imported

### Wrong Environment Detected

If the wrong environment is being detected:

1. Check environment variables in your build process
2. Verify `window.APP_ENV` is set correctly (for browser builds)
3. Add logging to see which environment detection method is being used

### API Requests Failing

If API requests are failing after configuration changes:

1. Verify the API URLs are correct for your environment
2. Check that the timeout values are appropriate
3. Ensure CORS settings are configured on the API server
4. Verify authentication tokens are being added correctly

## Examples

### Development Setup

```bash
# Set environment for development
export NODE_ENV=development
npm start
```

### Production Build

```bash
# Set environment for production build
export REACT_APP_ENV=production
npm run build
```

### Custom Environment

```typescript
// Override environment detection
import { configurations } from '../config/apiConfig';

const customConfig = {
  ...configurations.development,
  baseUrl: 'https://my-custom-api.com',
};
```
