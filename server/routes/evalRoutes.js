const express = require('express');
const router = express.Router();
const evalController = require('../controllers/evalController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', evalController.evaluate);
router.get('/question/:questionId', evalController.getByQuestion); // ← NEW

module.exports = router;