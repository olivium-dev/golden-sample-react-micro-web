// Isolated entry point for Settings Panel
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.isolated'; // Use the isolated App
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { loadSettingsConfig, SettingsConfigProvider } from './config/index';
import { startMocking } from './mocks/browser';

// Create a local theme
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// Simple error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Settings Panel Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', border: '2px solid red', margin: '20px' }}>
          <h2>⚠️ Error in Settings Panel</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Bootstrap function
async function bootstrap() {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

  // Show loading
  root.render(
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 2, flexDirection: 'column' }}>
      <CircularProgress size={60} />
      <p>Loading Settings configuration...</p>
    </Box>
  );

  try {
    // Load config
    const config = await loadSettingsConfig();

    // Start MSW if enabled
    if (config.mock?.enabled) {
      await startMocking(config);
    }

    // Create theme from config
    const theme = createTheme({
      palette: {
        primary: { main: config.theme?.brandColors?.[0] || '#1976d2' },
        secondary: { main: '#dc004e' },
      },
    });

    // Render app with config
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <SettingsConfigProvider value={config}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <App />
            </ThemeProvider>
          </SettingsConfigProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );

    console.log('✅ Settings started in standalone mode');
  } catch (error) {
    console.error('Failed to bootstrap Settings:', error);
    root.render(<Box sx={{ p: 4, color: 'error.main' }}><h2>Failed to load configuration</h2></Box>);
  }
}

bootstrap();