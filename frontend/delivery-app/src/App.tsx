import React from 'react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ParceletsList from './components/ParceletsList';
import ParceletDetails from './components/ParceletDetails';
import { ParceletProvider } from './context/ParceletContext';
import './App.css';

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const isStandalone = window.location.port === '3007';
  const Router = isStandalone ? BrowserRouter : MemoryRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ParceletProvider>
          <Router>
            <Routes>
              <Route path="/" element={<ParceletsList />} />
              <Route path="/parcelet-details" element={<ParceletDetails />} />
              <Route path="/parcelet-details/:id" element={<ParceletDetails />} />
            </Routes>
          </Router>
        </ParceletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
