const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');

// Backs the real-time per-course discussion chat (Socket.IO, task 13).
const Message = sequelize.define('Message', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => 'msg_' + uuidv4() },
  courseId: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.STRING, allowNull: false },
  userName: { type: DataTypes.STRING, allowNull: false },
  text: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'messages',
  timestamps: false,
});

module.exports = Message;
