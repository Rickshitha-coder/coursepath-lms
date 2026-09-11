const { v4: uuidv4 } = require('uuid');
const { Enrollment, Progress, Course } = require('../models');
const { pushNotification } = require('../sockets');

// GET /api/enrollments/student/:studentId  (self or admin — see route guard)
async function myEnrollments(req, res, next) {
  try {
    const studentId = req.params.studentId;
    const enrollments = await Enrollment.findAll({ where: { studentId }, order: [['date', 'DESC']] });
    const data = [];
    for (const e of enrollments) {
      const course = await Course.findByPk(e.courseId);
      if (course) data.push({ ...e.toJSON(), course });
    }
    res.json(data);
  } catch (err) { next(err); }
}

// GET /api/enrollments/:studentId/:courseId/check
async function isEnrolled(req, res, next) {
  try {
    const { studentId, courseId } = req.params;
    const found = await Enrollment.findOne({ where: { studentId, courseId } });
    res.json(!!found);
  } catch (err) { next(err); }
}

// POST /api/enrollments/:studentId/:courseId  (self only)
async function enroll(req, res, next) {
  try {
    const { studentId, courseId } = req.params;
    const existing = await Enrollment.findOne({ where: { studentId, courseId } });
    if (existing) return res.status(409).json({ error: 'Already enrolled in this course.' });

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    await Enrollment.create({ studentId, courseId });
    await Progress.create({ studentId, courseId, completedModules: [], percentage: 0 });

    await pushNotification(studentId, `You're enrolled in ${course.name}. Happy learning!`);
    res.status(201).json({});
  } catch (err) { next(err); }
}

module.exports = { myEnrollments, isEnrolled, enroll };
