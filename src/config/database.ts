import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger';

// Log database configuration
logger.info('Database configuration:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  // Don't log the password for security reasons
});

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
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : undefined
  }
});

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const syncDatabase = async () => {
  try {
    await sequelize.sync();
    logger.info('Database synchronized successfully.');
  } catch (error) {
    logger.error('Database synchronization failed:', error);
    throw error;
  }
};

export default sequelize; 