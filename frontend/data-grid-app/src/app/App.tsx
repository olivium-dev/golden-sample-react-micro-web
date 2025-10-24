/**
 * App Component - Data Grid Application
 * Implements Clean Architecture with Dependency Injection
 */

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { DataGridPage } from '../presentation/pages/DataGridPage';
import { useDataGridViewModel } from '../presentation/viewmodels/useDataGridViewModel';
import { DataRepositoryImpl } from '../data/repositories/DataRepositoryImpl';

// Dependency Injection: Create repository instance
const dataRepository = new DataRepositoryImpl();

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#ff6b6b',
    },
    secondary: {
      main: '#61dafb',
    },
  },
});

function App() {
  // Initialize ViewModel with repository dependency
  const viewModel = useDataGridViewModel(dataRepository);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataGridPage viewModel={viewModel} />
    </ThemeProvider>
  );
}

export default App;





