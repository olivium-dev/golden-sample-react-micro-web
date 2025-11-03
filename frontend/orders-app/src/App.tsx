import React from 'react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import OrdersList from './components/OrdersList';
import OrderDetails from './components/OrderDetails';
import './App.css';

function App() {
  const isStandalone = window.location.port === '30007';
  const Router = isStandalone ? BrowserRouter : MemoryRouter;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<OrdersList />} />
        <Route path="/order-details" element={<OrderDetails />} />
      </Routes>
    </Router>
  );
}

export default App;