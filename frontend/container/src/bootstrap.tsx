import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '../../shared-ui-lib/src/components/ThemeProvider';
import { CssBaseline } from '@mui/material';
import { ErrorBoundary, ErrorCapture, AuthProvider } from '../../shared-ui-lib/src';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize global error capture
ErrorCapture.initialize();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <ErrorBoundary componentName="Container App Root">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultMode="light" enableCSSVariables>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
