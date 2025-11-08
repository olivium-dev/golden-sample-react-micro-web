import React from 'react';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Create a local theme for this micro-frontend
const theme = createTheme({
  palette: {
    primary: {
      main: '#ffa726',
    },
    secondary: {
      main: '#ff6b6b',
    },
  },
});

// Export the component for Module Federation
const Settings: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

export default Settings;
