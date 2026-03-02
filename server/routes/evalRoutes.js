// ============================================================
// FILE: server/routes/evalRoutes.js
// ============================================================

const express = require('express');
const router = express.Router();
const evalController = require('../controllers/evalController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// POST /api/evaluations — submit answer for evaluation
router.post('/', evalController.evaluate);

module.exports = router;