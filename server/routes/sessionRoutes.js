// ============================================================
// FILE: server/routes/sessionRoutes.js
// ============================================================

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');

// ALL session routes require authentication
// authMiddleware runs before every route here
router.use(authMiddleware);

router.post('/', sessionController.create);
router.get('/:id', sessionController.getOne);

module.exports = router;