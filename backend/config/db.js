// ============================================
// DATABASE CONNECTION (config/db.js)
// ============================================
// This file handles connecting our Express server to MongoDB.
// We use Mongoose, which is an ODM (Object Data Modeling) library
// that makes it easy to work with MongoDB in Node.js.
// ============================================

const mongoose = require('mongoose');

/**
 * connectDB - Connects to MongoDB using the connection string from .env
 *
 * HOW IT WORKS:
 * 1. We call mongoose.connect() with the MONGO_URI from our .env file
 * 2. If the connection is successful, we log a success message
 * 3. If it fails (wrong password, server down, etc.), we log the error and stop the app
 *
 * WHY async/await?
 * - Connecting to a database takes time (it's a network operation)
 * - async/await lets us wait for the connection before moving on
 * - Without it, our server might try to handle requests before the DB is ready
 */
// const connectDB = async () => {
//   try {
//     // mongoose.connect() returns a promise that resolves when connected
//     const conn = await mongoose.connect(process.env.MONGO_URI);

//     // If we reach this line, the connection was successful!
//     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     // If connection fails, log the error and exit the process
//     // process.exit(1) means "exit with an error"
//     console.error(`❌ MongoDB Connection Error: ${error.message}`);
//     process.exit(1);
//   }
// };

const connectDB = async () => {
  try {

      const url = process.env.MONGO_URI

      await mongoose.connect(url, {
          // dbName: 'testform',
          family: 4
      })

      console.log('Connected to DB')

  } catch (err) {
      console.log("Failed to connect", err.message)
  }
}

// export default connectDB

// Export the function so we can use it in server.js
module.exports = connectDB;
