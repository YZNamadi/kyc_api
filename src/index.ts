import './models/index';
import app from './app';
import { testConnection, syncDatabase } from './config/database';
import { logger } from './utils/logger';

const port = process.env.PORT || 3000;

// Test database connection and sync models
testConnection()
  .then(() => syncDatabase())
  .then(() => {
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }); 