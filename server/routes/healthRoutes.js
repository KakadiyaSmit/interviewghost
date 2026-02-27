// ============================================================
// FILE: server/routes/healthRoutes.js
// ROLE: The WAITER 🧑‍💼
// 
// This file only does ONE thing:
// "When someone visits this URL, call this controller"
// It knows nothing about HOW the response is built.
// ============================================================

const express = require('express');

// express.Router() creates a mini app — a chunk of routes
// you can attach to your main app. Think of it as a
// sub-menu in a restaurant.
const router = express.Router();

// Import the controller (the kitchen manager)
// We haven't made this yet — we'll do it next
const healthController = require('../controllers/healthController');

// When someone does GET /health → run healthController.check
// Notice: no logic here. Just "this URL → this function"
router.get('/', healthController.check);

// Export this router so index.js can use it
module.exports = router;