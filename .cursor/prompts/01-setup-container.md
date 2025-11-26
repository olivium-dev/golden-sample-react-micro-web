# Phase 1: Setup Container Application

## Prompt Template
```
Create a React TypeScript container application for micro-frontend architecture using Webpack Module Federation. 

Requirements:
- Use create-react-app with TypeScript template
- Configure Webpack Module Federation as host
- Setup routing with React Router v6
- Implement lazy loading for remote components
- Add error boundaries and Suspense
- Configure to run on port 3000
- **NO BFF ARCHITECTURE**: Frontend calls backend API directly at https://dev-creamat.fds-1.com/gateway/

Remote apps to integrate:
- userApp: http://localhost:3001/remoteEntry.js (exposes ./UserManagementPage)
- dataApp: http://localhost:3002/remoteEntry.js (exposes ./DataGridPage)  
- analyticsApp: http://localhost:3003/remoteEntry.js (exposes ./AnalyticsPage)
- settingsApp: http://localhost:3004/remoteEntry.js (exposes ./SettingsPage)
- ordersApp: http://localhost:3005/remoteEntry.js (exposes ./OrdersPage)
- catalogApp: http://localhost:3006/remoteEntry.js (exposes ./CatalogPage)

Create the following structure:
/container
  /src
    /components
      - ErrorBoundary.tsx
      - Navigation.tsx
      - LoadingSpinner.tsx
    /pages
      - HomePage.tsx
    - App.tsx
    - index.tsx
  - webpack.config.js
  - package.json
```

## Validation Checklist

### After Running the Prompt
- [ ] Container project created with TypeScript
- [ ] webpack.config.js exists with Module Federation configuration
- [ ] All required dependencies installed (react-router-dom, etc.)
- [ ] App starts on port 3000 without errors
- [ ] Navigation component renders properly
- [ ] Error boundary component exists and works
- [ ] Routes are configured for all 6 micro-frontends
- [ ] Lazy loading implemented with Suspense

### Code Quality Checks
- [ ] TypeScript interfaces defined for all props
- [ ] Error boundaries handle remote loading failures
- [ ] Loading states implemented with proper UX
- [ ] Navigation is accessible (keyboard navigation, ARIA labels)
- [ ] Responsive design considerations included
- [ ] Console shows no errors or warnings

### Module Federation Specific
- [ ] remotes configuration points to correct URLs
- [ ] shared dependencies include React and ReactDOM as singletons
- [ ] webpack devServer configured on port 3000
- [ ] Module Federation name is "container"

### Testing Commands
```bash
cd container
npm start  # Should start on port 3000
# Check browser console for errors
# Verify navigation renders
# Test error boundary by simulating remote failure
```

## Expected File Contents

### webpack.config.js
```javascript
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  mode: "development",
  devServer: {
    port: 3000,
    historyApiFallback: true,
    // NO PROXY - Frontend calls https://dev-creamat.fds-1.com/gateway/ directly
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "container",
      remotes: {
        userApp: "userApp@http://localhost:3001/remoteEntry.js",
        dataApp: "dataApp@http://localhost:3002/remoteEntry.js",
        analyticsApp: "analyticsApp@http://localhost:3003/remoteEntry.js",
        settingsApp: "settingsApp@http://localhost:3004/remoteEntry.js",
        ordersApp: "ordersApp@http://localhost:3005/remoteEntry.js",
        catalogApp: "catalogApp@http://localhost:3006/remoteEntry.js",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
};
```

### App.tsx Structure
```typescript
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Navigation from "./components/Navigation";
import LoadingSpinner from "./components/LoadingSpinner";

const UserManagementPage = lazy(() => import("userApp/UserManagementPage"));
const DataGridPage = lazy(() => import("dataApp/DataGridPage"));
const AnalyticsPage = lazy(() => import("analyticsApp/AnalyticsPage"));
const SettingsPage = lazy(() => import("settingsApp/SettingsPage"));
const OrdersPage = lazy(() => import("ordersApp/OrdersPage"));
const CatalogPage = lazy(() => import("catalogApp/CatalogPage"));

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />
        <main>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<div>Welcome to Micro-Frontend App</div>} />
                <Route path="/users" element={<UserManagementPage />} />
                <Route path="/data" element={<DataGridPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

## Backend Integration

### API Configuration
- **Backend URL**: https://dev-creamat.fds-1.com/gateway/
- **NO BFF**: Frontend calls backend directly (no Backend-for-Frontend layer)
- **Authentication**: Firebase Authentication + JWT tokens
- **API Client**: Shared axios instance in `shared-ui-lib/src/api/apiClient.ts`

### API Client Setup
```typescript
import axios from 'axios';

const API_URL = 'https://dev-creamat.fds-1.com/gateway/';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
  timeout: 30000,
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Common Issues & Solutions

### Issue: Remote modules not found
**Solution**: Remote apps need to be running first. This is expected at this stage.

### Issue: TypeScript errors for remote imports
**Solution**: Add type declarations:
```typescript
declare module "userApp/UserManagementPage";
declare module "dataApp/DataGridPage";  
declare module "analyticsApp/AnalyticsPage";
declare module "settingsApp/SettingsPage";
declare module "ordersApp/OrdersPage";
declare module "catalogApp/CatalogPage";
```

### Issue: Webpack build errors
**Solution**: Ensure all dependencies are installed and webpack config syntax is correct.

### Issue: CORS errors when calling backend
**Solution**: Backend at https://dev-creamat.fds-1.com should have proper CORS headers configured.

## Next Steps
After validation passes, proceed to Phase 2: Setup User Management Remote App.
