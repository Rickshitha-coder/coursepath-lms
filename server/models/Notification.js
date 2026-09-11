const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => 'ntf_' + uuidv4() },
  userId: { type: DataTypes.STRING, allowNull: false }, // a specific user id, or 'all' for a broadcast
  message: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'notifications',
  timestamps: false,
});

module.exports = Notification;
