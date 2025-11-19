import React from 'react';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ErrorBoundary, ErrorCapture } from '../../shared-ui-lib/src';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize error capture for this micro-frontend
ErrorCapture.initialize();

// Create QueryClient for React Query with proper defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

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
const Orders: React.FC = () => {
  return (
    <ErrorBoundary componentName="Orders App">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default Orders;

