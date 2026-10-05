// ============================================
// MAIN APP COMPONENT (App.js)
// ============================================
// This is the root component that sets up all the routes.
//
// ROUTING STRUCTURE:
//   / → Redirects to /login
//   /login → Login page (public)
//   /signup → Signup page (public)
//   /dashboard → Dashboard page (PROTECTED - requires JWT)
//
// The PrivateRoute component wraps protected routes.
// It checks if the user is authenticated before rendering.
// ============================================

import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { loading } = useAuth();

  // Show loading screen while checking for existing auth
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Default route — redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes — anyone can access */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected route — only accessible with valid JWT */}
        {/* PrivateRoute checks: Is user authenticated? */}
        {/*   YES → render Dashboard */}
        {/*   NO  → redirect to /login */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Catch-all — redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
