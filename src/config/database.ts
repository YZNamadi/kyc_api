import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
import { logger } from '../utils/logger';

config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'kyc_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: isProduction ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

// Test database connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
};

// Sync database models
export const syncDatabase = async (force: boolean = false) => {
  try {
    await sequelize.sync({ force });
    logger.info('Database synchronized successfully.');
    return true;
  } catch (error) {
    logger.error('Error synchronizing database:', error);
    return false;
  }
};

export default sequelize; 