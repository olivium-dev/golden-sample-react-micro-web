/**
 * App Component - Data Grid Application
 * Implements Clean Architecture with Dependency Injection
 */

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataGridPage } from '../presentation/pages/DataGridPage';
import { useDataGridViewModel } from '../presentation/viewmodels/useDataGridViewModel';
import { DataRepositoryImpl } from '../data/repositories/DataRepositoryImpl';

// Create a local QueryClient for this micro-frontend
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
    mutations: {
      retry: 1,
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DataGridPage viewModel={viewModel} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;





