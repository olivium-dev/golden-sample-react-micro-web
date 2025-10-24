/**
 * Standalone Entry Point
 * Used when running the app independently (not via Module Federation)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { ErrorBoundary, ErrorCapture } from '../../shared-ui-lib/src';

// Initialize error capture for this micro-frontend
ErrorCapture.initialize();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary componentName="Data Grid App">
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
