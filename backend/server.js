// ============================================
// MAIN SERVER FILE (server.js)
// ============================================
// This is the entry point of our backend application.
// It sets up Express, connects to MongoDB, and starts listening
// for incoming requests.
//
// FLOW WHEN SERVER STARTS:
// 1. Load environment variables from .env
// 2. Connect to MongoDB
// 3. Set up middleware (CORS, JSON parsing)
// 4. Register API routes
// 5. Start listening on the specified port
// ============================================

// ── Load environment variables FIRST (before anything else uses them) ──
// dotenv reads the .env file and makes values available via process.env.VARIABLE_NAME
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ── Connect to MongoDB ──
// This runs asynchronously - the server starts even if DB takes a moment
connectDB();

// ── Create the Express application ──
const app = express();

// ── MIDDLEWARE SETUP ──

// CORS (Cross-Origin Resource Sharing)
// Our React frontend (http://localhost:3000) needs to talk to our backend (http://localhost:5000)
// Without CORS, the browser would BLOCK these requests for security
// cors() allows requests from any origin (in production, restrict this!)
app.use(
  cors({
    origin: 'http://localhost:3000', // Allow only our React frontend
    credentials: true, // Allow cookies and auth headers
  })
);

// JSON Body Parser
// When the frontend sends data (like email & password), it comes as JSON
// express.json() parses that JSON so we can access it via req.body
app.use(express.json());

// ── API ROUTES ──
// All routes in authRoutes.js will be prefixed with /api/auth
// Example: router.post('/register') → becomes POST /api/auth/register
// Exception: /api/profile is also defined in the same file
app.use('/api/auth', require('./routes/authRoutes'));

// We also mount profile under /api so it becomes GET /api/profile
app.use('/api', require('./routes/authRoutes'));

// ── ROOT ROUTE (for testing if server is running) ──
app.get('/', (req, res) => {
  res.json({
    message: '🚀 JWT Auth API is running!',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/profile (requires JWT)',
    },
  });
});

// ── START THE SERVER ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/profile`);
  console.log(`\n`);
});
