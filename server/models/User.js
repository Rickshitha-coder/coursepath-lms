const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => 'usr_' + uuidv4() },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false }, // bcrypt hash, never plain text
  department: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.ENUM('student', 'admin'), allowNull: false, defaultValue: 'student' },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
