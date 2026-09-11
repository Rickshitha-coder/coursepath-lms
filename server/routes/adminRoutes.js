const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/students', requireAuth, requireRole('admin'), ctrl.listStudents);
router.delete('/students/:id', requireAuth, requireRole('admin'), ctrl.deleteStudent);
// Matches the original app: stats are shown on the public landing page too.
router.get('/stats', ctrl.adminStats);

module.exports = router;
