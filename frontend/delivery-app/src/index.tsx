import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Delivery from './bootstrap';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Delivery />
  </React.StrictMode>
);
