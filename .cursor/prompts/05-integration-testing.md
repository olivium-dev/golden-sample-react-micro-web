# Phase 5: Integration Testing & Optimization

## Prompt Template
```
Set up comprehensive integration testing and optimization for the micro-frontend architecture.

Requirements:
- Create development scripts to run all apps concurrently
- Implement comprehensive error handling and fallbacks
- Add performance monitoring and optimization
- Set up end-to-end testing with Playwright
- Optimize bundle sizes and loading performance
- Add production build configurations
- Configure Docker and Traefik for production deployment
- **NO BFF**: All frontends call https://dev-creamat.fds-1.com/gateway/ directly

Tasks to complete:
1. Create root package.json with concurrently scripts
2. Add comprehensive error boundaries with retry logic
3. Implement shared authentication state management
4. Add performance monitoring and metrics
5. Create E2E tests with Playwright
6. Optimize webpack configurations for production
7. Add bundle analysis and size monitoring
8. Create Docker Compose with Traefik configuration
```

## Validation Checklist

### Development Workflow
- [ ] Root package.json created with workspace scripts
- [ ] `./run.sh` starts all apps successfully
- [ ] `npm run build:all` builds all apps without errors
- [ ] Hot reloading works across all applications
- [ ] All apps accessible on their respective ports
- [ ] Container successfully loads all remote apps

### Error Handling & Resilience
- [ ] Error boundaries catch and handle remote loading failures
- [ ] Fallback UI displays when remote apps are unavailable
- [ ] Retry mechanisms work for failed remote loads
- [ ] Network error handling implemented
- [ ] Graceful degradation when remotes are down
- [ ] Console errors are properly logged and handled

### Performance Optimization
- [ ] Bundle sizes analyzed and optimized
- [ ] Shared dependencies properly deduplicated
- [ ] Lazy loading implemented for all routes
- [ ] Loading states provide good user experience
- [ ] Core Web Vitals metrics are acceptable
- [ ] Memory leaks checked and resolved

### Testing Coverage
- [ ] Unit tests for all components
- [ ] Integration tests for Module Federation loading
- [ ] E2E tests for complete user journeys
- [ ] Performance tests for bundle sizes
- [ ] Accessibility tests pass
- [ ] Cross-browser compatibility verified

## Expected File Structure

### Root package.json
```json
{
  "name": "creamati-cms",
  "private": true,
  "scripts": {
    "dev:all": "./run.sh",
    "stop:all": "./stop.sh",
    "build:all": "cd frontend/container && npm run build && cd ../user-management-app && npm run build && cd ../data-grid-app && npm run build && cd ../analytics-app && npm run build && cd ../settings-app && npm run build && cd ../orders-app && npm run build && cd ../catalog-app && npm run build",
    "test:all": "playwright test",
    "test:ui": "playwright test --ui",
    "docker:up": "docker-compose -f docker-compose.bff.traefik.yml up -d",
    "docker:down": "docker-compose -f docker-compose.bff.traefik.yml down",
    "docker:prod": "docker-compose -f docker-compose.bff.traefik.prod.yml up -d"
  },
  "devDependencies": {
    "concurrently": "^7.6.0",
    "@playwright/test": "^1.40.0"
  }
}
```

### run.sh Script
```bash
#!/bin/bash
# Start all micro-frontend services

echo "🚀 Starting all services..."

# Start backend (if needed for local testing)
# cd backend/mock-data-service && python main.py &

# Start frontend services
cd frontend/container && npm start &
cd frontend/user-management-app && npm start &
cd frontend/data-grid-app && npm start &
cd frontend/analytics-app && npm start &
cd frontend/settings-app && npm start &
cd frontend/orders-app && npm start &
cd frontend/catalog-app && npm start &

echo "✅ All services started!"
echo "Container: http://localhost:3000"
echo "User Management: http://localhost:3001"
echo "Data Grid: http://localhost:3002"
echo "Analytics: http://localhost:3003"
echo "Settings: http://localhost:3004"
echo "Orders: http://localhost:3005"
echo "Catalog: http://localhost:3006"
```

### Enhanced Error Boundary
```typescript
import React, { Component, ReactNode } from "react";
import { Alert, Button, Box } from "@mui/material";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

class RemoteErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Remote app loading error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            <strong>Failed to load module</strong>
            <p>{this.state.error?.message}</p>
            {this.state.retryCount < this.maxRetries && (
              <Button onClick={this.retry} variant="outlined" size="small">
                Retry ({this.state.retryCount + 1}/{this.maxRetries})
              </Button>
            )}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default RemoteErrorBoundary;
```

## Testing Commands

### Start All Apps
```bash
./run.sh
# Should start:
# - Container on http://localhost:3000
# - User Management on http://localhost:3001  
# - Data Grid on http://localhost:3002
# - Analytics on http://localhost:3003
# - Settings on http://localhost:3004
# - Orders on http://localhost:3005
# - Catalog on http://localhost:3006
```

### Integration Tests
```bash
# E2E tests with Playwright
npm run test:all

# Interactive mode
npm run test:ui

# Specific test file
npx playwright test tests/menu-navigation.spec.ts
```

### Performance Testing
```bash
# Bundle analysis
npm run build:all
npx webpack-bundle-analyzer frontend/container/dist/static/js/*.js

# Lighthouse CI
npx lhci autorun
```

## E2E Test Scenarios

### Critical User Journeys
1. **Navigation Flow**
   - Load container app
   - Navigate to /users, /data, /analytics, /settings, /orders, /catalog
   - Verify each remote loads correctly
   - Test back/forward browser navigation

2. **Authentication Flow**
   - Navigate to user management
   - Login with Firebase
   - Verify token storage
   - Test protected routes

3. **Order Management**
   - Navigate to orders page
   - Create new order
   - Update order status
   - Filter and search orders

4. **Catalog Browsing**
   - Navigate to catalog
   - Browse categories
   - View product details
   - Test image loading

### Error Scenarios
1. **Remote App Down**
   - Stop one remote app
   - Verify error boundary displays
   - Test retry functionality

2. **Network Issues**
   - Simulate slow network
   - Verify loading states
   - Test timeout handling

3. **Backend API Errors**
   - Simulate 500 errors
   - Verify error messages
   - Test retry logic

## Docker & Traefik Configuration

### docker-compose.bff.traefik.yml
```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - micro-frontend-network

  container-app:
    build:
      context: ./frontend/container
      dockerfile: Dockerfile
    container_name: container-app
    networks:
      - micro-frontend-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.container.rule=Host(`localhost`)"
      - "traefik.http.routers.container.priority=1"
      - "traefik.http.services.container.loadbalancer.server.port=80"

  # Add other micro-frontends...

networks:
  micro-frontend-network:
    driver: bridge
```

## Performance Benchmarks

### Bundle Size Targets
- Container: < 300KB gzipped
- Each Remote: < 200KB gzipped
- Shared Dependencies: Properly deduplicated
- Total Initial Load: < 800KB gzipped

### Loading Performance
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Remote App Load Time: < 1s

### Runtime Performance
- Memory Usage: Stable over time
- No memory leaks detected
- Smooth navigation between routes
- Responsive UI interactions

## Common Issues & Solutions

### Issue: Apps not starting concurrently
**Solution**: Check port conflicts and ensure all package.json scripts are correct

### Issue: Remote apps not loading in container
**Solution**: Verify all remotes are running and remoteEntry.js files are accessible

### Issue: Bundle size too large
**Solution**: Analyze bundles, optimize shared dependencies, implement proper code splitting

### Issue: Memory leaks during navigation
**Solution**: Implement proper cleanup in useEffect hooks, check for event listener cleanup

### Issue: CORS errors in production
**Solution**: Configure Traefik properly or ensure backend CORS headers are correct

## Production Readiness Checklist

- [ ] All apps build successfully for production
- [ ] Environment variables configured for different stages
- [ ] Firebase configuration for production
- [ ] Error tracking implemented (Sentry, etc.)
- [ ] Performance monitoring set up
- [ ] Security headers configured in Traefik
- [ ] HTTPS enforced in production
- [ ] CI/CD pipelines configured (GitHub Actions)
- [ ] Rollback strategies defined
- [ ] Health checks implemented

## Backend Integration

### API Configuration
- **Backend URL**: https://dev-creamat.fds-1.com/gateway/
- **NO BFF**: All frontends call backend directly
- **Authentication**: Firebase Auth + JWT tokens
- **CORS**: Backend must allow requests from frontend origins

### Environment Variables
```env
REACT_APP_API_URL=https://dev-creamat.fds-1.com/gateway/
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

## Next Steps
After validation passes, proceed to Phase 6: Production Deployment & Monitoring.
