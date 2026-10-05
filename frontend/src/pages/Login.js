// ============================================
// LOGIN PAGE (pages/Login.js)
// ============================================
// This page lets existing users log in to their account.
//
// WHAT HAPPENS DURING LOGIN:
// 1. User enters their Email and Password
// 2. Frontend sends a POST request to /api/auth/login
// 3. Backend finds the user by email in MongoDB
// 4. Backend compares the entered password with the stored hash
// 5. If correct → Backend generates a JWT token and sends it back
// 6. Frontend saves the token in localStorage via AuthContext
// 7. User is redirected to the Dashboard
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // UI state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get the login function from AuthContext
  const { login } = useAuth();

  // ── Handle input changes ──
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // ── Handle form submission ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // ── Send login request to the backend ──
      // POST /api/auth/login with email and password
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // ── Success! ──
      // response.data = { message, user: { id, name, email }, token }
      // login() saves everything and redirects to /dashboard
      login(response.data.user, response.data.token);
    } catch (err) {
      // The backend returns "Invalid email or password" for security
      // (we don't reveal which one is wrong)
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative background elements */}
      <div className="auth-bg-orb auth-bg-orb-1"></div>
      <div className="auth-bg-orb auth-bg-orb-2"></div>
      <div className="auth-bg-orb auth-bg-orb-3"></div>

      <div className="auth-container">
        {/* Left side - Branding */}
        <div className="auth-brand">
          <div className="auth-brand-content">
            <div className="auth-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1>Welcome Back</h1>
            <p className="auth-brand-tagline">
              Sign in to access your secure dashboard
            </p>
            <div className="auth-brand-features">
              <div className="auth-feature-item">
                <span className="auth-feature-icon">⚡</span>
                <span>Instant JWT verification</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">🔄</span>
                <span>Persistent sessions</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">📱</span>
                <span>Responsive design</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to continue</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="auth-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" id="login-form">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-btn"
                id="login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner"></span>
                    Signing In...
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Link to Signup page */}
            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/signup" id="goto-signup">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
