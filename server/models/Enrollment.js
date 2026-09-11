const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');

const Enrollment = sequelize.define('Enrollment', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => 'enr_' + uuidv4() },
  studentId: { type: DataTypes.STRING, allowNull: false },
  courseId: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
}, {
  tableName: 'enrollments',
  timestamps: true,
  indexes: [{ unique: true, fields: ['studentId', 'courseId'] }],
});

module.exports = Enrollment;
