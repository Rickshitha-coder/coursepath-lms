const sequelize = require('../config/db');
const User = require('./User');
const Course = require('./Course');
const Enrollment = require('./Enrollment');
const Progress = require('./Progress');
const Notification = require('./Notification');
const Message = require('./Message');

// Relationships (logical FKs — kept loose/string-based like a document DB,
// but declared here so `include` joins work for richer queries).
User.hasMany(Enrollment, { foreignKey: 'studentId', sourceKey: 'id' });
Course.hasMany(Enrollment, { foreignKey: 'courseId', sourceKey: 'id' });
Enrollment.belongsTo(User, { foreignKey: 'studentId', targetKey: 'id' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', targetKey: 'id' });

User.hasMany(Progress, { foreignKey: 'studentId', sourceKey: 'id' });
Course.hasMany(Progress, { foreignKey: 'courseId', sourceKey: 'id' });

Course.hasMany(Message, { foreignKey: 'courseId', sourceKey: 'id' });

module.exports = { sequelize, User, Course, Enrollment, Progress, Notification, Message };
