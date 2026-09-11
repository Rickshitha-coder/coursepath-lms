const { User, Course, Enrollment, Progress } = require('../models');

async function listStudents(req, res, next) {
  try {
    const students = await User.findAll({ where: { role: 'student' }, attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] });
    res.json(students);
  } catch (err) { next(err); }
}

async function deleteStudent(req, res, next) {
  try {
    const id = req.params.id;
    await User.destroy({ where: { id, role: 'student' } });
    await Enrollment.destroy({ where: { studentId: id } });
    await Progress.destroy({ where: { studentId: id } });
    res.json({});
  } catch (err) { next(err); }
}

// Public-ish (matches original app's behavior — index.html shows these
// figures on the public landing page too).
async function adminStats(req, res, next) {
  try {
    const students = await User.count({ where: { role: 'student' } });
    const courses = await Course.findAll();
    const enrollments = await Enrollment.findAll();
    const progress = await Progress.findAll();
    const completed = progress.filter(p => p.percentage === 100).length;

    const perCourse = courses.map(c => {
      const rows = progress.filter(p => p.courseId === c.id);
      const avgProgress = rows.length ? Math.round(rows.reduce((s, r) => s + r.percentage, 0) / rows.length) : 0;
      return {
        name: c.name,
        enrolled: enrollments.filter(e => e.courseId === c.id).length,
        avgProgress,
      };
    });

    res.json({
      totalStudents: students,
      totalCourses: courses.length,
      activeEnrollments: enrollments.length,
      completionReports: completed,
      perCourse,
    });
  } catch (err) { next(err); }
}

module.exports = { listStudents, deleteStudent, adminStats };
