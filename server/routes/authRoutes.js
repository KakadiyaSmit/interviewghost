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