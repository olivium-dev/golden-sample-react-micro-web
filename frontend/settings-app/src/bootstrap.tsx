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

const theme = createTheme({
  palette: {
    primary: {
      main: '#ffa726',
    },
    secondary: {
      main: '#61dafb',
    },
  },
});

// Export the component for Module Federation (not render to DOM)
const Settings: React.FC = () => {
  return (
    <ErrorBoundary componentName="Settings App">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default Settings;

