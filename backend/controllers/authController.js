// ============================================
// AUTH CONTROLLER (controllers/authController.js)
// ============================================
// Controllers contain the "business logic" — the actual code that
// runs when someone hits our API endpoints.
// We have 3 main actions:
//   1. registerUser — Create a new account (Sign Up)
//   2. loginUser — Log in to an existing account
//   3. getUserProfile — Get the logged-in user's info (protected)
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─────────────────────────────────────────────
// HELPER: Generate a JWT Token
// ─────────────────────────────────────────────
/**
 * generateToken - Creates a signed JWT token
 *
 * HOW JWT WORKS:
 * A JWT has 3 parts separated by dots: xxxxx.yyyyy.zzzzz
 *   1. Header — Algorithm used (HS256) and token type (JWT)
 *   2. Payload — The data we store (user's ID in our case)
 *   3. Signature — Created using Header + Payload + Secret Key
 *
 * The signature ensures no one can tamper with the token.
 * If someone changes the payload, the signature won't match,
 * and jwt.verify() will reject it.
 *
 * @param {string} id - The user's MongoDB _id
 * @returns {string} - The signed JWT token string
 */
const generateToken = (id) => {
  return jwt.sign(
    { id }, // Payload: the data embedded in the token
    process.env.JWT_SECRET, // Secret key: only our server knows this
    { expiresIn: process.env.JWT_EXPIRE } // Options: token expires after this time
  );
};

// ─────────────────────────────────────────────
// 1. REGISTER (Sign Up) — POST /api/auth/register
// ─────────────────────────────────────────────
/**
 * WHAT HAPPENS DURING SIGN UP:
 *
 * 1. User fills out the form with name, email, and password
 * 2. Frontend sends a POST request with this data to /api/auth/register
 * 3. We check if the email is already registered
 * 4. We HASH the password (convert it to an unreadable string using bcrypt)
 *    - Why? So even if our database is hacked, passwords remain safe
 *    - "password123" → "$2a$10$X7UrH5YxX..." (impossible to reverse)
 * 5. We save the new user to MongoDB
 * 6. We generate a JWT token and send it back
 * 7. Frontend stores this token in localStorage
 */
const registerUser = async (req, res) => {
  try {
    // Extract the data sent by the frontend from the request body
    const { name, email, password } = req.body;

    // ── Validation: Make sure all fields are provided ──
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide all fields (name, email, password)',
      });
    }

    // ── Check if email already exists in our database ──
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'An account with this email already exists',
      });
    }

    // ── Hash the password using bcrypt ──
    // "salt" is random data mixed into the hash to make it unique
    // genSalt(10) means 10 rounds of hashing (higher = more secure but slower)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // At this point: "myPassword123" → "$2a$10$K8Y3nU..." (irreversible!)

    // ── Create the user in MongoDB ──
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // Store the HASHED password, never the plain text!
    });

    // ── Generate JWT token for the new user ──
    const token = generateToken(user._id);

    // ── Send the response back to the frontend ──
    res.status(201).json({
      message: 'Account created successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token, // The frontend will save this in localStorage
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// 2. LOGIN — POST /api/auth/login
// ─────────────────────────────────────────────
/**
 * WHAT HAPPENS DURING LOGIN:
 *
 * 1. User enters their email and password on the Login page
 * 2. Frontend sends a POST request to /api/auth/login
 * 3. We find the user by email in our database
 * 4. We compare the entered password with the stored hashed password
 *    - bcrypt.compare() hashes the entered password the same way
 *      and checks if the result matches what's stored
 * 5. If they match → generate a JWT token and send it back
 * 6. If they don't match → send an error message
 * 7. Frontend stores the token in localStorage on success
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validation ──
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    // ── Find the user by email ──
    const user = await User.findOne({ email });
    if (!user) {
      // We say "Invalid credentials" instead of "User not found"
      // for security — we don't want hackers to know which emails exist
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ── Compare the entered password with the hashed password ──
    // bcrypt.compare("myPassword123", "$2a$10$K8Y3nU...") → true or false
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ── Password correct! Generate JWT token ──
    const token = generateToken(user._id);

    // ── Send success response with token ──
    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token, // Frontend saves this in localStorage
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// 3. GET PROFILE — GET /api/profile (Protected Route)
// ─────────────────────────────────────────────
/**
 * HOW PROTECTED ROUTES WORK:
 *
 * 1. This route uses the "protect" middleware (see authMiddleware.js)
 * 2. The middleware runs FIRST and checks for a valid JWT token
 * 3. If the token is valid, the middleware adds `req.user` (the user's data)
 * 4. Then this function runs and simply returns that user data
 * 5. If the token is invalid/missing, the middleware sends a 401 error
 *    and this function NEVER runs
 *
 * HOW THE FRONTEND SENDS THE TOKEN:
 * The frontend includes the JWT in the request headers like this:
 *   headers: { Authorization: "Bearer eyJhbGciOiJI..." }
 */
const getUserProfile = async (req, res) => {
  // req.user was set by the protect middleware (if token was valid)
  // It contains the user's data WITHOUT the password
  res.status(200).json({
    message: 'Profile data retrieved successfully',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = { registerUser, loginUser, getUserProfile };
