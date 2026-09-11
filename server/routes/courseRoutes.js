const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/courseController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', ctrl.listCourses);
router.get('/:id', ctrl.getCourse);
router.post('/', requireAuth, requireRole('admin'), ctrl.createCourse);
router.put('/:id', requireAuth, requireRole('admin'), ctrl.updateCourse);
router.delete('/:id', requireAuth, requireRole('admin'), ctrl.deleteCourse);

module.exports = router;
