import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ErrorBoundary, ErrorCapture } from '../../shared-ui-lib/src';

// Initialize error capture for this micro-frontend
ErrorCapture.initialize();

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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary componentName="Settings App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
