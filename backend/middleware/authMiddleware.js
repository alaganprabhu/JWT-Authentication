// ============================================
// AUTH MIDDLEWARE (middleware/authMiddleware.js)
// ============================================
// Middleware is a function that runs BETWEEN the request arriving
// and the route handler executing. Think of it as a "security guard"
// that checks your ID (JWT token) before letting you into the building.
//
// FLOW:
// 1. Client sends request with header: Authorization: Bearer <token>
// 2. This middleware extracts the token from the header
// 3. It verifies the token using our secret key
// 4. If valid → attaches user info to the request and lets it through
// 5. If invalid → sends back a 401 (Unauthorized) error
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect - Middleware function to protect routes
 *
 * @param {Object} req - The incoming request object
 * @param {Object} res - The response object
 * @param {Function} next - Call this to pass control to the next middleware/route
 */
const protect = async (req, res, next) => {
  let token;

  // ─── STEP 1: CHECK IF TOKEN EXISTS IN THE HEADER ───
  // The standard format is: Authorization: Bearer eyJhbGciOiJI...
  // We check if the header exists AND starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // ─── STEP 2: EXTRACT THE TOKEN ───
      // "Bearer eyJhbGciOiJI..." → split by space → ["Bearer", "eyJhbGciOiJI..."]
      // We want index [1] which is the actual token
      token = req.headers.authorization.split(' ')[1];

      // ─── STEP 3: VERIFY THE TOKEN ───
      // jwt.verify() does two things:
      //   a) Checks if the token was signed with our JWT_SECRET (not tampered with)
      //   b) Checks if the token has expired
      // If either check fails, it throws an error (caught by our catch block)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ─── STEP 4: ATTACH USER TO THE REQUEST ───
      // The decoded token contains the user's ID (we put it there when creating the token)
      // We fetch the full user from the database, EXCLUDING the password
      // .select('-password') means "get everything EXCEPT the password field"
      req.user = await User.findById(decoded.id).select('-password');

      // If the user was deleted from DB but token still exists
      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      // ─── STEP 5: ALLOW THE REQUEST TO CONTINUE ───
      // next() passes control to the next middleware or route handler
      next();
    } catch (error) {
      // Token verification failed (expired, tampered, malformed, etc.)
      console.error('Token verification failed:', error.message);

      // Send different messages based on error type
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token has expired. Please login again.',
        });
      }

      return res.status(401).json({
        message: 'Not authorized. Invalid token.',
      });
    }
  }

  // If no token was found in the header at all
  if (!token) {
    return res.status(401).json({
      message: 'Not authorized. No token provided.',
    });
  }
};

module.exports = { protect };
