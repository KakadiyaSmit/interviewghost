const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', sessionController.create);
router.get('/', sessionController.getAll);    // ← NEW
router.get('/:id', sessionController.getOne);

module.exports = router;