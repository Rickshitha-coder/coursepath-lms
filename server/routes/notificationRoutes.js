const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');
const { requireAuth, requireSelfOrAdmin } = require('../middleware/auth');

router.get('/:userId', requireAuth, requireSelfOrAdmin('userId'), ctrl.listNotifications);
router.put('/:userId/read', requireAuth, requireSelfOrAdmin('userId'), ctrl.markAllRead);

module.exports = router;
