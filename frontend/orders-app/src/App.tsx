import React from 'react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import OrdersList from './components/OrdersList';
import OrderDetailsNew from './components/OrderDetailsNew';
import './App.css';

function App() {
  try {
    const isStandalone = window.location.port === '30007';
    const Router = isStandalone ? BrowserRouter : MemoryRouter;

    return (
      <Router>
        <Routes>
          <Route path="/" element={<OrdersList />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/order-details" element={<OrderDetailsNew />} />
          <Route path="/order-details/:orderId" element={<OrderDetailsNew />} />
        </Routes>
      </Router>
    );
  } catch (error) {
    console.error('App component error:', error);
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>App Error</h2>
        <p>Failed to load App component</p>
      </div>
    );
  }
}

export default App;