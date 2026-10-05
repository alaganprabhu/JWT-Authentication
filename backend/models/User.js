// ============================================
// USER MODEL (models/User.js)
// ============================================
// A "model" defines the structure of data in our database.
// Think of it as a blueprint for what a "User" looks like.
// Every user will have: name, email, and password.
// ============================================

const mongoose = require('mongoose');

/**
 * USER SCHEMA
 * -----------
 * A Schema defines the "shape" of documents (rows) in a MongoDB collection (table).
 * Each field has:
 *   - type: What kind of data (String, Number, Date, etc.)
 *   - required: Must this field be provided? (true/false)
 *   - unique: Can two users have the same value? (true = no duplicates)
 */
const userSchema = new mongoose.Schema(
  {
    // The user's full name
    name: {
      type: String,
      required: [true, 'Please provide a name'], // Custom error message if missing
      trim: true, // Removes whitespace from both ends ("  John  " → "John")
    },

    // The user's email address (used for login)
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true, // No two users can have the same email
      lowercase: true, // Converts "John@Email.COM" → "john@email.com"
      trim: true,
    },

    // The user's password (will be stored as a HASHED version, never plain text!)
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
  },
  {
    // timestamps: true automatically adds "createdAt" and "updatedAt" fields
    // So we know when each user signed up and when their data was last modified
    timestamps: true,
  }
);

// Create the model from our schema
// "User" will create/use a collection called "users" in MongoDB
const User = mongoose.model('User', userSchema);

module.exports = User;
