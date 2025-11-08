import React from 'react';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Create a local theme for this micro-frontend
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

// Export the component for Module Federation
const UserManagement: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

export default UserManagement;
