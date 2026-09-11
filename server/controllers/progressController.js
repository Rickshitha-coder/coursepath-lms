const { Progress, Course } = require('../models');
const { pushNotification } = require('../sockets');

// GET /api/progress/student/:studentId
async function allProgressForStudent(req, res, next) {
  try {
    const rows = await Progress.findAll({ where: { studentId: req.params.studentId } });
    res.json(rows);
  } catch (err) { next(err); }
}

// GET /api/progress/student/:studentId/course/:courseId
async function getProgress(req, res, next) {
  try {
    const { studentId, courseId } = req.params;
    const row = await Progress.findOne({ where: { studentId, courseId } });
    res.json(row || null);
  } catch (err) { next(err); }
}

// POST /api/progress/:studentId/:courseId/:moduleId  (self only)
async function completeModule(req, res, next) {
  try {
    const { studentId, courseId, moduleId } = req.params;
    const record = await Progress.findOne({ where: { studentId, courseId } });
    if (!record) return res.status(404).json({ error: 'Not enrolled.' });

    const course = await Course.findByPk(courseId);
    const total = course ? (course.modules || []).length || 1 : 1;

    const completed = new Set(record.completedModules || []);
    completed.add(moduleId);
    record.completedModules = Array.from(completed);
    record.percentage = Math.round((record.completedModules.length / total) * 100);
    await record.save();

    if (record.percentage === 100) {
      await pushNotification(studentId, `Certificate unlocked — you completed ${course.name}!`);
    }
    res.json(record);
  } catch (err) { next(err); }
}

module.exports = { allProgressForStudent, getProgress, completeModule };
