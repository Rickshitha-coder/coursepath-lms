const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/progressController');
const { requireAuth, requireSelfOrAdmin } = require('../middleware/auth');

router.get('/student/:studentId', requireAuth, requireSelfOrAdmin('studentId'), ctrl.allProgressForStudent);
router.get('/student/:studentId/course/:courseId', requireAuth, requireSelfOrAdmin('studentId'), ctrl.getProgress);
router.post('/:studentId/:courseId/:moduleId', requireAuth, requireSelfOrAdmin('studentId'), ctrl.completeModule);

module.exports = router;
