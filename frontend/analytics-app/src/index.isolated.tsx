// Isolated entry point for Analytics Dashboard
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.isolated'; // Use the isolated App
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { loadAnalyticsConfig, AnalyticsConfigProvider } from './config/index';
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
    console.error('Analytics Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', border: '2px solid red', margin: '20px' }}>
          <h2>⚠️ Error in Analytics Dashboard</h2>
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
      <p>Loading Analytics configuration...</p>
    </Box>
  );

  try {
    // Load config
    const config = await loadAnalyticsConfig();

    // Start MSW if enabled
    if (config.mock?.enabled) {
      await startMocking(config);
    }

    // Create theme from config
    const theme = createTheme({
      palette: {
        primary: { main: config.theme?.chartColors?.[0] || '#1976d2' },
        secondary: { main: '#dc004e' },
      },
    });

    // Render app with config
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <AnalyticsConfigProvider value={config}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <App />
            </ThemeProvider>
          </AnalyticsConfigProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );

    console.log('✅ Analytics started in standalone mode');
  } catch (error) {
    console.error('Failed to bootstrap Analytics:', error);
    root.render(<Box sx={{ p: 4, color: 'error.main' }}><h2>Failed to load configuration</h2></Box>);
  }
}

bootstrap();