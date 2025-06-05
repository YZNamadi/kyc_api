import sequelize from '../config/database';
import { logger } from '../utils/logger';

const migrate = async () => {
  try {
    await sequelize.sync({ alter: true });
    logger.info('Database migrated successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error migrating database:', error);
    process.exit(1);
  }
};

migrate(); 