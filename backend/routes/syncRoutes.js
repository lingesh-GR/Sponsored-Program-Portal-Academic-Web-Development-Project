const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const syncController = require('../controllers/syncController');

// Manual sync trigger (admin only)
router.post('/admin/sync-sheets', verifyToken, isAdmin, syncController.syncAll);

module.exports = router;
