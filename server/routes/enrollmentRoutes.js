const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/enrollmentController');
const { requireAuth, requireSelfOrAdmin } = require('../middleware/auth');

router.get('/student/:studentId', requireAuth, requireSelfOrAdmin('studentId'), ctrl.myEnrollments);
router.get('/:studentId/:courseId/check', requireAuth, requireSelfOrAdmin('studentId'), ctrl.isEnrolled);
router.post('/:studentId/:courseId', requireAuth, requireSelfOrAdmin('studentId'), ctrl.enroll);

module.exports = router;
