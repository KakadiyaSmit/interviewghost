// ============================================================
// FILE: server/routes/authRoutes.js
// ROLE: The WAITER 🧑‍💼
// PURPOSE: Maps URLs to controller functions.
// No logic here — just "this URL → this function"
// ============================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register → authController.register
router.post('/register', authController.register);

// POST /api/auth/login → authController.login
router.post('/login', authController.login);

module.exports = router;

const authMiddleware = require('../middleware/authMiddleware');

// Protected route — requires valid JWT
// This is how we'll protect ALL interview session routes later
router.get('/me', authMiddleware, (req, res) => {
  // req.user was set by authMiddleware
  res.json({
    message: 'You are authenticated!',
    user: req.user
  });
});