const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

const dbDialect = process.env.DB_DIALECT || 'sqlite';

if (dbDialect === 'mysql' && process.env.DB_NAME) {
  console.log('🔌 Connecting to MySQL database...');
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  console.log('💾 MySQL config not found or DB_DIALECT is set to sqlite. Using SQLite database...');
  const storagePath = path.resolve(__dirname, '..', process.env.DB_STORAGE || 'database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
  });
}

module.exports = sequelize;
