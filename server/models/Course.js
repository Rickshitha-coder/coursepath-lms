const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');

const Course = sequelize.define('Course', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => 'crs_' + uuidv4() },
  name: { type: DataTypes.STRING, allowNull: false },
  instructor: { type: DataTypes.STRING, allowNull: false },
  duration: { type: DataTypes.INTEGER, allowNull: false }, // weeks
  category: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  // Modules are stored as JSON: [{ id, title, order, content, videoId, videoTitle, materials:[{title,url}] }]
  // This mirrors real "Module" documents/rows one-to-one; kept embedded here
  // for simplicity, same way a MongoDB course document would embed them.
  modules: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  // Path (relative to /server/public) to a generated PDF handout for the course.
  pdfPath: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'courses',
  timestamps: true,
});

module.exports = Course;
