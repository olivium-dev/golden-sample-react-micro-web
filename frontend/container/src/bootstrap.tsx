import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '../../shared-ui-lib/src/components/ThemeProvider';
import { ReactQueryProvider } from '../../shared-ui-lib/src';
import { CssBaseline } from '@mui/material';

console.log('🚀 Bootstrap: Starting React app...');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ReactQueryProvider>
      <ThemeProvider defaultMode="light" enableCSSVariables>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ReactQueryProvider>
  </React.StrictMode>
);

console.log('✅ Bootstrap: React app rendered');

// Expose React for testing
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
