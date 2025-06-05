import express from 'express';
import { config } from 'dotenv';
import { testConnection, syncDatabase } from './config/database';
import { logger } from './utils/logger';
import healthRouter from './routes/health';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', healthRouter);
setupRoutes(app);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // Sync database models
    const isSynced = await syncDatabase(false);
    if (!isSynced) {
      throw new Error('Failed to sync database models');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 