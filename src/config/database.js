const { Sequelize } = require('sequelize');

const sslRequired = String(process.env.PGSSLMODE || '').toLowerCase() === 'require';

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    port: process.env.PGPORT || 5432,
    dialect: 'postgres',
    dialectOptions: sslRequired
      ? { ssl: { require: true, rejectUnauthorized: false } } // <- bypass verificación
      : {},
    logging: false,
  }
);

module.exports = sequelize;
