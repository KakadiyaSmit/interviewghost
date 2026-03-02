// ============================================================
// FILE: server/services/authService.js
// ROLE: The CHEF 👨‍🍳
// PURPOSE: All the real auth logic lives here.
// The controller just calls these functions.
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ============================================================
// REGISTER SERVICE
// What it does:
// 1. Check if email already exists
// 2. Hash the password
// 3. Save user to database
// 4. Return a JWT token
// ============================================================

const register = async (email, password) => {

  // STEP 1: Check if user already exists
  // We query the database for this email
  const existingUser = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
    // $1 is a placeholder — prevents SQL injection attacks
    // SQL injection = hackers trying to break your database
    // with malicious input like: "'; DROP TABLE users; --"
  );

  if (existingUser.rows.length > 0) {
    // .rows = the array of results from the database
    // If length > 0, user already exists
    throw new Error('Email already registered');
    // throw = stop execution and send error to controller
  }

  // STEP 2: Hash the password
  // bcrypt.hash(password, saltRounds)
  // saltRounds = 10 means bcrypt runs 2^10 = 1024 iterations
  // More iterations = harder to crack = more secure
  // 10 is the industry standard balance of speed vs security
  const password_hash = await bcrypt.hash(password, 10);
  // "mypassword123" → "$2b$10$N9qo8uLOickgx2ZMRZo..."
  // This is ONE WAY — you can never reverse it back

  // STEP 3: Save user to database
  const newUser = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
    [email, password_hash]
    // RETURNING * = give me back the row we just inserted
    // So we can use the user's id in the JWT
  );

  const user = newUser.rows[0];
  // rows[0] = the first (and only) result

  // STEP 4: Create JWT token
  // jwt.sign(payload, secret, options)
  // payload = data we want to store IN the token
  // secret = our secret key from .env
  // expiresIn = token expires after 7 days
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, user: { id: user.id, email: user.email } };
  // Never return password_hash to the client!
};

// ============================================================
// LOGIN SERVICE
// What it does:
// 1. Find user by email
// 2. Compare password with hash
// 3. Return JWT token
// ============================================================

const login = async (email, password) => {

  // STEP 1: Find user by email
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
    // Notice: we don't say "email not found"
    // That would tell hackers which emails exist!
    // Always use a vague error message for auth.
  }

  const user = result.rows[0];

  // STEP 2: Compare password with hash
  // bcrypt.compare(plainPassword, hash)
  // This hashes the input and compares — you can't reverse bcrypt
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // STEP 3: Create JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, user: { id: user.id, email: user.email } };
};

module.exports = { register, login };