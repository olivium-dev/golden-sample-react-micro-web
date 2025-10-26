import React from 'react';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ErrorBoundary, ErrorCapture } from '../../shared-ui-lib/src';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize error capture for this micro-frontend
ErrorCapture.initialize();

// Create QueryClient for React Query
const queryClient = new QueryClient();

// Create a local theme (will use shared theme via Module Federation in production)
const theme = createTheme({
  palette: {
    primary: {
      main: '#61dafb',
    },
    secondary: {
      main: '#ff6b6b',
    },
  },
});

// Export the component for Module Federation (not render to DOM)
const UserManagement: React.FC = () => {
  return (
    <ErrorBoundary componentName="User Management App">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default UserManagement;

