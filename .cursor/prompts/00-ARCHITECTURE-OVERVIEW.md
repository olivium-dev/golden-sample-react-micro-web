# Creamati CMS - Micro-Frontend Architecture Overview

## Architecture Decision: No BFF Pattern

**IMPORTANT**: This project does **NOT** use the Backend-for-Frontend (BFF) architecture pattern.

### Current Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (localhost:3000)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Container App (Host)                       │  │
│  │  - React Router                                      │  │
│  │  - MUI Theme Provider                                │  │
│  │  - Firebase Authentication                           │  │
│  │  - Module Federation Host                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐               │
│         │                 │                 │               │
│    ┌────▼────┐       ┌────▼────┐      ┌────▼────┐         │
│    │ User    │       │ Orders  │      │ Catalog │         │
│    │ Mgmt    │       │ App     │      │ App     │         │
│    │ :3001   │       │ :3005   │      │ :3006   │         │
│    └─────────┘       └─────────┘      └─────────┘         │
│                                                              │
│    ┌─────────┐       ┌─────────┐      ┌─────────┐         │
│    │ Data    │       │Analytics│      │Settings │         │
│    │ Grid    │       │ App     │      │ App     │         │
│    │ :3002   │       │ :3003   │      │ :3004   │         │
│    └─────────┘       └─────────┘      └─────────┘         │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ Direct API Calls (HTTPS)
                       │ NO BFF Layer
                       │
                       ▼
        ┌──────────────────────────────┐
        │  Real Backend (Production)    │
        │  https://dev-creamat.fds-1.com│
        │                               │
        │  /gateway/api/user            │
        │  /gateway/api/Order           │
        │  /gateway/api/Catalog         │
        │  /gateway/cdn                 │
        └───────────────────────────────┘
```

## Micro-Frontends

### 1. Container App (Port 3000)
- **Role**: Host application
- **Technology**: React + TypeScript + MUI + Module Federation
- **Responsibilities**:
  - Routing and navigation
  - Theme management
  - Firebase authentication
  - Loading remote micro-frontends
  - Shared state management

### 2. User Management App (Port 3001)
- **Role**: User CRUD and authentication
- **Exposes**: `./UserManagementPage`
- **Backend**: `/gateway/api/user`
- **Features**:
  - Firebase login/register
  - User list with MUI Data Grid
  - User CRUD operations

### 3. Data Grid App (Port 3002)
- **Role**: Generic data display
- **Exposes**: `./DataGridPage`
- **Features**:
  - MUI Data Grid
  - Data filtering and sorting
  - Export functionality

### 4. Analytics App (Port 3003)
- **Role**: Analytics and metrics dashboard
- **Exposes**: `./AnalyticsPage`
- **Backend**: `/gateway/api/analytics`
- **Features**:
  - MUI Charts
  - Real-time metrics
  - Data visualization

### 5. Settings App (Port 3004)
- **Role**: Application settings
- **Exposes**: `./SettingsPage`
- **Features**:
  - User preferences
  - Configuration management

### 6. Orders App (Port 3005)
- **Role**: Order management
- **Exposes**: `./OrdersPage`
- **Backend**: `/gateway/api/Order`
- **Features**:
  - Order list with MUI Data Grid
  - Order CRUD operations
  - Status tracking

### 7. Catalog App (Port 3006)
- **Role**: Product catalog
- **Exposes**: `./CatalogPage`
- **Backend**: `/gateway/api/Catalog`, `/gateway/cdn`
- **Features**:
  - Product browsing
  - Category management
  - Image gallery

## Technology Stack

### Frontend
- **Framework**: React 18.2.0
- **Language**: TypeScript 4.9+
- **UI Library**: Material-UI (MUI) v5
- **Module Federation**: Webpack 5
- **Routing**: React Router v6
- **State Management**: React Context + Hooks
- **Authentication**: Firebase Authentication
- **HTTP Client**: Axios
- **Charts**: MUI X Charts
- **Data Grid**: MUI X Data Grid

### Backend (External)
- **URL**: https://dev-creamat.fds-1.com
- **Architecture**: Microservices (not managed by this repo)
- **Authentication**: JWT tokens from Firebase
- **API Gateway**: `/gateway/`

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Webpack 5
- **Testing**: Playwright
- **Linting**: ESLint
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Traefik v2.10

## Key Architectural Decisions

### 1. No BFF Pattern ❌
**Decision**: Frontend calls backend API directly

**Rationale**:
- Simpler architecture
- Fewer moving parts
- Direct communication reduces latency
- Backend already has proper CORS configuration

**Trade-offs**:
- ✅ Simpler deployment
- ✅ Fewer services to maintain
- ✅ Lower infrastructure costs
- ❌ Less control over API responses
- ❌ No request/response transformation layer

### 2. Module Federation ✅
**Decision**: Use Webpack Module Federation for micro-frontends

**Benefits**:
- Runtime integration (no build-time coupling)
- Independent deployments
- Shared dependencies (React, MUI)
- Lazy loading of remotes

### 3. Material-UI Only ✅
**Decision**: Use ONLY MUI components (no custom UI libraries)

**Benefits**:
- Consistent design system
- Accessibility built-in
- Responsive by default
- Rich component library
- Good documentation

### 4. Firebase Authentication ✅
**Decision**: Use Firebase for authentication

**Benefits**:
- Easy integration
- Secure token management
- Multiple auth providers
- Built-in token refresh

### 5. Direct Backend Calls ✅
**Decision**: Call https://dev-creamat.fds-1.com/gateway/ directly

**Implementation**:
- Shared API client in `shared-ui-lib`
- Axios interceptors for auth tokens
- Automatic token refresh
- Consistent error handling

## Development Workflow

### Local Development
```bash
# Start all services
./run.sh

# Stop all services
./stop.sh

# Access applications
# Container: http://localhost:3000
# User Management: http://localhost:3001
# Data Grid: http://localhost:3002
# Analytics: http://localhost:3003
# Settings: http://localhost:3004
# Orders: http://localhost:3005
# Catalog: http://localhost:3006
```

### Docker Development
```bash
# Start with Traefik (single entry point)
docker-compose -f docker-compose.bff.traefik.yml up -d

# Access via Traefik
# All apps: http://localhost
# Traefik Dashboard: http://localhost:8080
```

### Production Deployment
```bash
# Build all apps
npm run build:all

# Deploy with Docker Compose
docker-compose -f docker-compose.bff.traefik.prod.yml up -d
```

## File Structure
```
creamati-cms/
├── frontend/
│   ├── container/              # Host app (port 3000)
│   ├── user-management-app/    # Port 3001
│   ├── data-grid-app/          # Port 3002
│   ├── analytics-app/          # Port 3003
│   ├── settings-app/           # Port 3004
│   ├── orders-app/             # Port 3005
│   ├── catalog-app/            # Port 3006
│   └── shared-ui-lib/          # Shared components & API client
├── backend/
│   └── mock-data-service/      # DEPRECATED - not used
├── tests/                      # Playwright E2E tests
├── scripts/                    # Utility scripts
├── docker-compose.bff.traefik.yml       # Dev with Traefik
├── docker-compose.bff.traefik.prod.yml  # Prod with Traefik
├── run.sh                      # Start all services
└── stop.sh                     # Stop all services
```

## API Integration

### Shared API Client
Location: `frontend/shared-ui-lib/src/api/apiClient.ts`

```typescript
const API_URL = 'https://dev-creamat.fds-1.com/gateway/';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Auto-attach JWT tokens
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Service-Specific APIs
Each micro-frontend has its own API service:
- User Management: `user-management-app/src/api.ts`
- Orders: `orders-app/src/services/apiClient.ts`
- Catalog: `catalog-app/src/services/api.ts`

## Testing Strategy

### E2E Testing (Playwright)
```bash
# Run all tests
npm run test:all

# Interactive mode
npm run test:ui

# Specific test
npx playwright test tests/menu-navigation.spec.ts
```

### Test Coverage
- Navigation between micro-frontends
- Authentication flow
- CRUD operations
- Error handling
- Responsive design
- Accessibility

## Deployment

### GitHub Actions
- Builds all micro-frontends
- Runs tests
- Deploys to GitHub Pages (if configured)

### Docker Production
- Traefik as reverse proxy
- All micro-frontends containerized
- Health checks configured
- Resource limits set
- Automatic restarts

## Environment Variables

### Required for All Apps
```env
REACT_APP_API_URL=https://dev-creamat.fds-1.com/gateway/
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## Security

### Authentication
- Firebase Authentication
- JWT tokens in localStorage
- Automatic token refresh
- Logout clears all tokens

### API Security
- HTTPS only
- CORS configured on backend
- Authorization header with Bearer token
- Input validation on frontend

## Performance

### Bundle Optimization
- Code splitting per route
- Lazy loading of remotes
- Shared dependencies (React, MUI)
- Tree shaking enabled

### Loading Strategy
- Suspense for lazy loading
- Loading states for API calls
- Error boundaries for failures
- Retry logic for failed loads

## Monitoring

### Frontend
- Console logging for API calls
- Error boundaries catch errors
- Performance metrics (Core Web Vitals)

### Backend
- Backend monitoring (external)
- API response times
- Error rates

## Documentation

### Prompt Files
- `00-ARCHITECTURE-OVERVIEW.md` - This file
- `01-setup-container-mui.md` - Container app setup
- `02-setup-auth-remote.md` - User management setup
- `03-setup-dashboard-remote.md` - Analytics setup
- `04-setup-profile-remote.md` - Orders setup
- `05-integration-testing.md` - Testing and optimization
- `06-python-microservices.md` - Backend integration guide

## Common Issues

### CORS Errors
**Solution**: Backend at https://dev-creamat.fds-1.com must allow requests from localhost origins

### Remote Not Loading
**Solution**: Ensure remote app is running and remoteEntry.js is accessible

### Auth Token Issues
**Solution**: Check Firebase configuration and token storage in localStorage

### MUI Theme Not Applied
**Solution**: Ensure MUI dependencies are shared as singletons in webpack config

## Next Steps

1. ✅ Remove mock backend references
2. ✅ Update all documentation
3. ✅ Clean up Docker Compose files
4. ⏳ Test all micro-frontends with real backend
5. ⏳ Deploy to production
6. ⏳ Set up monitoring and alerts

