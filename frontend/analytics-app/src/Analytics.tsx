import React from 'react';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Create a local theme for this micro-frontend
const theme = createTheme({
  palette: {
    primary: {
      main: '#4ecdc4',
    },
    secondary: {
      main: '#ff6b6b',
    },
  },
});

// Export the component for Module Federation
const Analytics: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

export default Analytics;
