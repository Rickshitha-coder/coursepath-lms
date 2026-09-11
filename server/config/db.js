const path = require('path');
const { Sequelize } = require('sequelize');

// SQLite = a real, file-based relational database. Zero install, zero
// external service required — the whole point being "download and run".
// Swapping to MongoDB/Postgres/MySQL later only means changing this file
// (Sequelize supports postgres/mysql/mariadb/mssql dialects directly;
// for MongoDB you'd swap Sequelize for Mongoose, but every model/
// controller here maps 1:1 onto Mongoose schemas, so the port is
// mechanical, not a redesign).
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'data', 'coursepath.sqlite'),
  logging: false,
});

module.exports = sequelize;
