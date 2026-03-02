// ============================================================
// FILE: server/config/db.js
// PURPOSE: Creates and exports the database connection.
// Every file that needs the database imports from here.
// One connection, used everywhere. Clean.
// ============================================================

const { Pool } = require('pg');

// Pool = a group of database connections
// Instead of connecting/disconnecting every time,
// Pool keeps connections open and reuses them.
// Way more efficient for a web app.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
    // Required for Supabase — it uses SSL encryption.
    // rejectUnauthorized: false means we accept
    // Supabase's certificate without verifying it locally.
  }
});

// Test the connection when server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully!');
    release(); // release the client back to the pool
  }
});

// Export pool so other files can use it
// Usage: const pool = require('../config/db');
//        pool.query('SELECT * FROM users')
module.exports = pool;