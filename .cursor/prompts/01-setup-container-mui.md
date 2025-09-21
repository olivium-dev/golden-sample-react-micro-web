# Phase 1: Setup Container Application (MUI + Module Federation)

## Prompt Template
```
Create a React TypeScript container application for micro-frontend architecture using Webpack Module Federation and Material-UI (MUI).

Requirements:
- Use create-react-app with TypeScript template
- Configure Webpack Module Federation as host
- Setup MUI v5 with emotion styling engine
- Implement consistent theme provider for all micro-frontends
- Setup routing with React Router v6 and MUI navigation
- Implement lazy loading for remote components
- Add error boundaries and Suspense with MUI components
- Configure to run on port 3000

Remote apps to integrate:
- userManagement: http://localhost:3001/remoteEntry.js (exposes ./UserManagementPage)
- dataGrid: http://localhost:3002/remoteEntry.js (exposes ./DataGridPage)  
- analytics: http://localhost:3003/remoteEntry.js (exposes ./AnalyticsPage)
- settings: http://localhost:3004/remoteEntry.js (exposes ./SettingsPage)

Create the following structure:
/container
  /src
    /components
      - ErrorBoundary.tsx (MUI styled)
      - Navigation.tsx (MUI Drawer/AppBar)
      - LoadingSpinner.tsx (MUI CircularProgress)
      - ThemeToggle.tsx (Dark/Light mode)
    /theme
      - theme.ts (MUI theme configuration)
      - ThemeProvider.tsx
    /pages
      - HomePage.tsx (MUI Dashboard layout)
    /services
      - api.ts (API client configuration)
    - App.tsx
    - index.tsx
  - webpack.config.js
  - package.json

MUI Components to use:
- AppBar with MenuIcon and theme toggle
- Drawer with List navigation items
- Container and Grid for layout
- Paper and Card for content areas
- Typography for consistent text styling
- IconButton for actions
```

## Validation Checklist

### After Running the Prompt
- [ ] Container project created with TypeScript and MUI
- [ ] webpack.config.js exists with Module Federation configuration
- [ ] MUI dependencies installed (@mui/material, @emotion/react, @emotion/styled)
- [ ] MUI icons installed (@mui/icons-material)
- [ ] App starts on port 3000 without errors
- [ ] MUI theme provider wraps the entire application
- [ ] Navigation drawer opens/closes correctly
- [ ] Theme toggle switches between light/dark modes
- [ ] Routes are configured for all 4 micro-frontends
- [ ] Lazy loading implemented with MUI loading components

### Code Quality Checks
- [ ] TypeScript interfaces defined for all props and theme
- [ ] MUI theme follows Material Design principles
- [ ] Error boundaries use MUI Alert/Snackbar components
- [ ] Loading states use MUI CircularProgress or Skeleton
- [ ] Navigation is accessible (keyboard navigation, ARIA labels)
- [ ] Responsive design with MUI breakpoints
- [ ] Console shows no errors or warnings
- [ ] Theme consistency maintained across components

### Module Federation Specific
- [ ] remotes configuration points to correct URLs (ports 3001-3004)
- [ ] shared dependencies include React, ReactDOM, and MUI as singletons
- [ ] webpack devServer configured on port 3000
- [ ] Module Federation name is "container"
- [ ] MUI emotion cache properly configured for micro-frontends

### Testing Commands
```bash
cd container
npm start  # Should start on port 3000
# Check browser console for errors
# Test navigation drawer functionality
# Test theme toggle (light/dark mode)
# Test responsive behavior on different screen sizes
# Verify MUI components render correctly
```

## Expected File Contents

### package.json Dependencies
```json
{
  "dependencies": {
    "@mui/material": "^5.14.0",
    "@mui/icons-material": "^5.14.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/x-data-grid": "^6.10.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "typescript": "^4.9.0"
  }
}
```

### webpack.config.js
```javascript
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  mode: "development",
  devServer: {
    port: 3000,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    }
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "container",
      remotes: {
        userManagement: "userManagement@http://localhost:3001/remoteEntry.js",
        dataGrid: "dataGrid@http://localhost:3002/remoteEntry.js",
        analytics: "analytics@http://localhost:3003/remoteEntry.js",
        settings: "settings@http://localhost:3004/remoteEntry.js",
      },
      shared: {
        react: { singleton: true, requiredVersion: "^18.2.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.2.0" },
        "@mui/material": { singleton: true },
        "@emotion/react": { singleton: true },
        "@emotion/styled": { singleton: true },
      },
    }),
  ],
};
```

### theme/theme.ts
```typescript
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  breakpoints: lightTheme.breakpoints,
});
```

### App.tsx Structure
```typescript
import React, { Suspense, lazy, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { lightTheme, darkTheme } from "./theme/theme";
import ErrorBoundary from "./components/ErrorBoundary";
import Navigation from "./components/Navigation";
import LoadingSpinner from "./components/LoadingSpinner";
import HomePage from "./pages/HomePage";

// Lazy load remote components
const UserManagementPage = lazy(() => import("userManagement/UserManagementPage"));
const DataGridPage = lazy(() => import("dataGrid/DataGridPage"));
const AnalyticsPage = lazy(() => import("analytics/AnalyticsPage"));
const SettingsPage = lazy(() => import("settings/SettingsPage"));

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex' }}>
          <Navigation 
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - 240px)` },
              ml: { sm: '240px' },
            }}
          >
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/users" element={<UserManagementPage />} />
                  <Route path="/data" element={<DataGridPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
```

### Navigation Component Requirements
- Responsive drawer (permanent on desktop, temporary on mobile)
- AppBar with menu button and theme toggle
- Navigation list with icons and labels
- Active route highlighting
- Proper ARIA labels for accessibility

## Common Issues & Solutions

### Issue: MUI styles not loading
**Solution**: Ensure emotion dependencies are installed and ThemeProvider wraps the app

### Issue: Theme not applying to remote components
**Solution**: Share MUI dependencies as singletons in webpack config

### Issue: Navigation drawer not responsive
**Solution**: Use MUI breakpoints and proper sx props for responsive behavior

### Issue: TypeScript errors for remote imports
**Solution**: Add type declarations:
```typescript
declare module "userManagement/UserManagementPage";
declare module "dataGrid/DataGridPage";  
declare module "analytics/AnalyticsPage";
declare module "settings/SettingsPage";
```

## MUI Best Practices

### Theme Consistency
- Use theme.palette colors instead of hardcoded values
- Use theme.spacing for consistent spacing
- Use theme.breakpoints for responsive design
- Use theme.typography for consistent text styling

### Component Usage
- Use Container for page-level layout
- Use Grid for responsive layouts
- Use Paper/Card for content grouping
- Use Typography for all text content
- Use proper semantic HTML with MUI components

## Next Steps
After validation passes, proceed to Phase 2: Setup User Management Remote App with MUI Data Grid.
