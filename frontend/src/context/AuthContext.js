// ============================================
// AUTH CONTEXT (context/AuthContext.js)
// ============================================
// React Context provides a way to share data (like auth state)
// across ALL components without passing props manually at every level.
//
// Think of it as a "global variable" for your React app, but done properly.
//
// WHAT THIS CONTEXT PROVIDES:
// - user: The logged-in user's data (or null if not logged in)
// - token: The JWT token (or null)
// - login(): Save user data + token after successful login/signup
// - logout(): Clear everything and redirect to login page
// - loading: true while we're checking if a saved token exists
//
// WHY STORE JWT IN localStorage?
// - localStorage persists even after the browser tab is closed
// - So when the user comes back, they're still logged in
// - The token is sent with every API request to prove identity
// - Alternative: cookies (more secure but more complex to set up)
// ============================================

import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ── Create the context ──
const AuthContext = createContext();

// ── Custom hook to use the auth context easily ──
// Instead of writing useContext(AuthContext) everywhere,
// we just write useAuth()
export const useAuth = () => useContext(AuthContext);

// ── The Provider component that wraps our entire app ──
export const AuthProvider = ({ children }) => {
  // State: the currently logged-in user's data
  const [user, setUser] = useState(null);

  // State: the JWT token
  const [token, setToken] = useState(null);

  // State: true while we're checking localStorage for an existing token
  // This prevents a "flash" of the login page before redirecting to dashboard
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ─── CHECK FOR EXISTING TOKEN ON APP LOAD ───
  // This runs ONCE when the app first loads (page refresh)
  // It checks if there's a saved token in localStorage
  useEffect(() => {
    const checkAuth = async () => {
      // Try to get the saved token and user data from localStorage
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          // Verify the token is still valid by calling the /api/profile endpoint
          // This sends the token in the Authorization header
          const response = await axios.get('http://localhost:5000/api/profile', {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });

          // Token is valid! Restore the user's session
          setToken(savedToken);
          setUser(response.data.user);
        } catch (error) {
          // Token is invalid or expired — clear everything
          console.log('Saved token is invalid or expired. Logging out.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      // Done checking — stop showing the loading spinner
      setLoading(false);
    };

    checkAuth();
  }, []); // Empty dependency array = run only once on mount

  // ─── LOGIN FUNCTION ───
  // Called after successful login or signup
  // Saves the user data and token to both state and localStorage
  const login = (userData, jwtToken) => {
    // Save to React state (updates the UI)
    setUser(userData);
    setToken(jwtToken);

    // Save to localStorage (persists across page refreshes)
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));

    // Redirect to the dashboard
    navigate('/dashboard');
  };

  // ─── LOGOUT FUNCTION ───
  // HOW LOGOUT WORKS:
  // 1. Remove the token from localStorage (no more persistence)
  // 2. Remove user data from localStorage
  // 3. Clear React state (updates the UI)
  // 4. Redirect to the login page
  //
  // Note: Since JWTs are stateless, the token technically still "works"
  // until it expires. That's why we remove it from the client side.
  // For extra security, you could implement a token blacklist on the server.
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear React state
    setUser(null);
    setToken(null);

    // Redirect to login page
    navigate('/login');
  };

  // ─── PROVIDE THE VALUES TO ALL CHILD COMPONENTS ───
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
