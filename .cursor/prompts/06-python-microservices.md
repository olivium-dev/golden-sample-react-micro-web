# Phase 6: Backend Integration (Real Backend - No Mock Services)

## Overview

**IMPORTANT**: This project uses a **real production backend** at `https://dev-creamat.fds-1.com/gateway/`. 

**NO BFF ARCHITECTURE**: Frontends call the backend API directly without a Backend-for-Frontend layer.

**NO MOCK SERVICES**: The mock backend services in `/backend/mock-data-service` are deprecated and should not be used.

## Backend Architecture

### Real Backend Services
The production backend is hosted at `https://dev-creamat.fds-1.com` with the following structure:

```
https://dev-creamat.fds-1.com/gateway/
├── api/
│   ├── user/          # User management endpoints
│   ├── Order/         # Order management endpoints  
│   ├── Catalog/       # Catalog and product endpoints
│   ├── cdn/           # CDN and media endpoints
│   └── analytics/     # Analytics endpoints (if available)
```

### Authentication
- **Provider**: Firebase Authentication
- **Token Type**: JWT (JSON Web Tokens)
- **Token Storage**: localStorage (`access_token`, `refresh_token`)
- **Token Refresh**: Automatic via axios interceptors

## Frontend Integration

### API Client Configuration

All frontends use a shared API client from `shared-ui-lib/src/api/apiClient.ts`:

```typescript
import axios, { AxiosInstance } from 'axios';

const API_URL = 'https://dev-creamat.fds-1.com/gateway/';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
  timeout: 30000,
});

// Request interceptor - attach access token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('/api/users/refresh', {
          refresh_token: refreshToken,
        });
        
        const { access_token, refresh_token: new_refresh_token } = response.data;
        
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', new_refresh_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### Service-Specific API Clients

Each micro-frontend has its own API service that extends the shared client:

#### User Management API (`user-management-app/src/api.ts`)
```typescript
import { apiClient } from 'shared-ui-lib/src/api/apiClient';

const API_BASE_URL = 'https://dev-creamat.fds-1.com/gateway/api/user';

export const userApi = {
  getUsers: () => apiClient.get(`${API_BASE_URL}/users`),
  getUser: (id: string) => apiClient.get(`${API_BASE_URL}/users/${id}`),
  createUser: (data: any) => apiClient.post(`${API_BASE_URL}/users`, data),
  updateUser: (id: string, data: any) => apiClient.put(`${API_BASE_URL}/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`${API_BASE_URL}/users/${id}`),
};
```

#### Orders API (`orders-app/src/services/apiClient.ts`)
```typescript
import axios from 'axios';

const API_BASE_URL = 'https://dev-creamat.fds-1.com/gateway/api/Order';

export const ordersApi = {
  getUserOrders: (userId: string) => axios.get(`${API_BASE_URL}/User/${userId}`),
  getOrderById: (id: string) => axios.get(`${API_BASE_URL}/${id}`),
  createOrder: (data: any) => axios.post(API_BASE_URL, data),
  updateOrder: (id: string, data: any) => axios.put(`${API_BASE_URL}/${id}`, data),
  deleteOrder: (id: string) => axios.delete(`${API_BASE_URL}/${id}`),
};
```

#### Catalog API (`catalog-app/src/config/apiConfig.ts`)
```typescript
export const apiConfig = {
  development: {
    baseUrl: 'https://dev-creamat.fds-1.com',
    catalogApi: 'https://dev-creamat.fds-1.com/gateway/api/Catalog',
    cdnApi: 'https://dev-creamat.fds-1.com/gateway',
    timeout: 30000,
  },
  production: {
    baseUrl: 'https://dev-creamat.fds-1.com',
    catalogApi: 'https://dev-creamat.fds-1.com/gateway/api/Catalog',
    cdnApi: 'https://dev-creamat.fds-1.com/gateway',
    timeout: 30000,
  }
};
```

## API Endpoints Reference

### User Service
- **Base URL**: `/gateway/api/user`
- **Endpoints**:
  - `GET /users` - List all users
  - `GET /users/:id` - Get user by ID
  - `POST /users` - Create user
  - `PUT /users/:id` - Update user
  - `DELETE /users/:id` - Delete user
  - `POST /auth/login` - Login
  - `POST /auth/register` - Register
  - `POST /auth/refresh` - Refresh token

### Order Service
- **Base URL**: `/gateway/api/Order`
- **Endpoints**:
  - `GET /User/:userId` - Get orders for user
  - `GET /:id` - Get order by ID
  - `POST /` - Create order
  - `PUT /:id` - Update order
  - `DELETE /:id` - Delete order

### Catalog Service
- **Base URL**: `/gateway/api/Catalog`
- **Endpoints**:
  - `GET /Category/All/:pageSize/:pageNumber` - Get all categories
  - `GET /Product/:id` - Get product by ID
  - `GET /Products/:categoryId/:pageSize/:pageNumber` - Get products by category
  - `POST /Product` - Create product
  - `PUT /Product/:id` - Update product
  - `DELETE /Product/:id` - Delete product

### CDN Service
- **Base URL**: `/gateway/cdn` or `/gateway`
- **Endpoints**:
  - `GET /media/:path` - Get media file
  - `POST /upload` - Upload media file

## CORS Configuration

The backend at `https://dev-creamat.fds-1.com` must have CORS configured to allow requests from:
- `http://localhost:3000` (container)
- `http://localhost:3001` (user-management)
- `http://localhost:3002` (data-grid)
- `http://localhost:3003` (analytics)
- `http://localhost:3004` (settings)
- `http://localhost:3005` (orders)
- `http://localhost:3006` (catalog)
- Production domains

## Error Handling

### Common Error Responses

```typescript
interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: any;
}

// Handle errors consistently
try {
  const response = await apiClient.get('/endpoint');
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || 'Server error');
    } else if (error.request) {
      // No response received
      console.error('Network Error:', error.request);
      throw new Error('Network error - please check your connection');
    }
  }
  throw error;
}
```

## Testing Backend Integration

### Manual Testing
```bash
# Test health endpoint
curl https://dev-creamat.fds-1.com/gateway/health

# Test authentication
curl -X POST https://dev-creamat.fds-1.com/gateway/api/user/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# Test with authentication
curl https://dev-creamat.fds-1.com/gateway/api/user/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Automated Testing
Use the test scripts in `/tests` directory:
```bash
# Test backend APIs
./scripts/test-backend-apis.sh

# Test CORS
npm run test:backend-cors

# E2E tests
npm run test:all
```

## Environment Configuration

### Development (.env.development)
```env
REACT_APP_API_URL=https://dev-creamat.fds-1.com/gateway/
REACT_APP_FIREBASE_API_KEY=your-dev-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-dev-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

### Production (.env.production)
```env
REACT_APP_API_URL=https://dev-creamat.fds-1.com/gateway/
REACT_APP_FIREBASE_API_KEY=your-prod-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-prod-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

## Migration from Mock Backend

If you have code using the mock backend at `http://localhost:8000`, update it to use the real backend:

### Before (Mock Backend)
```typescript
const API_URL = 'http://localhost:8000';
```

### After (Real Backend)
```typescript
const API_URL = 'https://dev-creamat.fds-1.com/gateway/';
```

## Deprecated: Mock Backend Services

The following directories contain deprecated mock services and should not be used:
- `/backend/mock-data-service` - Deprecated mock FastAPI service
- `/backend/gateway-mock` - Deprecated mock gateway

These were used for initial development but are no longer maintained. All development and production should use the real backend at `https://dev-creamat.fds-1.com`.

## Security Considerations

### Authentication
- [ ] JWT tokens stored securely in localStorage
- [ ] Automatic token refresh implemented
- [ ] Logout clears all tokens
- [ ] Protected routes check for valid tokens

### API Security
- [ ] HTTPS enforced for all API calls
- [ ] CORS properly configured on backend
- [ ] Input validation on frontend
- [ ] Error messages don't expose sensitive data
- [ ] Rate limiting handled gracefully

## Monitoring & Debugging

### Network Debugging
Use browser DevTools Network tab to inspect:
- Request/response headers
- Status codes
- Response times
- CORS headers
- Authentication tokens

### Console Logging
The API client logs all requests:
```
🌐 API Request: GET /api/user/users
✅ API Response: 200 /api/user/users
❌ API Error: 401 /api/user/users
```

## Next Steps

1. Ensure all micro-frontends use the shared API client
2. Test all API integrations with the real backend
3. Verify Firebase authentication works end-to-end
4. Test error handling and token refresh
5. Remove any references to mock backend
6. Update documentation with actual API endpoints
7. Deploy to production with proper environment variables
