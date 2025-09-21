# Phase 5: Integration Testing & Optimization

## Prompt Template
```
Set up comprehensive integration testing and optimization for the micro-frontend golden sample.

Requirements:
- Create development scripts to run all apps concurrently
- Implement comprehensive error handling and fallbacks
- Add performance monitoring and optimization
- Create shared state management between apps
- Set up end-to-end testing
- Optimize bundle sizes and loading performance
- Add production build configurations

Tasks to complete:
1. Create root package.json with concurrently scripts
2. Add comprehensive error boundaries with retry logic
3. Implement shared state management (Context/Redux)
4. Add performance monitoring and metrics
5. Create E2E tests with Cypress or Playwright
6. Optimize webpack configurations for production
7. Add bundle analysis and size monitoring
8. Create deployment configurations
```

## Validation Checklist

### Development Workflow
- [ ] Root package.json created with workspace scripts
- [ ] `npm run dev:all` starts all apps successfully
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
  "name": "micro-frontend-golden-sample",
  "private": true,
  "workspaces": [
    "container",
    "auth-app",
    "dashboard-app", 
    "profile-app"
  ],
  "scripts": {
    "dev:all": "concurrently \"npm run start --prefix container\" \"npm run start --prefix auth-app\" \"npm run start --prefix dashboard-app\" \"npm run start --prefix profile-app\"",
    "build:all": "npm run build --prefix auth-app && npm run build --prefix dashboard-app && npm run build --prefix profile-app && npm run build --prefix container",
    "test:all": "npm run test --prefix container && npm run test --prefix auth-app && npm run test --prefix dashboard-app && npm run test --prefix profile-app",
    "lint:all": "npm run lint --prefix container && npm run lint --prefix auth-app && npm run lint --prefix dashboard-app && npm run lint --prefix profile-app",
    "e2e": "cypress run",
    "e2e:open": "cypress open"
  },
  "devDependencies": {
    "concurrently": "^7.6.0",
    "cypress": "^12.0.0",
    "@cypress/webpack-preprocessor": "^5.17.0"
  }
}
```

### Enhanced Error Boundary
```typescript
import React, { Component, ReactNode } from "react";

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
        <div className="remote-error">
          <h3>Something went wrong loading this section</h3>
          <p>{this.state.error?.message}</p>
          {this.state.retryCount < this.maxRetries && (
            <button onClick={this.retry}>
              Retry ({this.state.retryCount + 1}/{this.maxRetries})
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Testing Commands

### Start All Apps
```bash
npm run dev:all
# Should start:
# - Container on http://localhost:3000
# - Auth on http://localhost:3001  
# - Dashboard on http://localhost:3002
# - Profile on http://localhost:3003
```

### Integration Tests
```bash
# Test individual apps
cd auth-app && npm test
cd dashboard-app && npm test  
cd profile-app && npm test
cd container && npm test

# Test all together
npm run test:all

# E2E tests
npm run e2e
```

### Performance Testing
```bash
# Bundle analysis
npm run build:all
npx webpack-bundle-analyzer container/build/static/js/*.js
npx webpack-bundle-analyzer auth-app/build/static/js/*.js

# Lighthouse CI
npx lhci autorun
```

## E2E Test Scenarios

### Critical User Journeys
1. **Navigation Flow**
   - Load container app
   - Navigate to /auth, /dashboard, /profile
   - Verify each remote loads correctly
   - Test back/forward browser navigation

2. **Authentication Flow**
   - Navigate to auth page
   - Fill and submit login form
   - Verify form validation
   - Test error states

3. **Dashboard Interaction**
   - Navigate to dashboard
   - Verify all widgets load
   - Test responsive behavior
   - Check data visualization

4. **Profile Management**
   - Navigate to profile page
   - Update profile information
   - Upload profile image
   - Save changes and verify

### Error Scenarios
1. **Remote App Down**
   - Stop one remote app
   - Verify error boundary displays
   - Test retry functionality

2. **Network Issues**
   - Simulate slow network
   - Verify loading states
   - Test timeout handling

## Performance Benchmarks

### Bundle Size Targets
- Container: < 200KB gzipped
- Each Remote: < 150KB gzipped
- Shared Dependencies: Properly deduplicated
- Total Initial Load: < 500KB gzipped

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

### Issue: E2E tests failing
**Solution**: Add proper wait conditions, use data-testid attributes, handle async loading

## Production Readiness Checklist

- [ ] All apps build successfully for production
- [ ] Environment variables configured for different stages
- [ ] CDN URLs configured for remote entries
- [ ] Error tracking implemented (Sentry, etc.)
- [ ] Performance monitoring set up
- [ ] Security headers configured
- [ ] HTTPS enforced in production
- [ ] CI/CD pipelines configured
- [ ] Rollback strategies defined
- [ ] Health checks implemented

## Next Steps
After validation passes, proceed to Phase 6: Production Deployment & CI/CD Setup.
