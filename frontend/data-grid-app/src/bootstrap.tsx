import React from 'react';
import App from './app/App';
import { ErrorBoundary, ErrorCapture } from '../../shared-ui-lib/src';

// Initialize error capture for this micro-frontend
ErrorCapture.initialize();

// Export the component for Module Federation (not render to DOM)
const DataGrid: React.FC = () => {
  return (
    <ErrorBoundary componentName="Data Grid App">
      <App />
    </ErrorBoundary>
  );
};

export default DataGrid;

