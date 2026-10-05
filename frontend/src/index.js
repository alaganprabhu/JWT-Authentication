// ============================================
// ENTRY POINT (index.js)
// ============================================
// This is where our React app starts.
// We wrap everything in BrowserRouter for routing
// and AuthProvider for global auth state.
// ============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Create the root element and render our app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* BrowserRouter enables client-side routing (page navigation without full reload) */}
    <BrowserRouter>
      {/* AuthProvider makes auth state (user, token, login, logout) available everywhere */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
