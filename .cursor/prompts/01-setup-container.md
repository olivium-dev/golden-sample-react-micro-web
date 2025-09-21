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

Remote apps to integrate:
- auth: http://localhost:3001/remoteEntry.js (exposes ./AuthPage)
- dashboard: http://localhost:3002/remoteEntry.js (exposes ./DashboardPage)  
- profile: http://localhost:3003/remoteEntry.js (exposes ./ProfilePage)

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
- [ ] Routes are configured for /auth, /dashboard, /profile
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
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "container",
      remotes: {
        auth: "auth@http://localhost:3001/remoteEntry.js",
        dashboard: "dashboard@http://localhost:3002/remoteEntry.js",
        profile: "profile@http://localhost:3003/remoteEntry.js",
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

const AuthPage = lazy(() => import("auth/AuthPage"));
const DashboardPage = lazy(() => import("dashboard/DashboardPage"));
const ProfilePage = lazy(() => import("profile/ProfilePage"));

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
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
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

## Common Issues & Solutions

### Issue: Remote modules not found
**Solution**: Remote apps need to be running first. This is expected at this stage.

### Issue: TypeScript errors for remote imports
**Solution**: Add type declarations:
```typescript
declare module "auth/AuthPage";
declare module "dashboard/DashboardPage";  
declare module "profile/ProfilePage";
```

### Issue: Webpack build errors
**Solution**: Ensure all dependencies are installed and webpack config syntax is correct.

## Next Steps
After validation passes, proceed to Phase 2: Setup Auth Remote App.
