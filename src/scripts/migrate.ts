import { config } from 'dotenv';
import { logger } from '../utils/logger';
import { syncDatabase } from '../config/database';

// Load environment variables
config();

const migrate = async () => {
  try {
    logger.info('Starting database migration...');
    
    // Sync all models with force: true to recreate tables
    const success = await syncDatabase(true);
    
    if (success) {
      logger.info('Database migration completed successfully');
      process.exit(0);
    } else {
      logger.error('Database migration failed');
      process.exit(1);
    }
  } catch (error) {
    logger.error('Error during migration:', error);
    process.exit(1);
  }
};

// Run migration
migrate(); 