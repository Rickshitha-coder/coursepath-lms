const { Op } = require('sequelize');
const { Course, Enrollment, Progress } = require('../models');
const { buildModule } = require('../utils/resourceLibrary');
const { generateCourseHandout } = require('../utils/pdfGenerator');
const { pushNotification } = require('../sockets');

async function listCourses(req, res, next) {
  try {
    const { q, category } = req.query;
    const where = {};
    if (category && category !== 'all') where.category = category;
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { instructor: { [Op.like]: `%${q}%` } },
      ];
    }
    const courses = await Course.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(courses);
  } catch (err) { next(err); }
}

async function getCourse(req, res, next) {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    res.json(course);
  } catch (err) { next(err); }
}

async function createCourse(req, res, next) {
  try {
    const { name, instructor, duration, category, description, modules } = req.body;
    if (!name || !instructor || !duration || !category || !description) {
      return res.status(400).json({ error: 'All course fields are required.' });
    }
    if (!Array.isArray(modules) || modules.length === 0) {
      return res.status(400).json({ error: 'Add at least one module.' });
    }
    const builtModules = modules.map((t, i) => buildModule(t, i + 1, category));
    const course = await Course.create({ name, instructor, duration, category, description, modules: builtModules });

    const pdfPath = generateCourseHandout(course);
    course.pdfPath = pdfPath;
    await course.save();

    await pushNotification('all', `New course added: ${course.name}.`);
    res.status(201).json(course);
  } catch (err) { next(err); }
}

async function updateCourse(req, res, next) {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const { name, instructor, duration, category, description, modules } = req.body;
    const newCategory = category || course.category;
    let builtModules = course.modules;
    if (Array.isArray(modules)) {
      const oldModules = course.modules || [];
      builtModules = modules.map((t, i) => {
        if (typeof t === 'object' && t.id) {
          const prev = oldModules.find(m => m.id === t.id);
          return buildModule(t.title, i + 1, newCategory, prev);
        }
        return buildModule(t, i + 1, newCategory);
      });
    }

    course.name = name ?? course.name;
    course.instructor = instructor ?? course.instructor;
    course.duration = duration ?? course.duration;
    course.category = newCategory;
    course.description = description ?? course.description;
    course.modules = builtModules;
    await course.save();

    const pdfPath = generateCourseHandout(course);
    course.pdfPath = pdfPath;
    await course.save();

    res.json(course);
  } catch (err) { next(err); }
}

async function deleteCourse(req, res, next) {
  try {
    const id = req.params.id;
    await Course.destroy({ where: { id } });
    await Enrollment.destroy({ where: { courseId: id } });
    await Progress.destroy({ where: { courseId: id } });
    res.json({});
  } catch (err) { next(err); }
}

module.exports = { listCourses, getCourse, createCourse, updateCourse, deleteCourse };
