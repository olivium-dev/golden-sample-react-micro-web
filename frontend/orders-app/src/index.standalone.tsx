// Standalone entry point for User Management
// This version doesn't rely on Module Federation or shared dependencies

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Mock ErrorBoundary for standalone testing
interface MockErrorBoundaryProps {
  children: React.ReactNode;
  componentName: string;
}

const MockErrorBoundary: React.FC<MockErrorBoundaryProps> = ({ children, componentName }) => {
  return React.createElement(React.Fragment, null, children);
};

// Create a local theme for standalone testing
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      MockErrorBoundary,
      { componentName: "User Management Standalone", children: React.createElement(
        ThemeProvider,
        { theme: theme },
        React.createElement(CssBaseline),
        React.createElement(App)
      ) }
    )
  )
);
