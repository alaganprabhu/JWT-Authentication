// ============================================
// SIGNUP PAGE (pages/Signup.js)
// ============================================
// This page lets new users create an account.
//
// WHAT HAPPENS DURING SIGN UP:
// 1. User fills in Name, Email, Password, and Confirm Password
// 2. Frontend validates the form (all fields filled, passwords match)
// 3. Frontend sends a POST request to /api/auth/register
// 4. Backend hashes the password and saves the user in MongoDB
// 5. Backend generates a JWT token and sends it back
// 6. Frontend saves the token in localStorage via AuthContext
// 7. User is automatically redirected to the Dashboard
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Signup = () => {
  // Form state — stores what the user types
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // UI state
  const [error, setError] = useState(''); // Error messages
  const [isLoading, setIsLoading] = useState(false); // Loading spinner
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

  // Get the login function from AuthContext
  const { login } = useAuth();

  // ── Handle input changes ──
  // Updates the corresponding field in formData when user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error message when user starts typing
    if (error) setError('');
  };

  // ── Handle form submission ──
  const handleSubmit = async (e) => {
    // Prevent the browser's default form submission (which would reload the page)
    e.preventDefault();

    // ── Client-side validation ──
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // ── Send signup request to the backend ──
      // POST /api/auth/register with the user's data
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );

      // ── Success! Save the token and user data ──
      // response.data contains: { message, user, token }
      // The login() function from AuthContext:
      //   1. Saves user + token to React state
      //   2. Saves token + user to localStorage
      //   3. Redirects to /dashboard
      login(response.data.user, response.data.token);
    } catch (err) {
      // Handle errors from the backend
      // err.response.data.message contains the error text from our API
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
            <h1>JWT Auth</h1>
            <p className="auth-brand-tagline">
              Secure authentication with JSON Web Tokens
            </p>
            <div className="auth-brand-features">
              <div className="auth-feature-item">
                <span className="auth-feature-icon">🔐</span>
                <span>Bcrypt password hashing</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">🎫</span>
                <span>JWT token authentication</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">🛡️</span>
                <span>Protected routes & middleware</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign Up Form */}
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h2>Create Account</h2>
              <p>Start your journey with secure authentication</p>
            </div>

            {/* Error message display */}
            {error && (
              <div className="auth-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" id="signup-form">
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
              </div>

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
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
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

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-btn"
                id="signup-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner"></span>
                    Creating Account...
                  </span>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Link to Login page */}
            <p className="auth-switch">
              Already have an account?{' '}
              <Link to="/login" id="goto-login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
