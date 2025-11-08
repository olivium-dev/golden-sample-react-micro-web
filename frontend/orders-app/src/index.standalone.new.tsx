/**
 * User Management Standalone Entry Point
 * Loads configuration and initializes the app for standalone mode
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { loadUserConfig, UserConfigProvider } from './config/index';
import { startMocking } from './mocks/browser';

// Simple error boundary for standalone mode
class StandaloneErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('User Management Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            p: 4,
            border: '2px solid #d32f2f',
            borderRadius: 2,
            m: 4,
            backgroundColor: '#ffebee',
          }}
        >
          <h2 style={{ color: '#d32f2f' }}>⚠️ Error in User Management</h2>
          <p>{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reload Application
          </button>
        </Box>
      );
    }
    return this.props.children;
  }
}

// Bootstrap function that loads config and starts the app
async function bootstrap() {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

  // Show loading state while config loads
  root.render(
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <p>Loading User Management configuration...</p>
    </Box>
  );

  try {
    // Load configuration
    const config = await loadUserConfig();

    // Initialize MSW if mocking is enabled
    if (config.mock?.enabled) {
      await startMocking(config);
    }

    // Create theme from config
    const theme = createTheme({
      palette: {
        primary: {
          main: config.theme?.primaryColor || '#1976d2',
        },
        secondary: {
          main: '#dc004e',
        },
        mode: 'light',
      },
    });

    // Render the app with config and theme
    root.render(
      <React.StrictMode>
        <StandaloneErrorBoundary>
          <UserConfigProvider value={config}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <App />
            </ThemeProvider>
          </UserConfigProvider>
        </StandaloneErrorBoundary>
      </React.StrictMode>
    );

    console.log('✅ User Management started in standalone mode');
    console.log('Configuration:', config);
  } catch (error) {
    console.error('Failed to bootstrap User Management:', error);
    root.render(
      <Box sx={{ p: 4, color: 'error.main' }}>
        <h2>Failed to load configuration</h2>
        <p>{error instanceof Error ? error.message : String(error)}</p>
      </Box>
    );
  }
}

bootstrap();

