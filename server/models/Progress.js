const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');

const Progress = sequelize.define('Progress', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => 'prg_' + uuidv4() },
  studentId: { type: DataTypes.STRING, allowNull: false },
  courseId: { type: DataTypes.STRING, allowNull: false },
  completedModules: { type: DataTypes.JSON, allowNull: false, defaultValue: [] }, // array of module ids
  percentage: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  tableName: 'progress',
  timestamps: true,
  indexes: [{ unique: true, fields: ['studentId', 'courseId'] }],
});

module.exports = Progress;
