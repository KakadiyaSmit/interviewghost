// ============================================================
// FILE: server/middleware/authMiddleware.js
// PURPOSE: Protects routes that require login.
// Any route using this middleware REQUIRES a valid JWT.
// ============================================================

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // --------------------------------------------------------
  // STEP 1: Get the token from the request header
  // Convention: token is sent in "Authorization" header
  // Format: "Bearer eyJhbGciOiJIUzI1NiIs..."
  // "Bearer" = type of token, then space, then the token
  // --------------------------------------------------------
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  // split(' ')[1] = take everything AFTER "Bearer "

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
    // 401 = Unauthorized
  }

  // --------------------------------------------------------
  // STEP 2: Verify the token
  // jwt.verify checks:
  // 1. Was this token signed with our secret? (not fake)
  // 2. Has it expired?
  // If both pass → decoded = the payload we stored in it
  // --------------------------------------------------------
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "580adb1c-...", email: "smit@test.com" }

    req.user = decoded;
    // Attach the user info to the request object
    // Now any route after this middleware can access req.user
    // e.g. req.user.id, req.user.email

    next();
    // next() = "I'm done, pass to the next handler"
    // Without next(), the request just hangs forever!

  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;