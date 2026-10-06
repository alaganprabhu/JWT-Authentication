// ============================================
// DASHBOARD PAGE (pages/Dashboard.js)
// ============================================
// This is a PROTECTED page — only accessible with a valid JWT.
//
// HOW IT WORKS:
// 1. The PrivateRoute component checks for a valid user/token FIRST
// 2. If no valid auth → user is redirected to /login (never sees this page)
// 3. If authenticated → this component renders
// 4. On mount, it calls GET /api/profile with the JWT in the header
// 5. This demonstrates how the frontend sends the JWT to protected APIs
//
// HOW THE JWT IS SENT:
// The JWT is included in the request headers like this:
//   headers: { Authorization: "Bearer eyJhbGciOiJI..." }
// The "Bearer" prefix is a standard convention for token-based auth.
// ============================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
console.log(BASE_URL,'NASEEEEEEE')

const Dashboard = () => {
  // Get user data, token, and logout function from AuthContext
  const { user, token, logout } = useAuth();

  // State for the profile data fetched from the API
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // State to show/hide the JWT token (for educational purposes)
  const [showToken, setShowToken] = useState(false);

  // ── Fetch profile data from the protected API on mount ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ─── THIS IS HOW YOU SEND JWT TO PROTECTED APIs ───
        // Notice the Authorization header with "Bearer <token>"
        // The backend middleware (authMiddleware.js) will:
        //   1. Extract the token from this header
        //   2. Verify it using jwt.verify()
        //   3. If valid, allow the request through
        //   4. If invalid, return a 401 error
        const response = await axios.get(`${BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Save the profile data to state
        setProfileData(response.data.user);
      } catch (error) {
        console.error('Profile fetch error:', error);
        setProfileError(
          error.response?.data?.message || 'Failed to fetch profile'
        );

        // If token is expired or invalid, log the user out
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setProfileLoading(false);
      }
    };

    // Only fetch if we have a token
    if (token) {
      fetchProfile();
    }
  }, [token, logout]);

  // ── Format date for display ──
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboard-page">
      {/* Background decoration */}
      <div className="dashboard-bg-orb dashboard-bg-orb-1"></div>
      <div className="dashboard-bg-orb dashboard-bg-orb-2"></div>

      {/* ── NAVIGATION BAR ── */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>JWT Auth</span>
        </div>
        <div className="nav-actions">
          <span className="nav-user">
            <span className="nav-user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            {user?.name}
          </span>
          {/* ── LOGOUT BUTTON ──
              When clicked, the logout function:
              1. Removes token from localStorage
              2. Removes user data from localStorage
              3. Clears React state (user, token → null)
              4. Redirects to /login
              
              After logout, the PrivateRoute will block access
              to this page because there's no valid user anymore.
          */}
          <button onClick={logout} className="btn-logout" id="logout-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* ── MAIN DASHBOARD CONTENT ── */}
      <main className="dashboard-content">
        {/* Welcome Section */}
        <section className="dashboard-welcome">
          <div className="welcome-icon">👋</div>
          <h1>
            Welcome, <span className="text-gradient">{user?.name}</span>!
          </h1>
          <p>You have successfully authenticated using JWT. This page is protected!</p>
        </section>

        {/* Cards Grid */}
        <div className="dashboard-grid">
          {/* ── PROFILE CARD ── */}
          <div className="dashboard-card profile-card">
            <div className="card-header">
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile Info
              </h2>
              <span className="card-badge">From /api/profile</span>
            </div>

            {profileLoading ? (
              <div className="card-loading">
                <div className="loading-spinner small"></div>
                <p>Fetching your profile...</p>
              </div>
            ) : profileError ? (
              <div className="card-error">
                <p>❌ {profileError}</p>
              </div>
            ) : (
              <div className="profile-details">
                <div className="profile-avatar-large">
                  {profileData?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info-list">
                  <div className="profile-info-item">
                    <span className="info-label">Name</span>
                    <span className="info-value">{profileData?.name}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{profileData?.email}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="info-label">Member Since</span>
                    <span className="info-value">
                      {profileData?.createdAt
                        ? formatDate(profileData.createdAt)
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── JWT TOKEN CARD ── */}
          {/* This card shows the actual JWT token for educational purposes */}
          <div className="dashboard-card token-card">
            <div className="card-header">
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Your JWT Token
              </h2>
              <span className="card-badge">Educational</span>
            </div>

            <div className="token-info">
              <p className="token-description">
                This is the JWT token stored in your browser's <code>localStorage</code>.
                It's sent with every API request in the <code>Authorization</code> header.
              </p>

              <button
                className="btn-show-token"
                onClick={() => setShowToken(!showToken)}
                id="toggle-token"
              >
                {showToken ? '🙈 Hide Token' : '👁️ Reveal Token'}
              </button>

              {showToken && (
                <div className="token-display">
                  <code>{token}</code>
                  <p className="token-warning">
                    ⚠️ Never share your JWT token! It grants full access to your account.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── HOW IT WORKS CARD ── */}
          <div className="dashboard-card how-it-works-card">
            <div className="card-header">
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                How JWT Auth Works
              </h2>
            </div>

            <div className="auth-flow-steps">
              <div className="flow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Sign Up / Login</h3>
                  <p>User sends credentials to the server</p>
                </div>
              </div>
              <div className="flow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Server Validates</h3>
                  <p>Password is compared using bcrypt</p>
                </div>
              </div>
              <div className="flow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>JWT Generated</h3>
                  <p>Server signs a token with user ID + secret</p>
                </div>
              </div>
              <div className="flow-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Token Stored</h3>
                  <p>Frontend saves JWT in localStorage</p>
                </div>
              </div>
              <div className="flow-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h3>Protected Requests</h3>
                  <p>JWT sent in Authorization: Bearer header</p>
                </div>
              </div>
              <div className="flow-step">
                <div className="step-number">6</div>
                <div className="step-content">
                  <h3>Middleware Verifies</h3>
                  <p>Server validates JWT before giving access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
