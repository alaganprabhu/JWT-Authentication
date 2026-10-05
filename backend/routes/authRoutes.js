// ============================================
// AUTH ROUTES (routes/authRoutes.js)
// ============================================
// Routes define the URL endpoints of our API.
// They map URLs to controller functions:
//   POST /api/auth/register → registerUser()
//   POST /api/auth/login    → loginUser()
//   GET  /api/profile       → getUserProfile() (protected)
// ============================================

const express = require('express');
const router = express.Router(); // Create a new router instance

// Import our controller functions (the actual logic)
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require('../controllers/authController');

// Import the auth middleware (the security guard)
const { protect } = require('../middleware/authMiddleware');

// ─── PUBLIC ROUTES (no token required) ───
// Anyone can access these without being logged in

// POST /api/auth/register — Create a new account
router.post('/register', registerUser);

// POST /api/auth/login — Log in to an existing account
router.post('/login', loginUser);

// ─── PROTECTED ROUTES (token required) ───
// The "protect" middleware runs BEFORE getUserProfile
// If the token is invalid, getUserProfile will never execute

// GET /api/profile — Get logged-in user's data
// Notice: "protect" is passed as a second argument (middleware)
router.get('/profile', protect, getUserProfile);

module.exports = router;
