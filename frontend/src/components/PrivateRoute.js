// ============================================
// PRIVATE ROUTE COMPONENT (components/PrivateRoute.js)
// ============================================
// This component acts as a "gatekeeper" for protected pages.
//
// HOW PROTECTED ROUTES WORK:
// 1. User tries to visit /dashboard
// 2. PrivateRoute checks: "Is there a valid user + token?"
// 3. If YES → Show the dashboard (render the children)
// 4. If NO → Redirect to /login
//
// Think of it like a bouncer at a club:
//   - If you have a valid VIP pass (JWT) → you get in
//   - If not → you're sent to the entrance (login page)
// ============================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute - Wraps routes that require authentication
 *
 * Usage in App.js:
 *   <Route path="/dashboard" element={
 *     <PrivateRoute><Dashboard /></PrivateRoute>
 *   } />
 *
 * @param {Object} children - The component to render if authenticated
 */
const PrivateRoute = ({ children }) => {
  // Get auth state from context
  const { user, loading } = useAuth();

  // While checking if token exists (on page refresh), show a loading indicator
  // Without this, the user would briefly see the login page before being redirected
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Verifying your session...</p>
      </div>
    );
  }

  // If the user is NOT authenticated, redirect them to the login page
  // <Navigate> is React Router's way of programmatically redirecting
  // replace={true} means the login page replaces the current history entry
  // so the user can't press "Back" to get to the protected page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User IS authenticated — render the protected page
  return children;
};

export default PrivateRoute;
