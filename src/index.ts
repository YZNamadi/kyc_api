import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { testConnection, syncDatabase } from './config/database';
import { logger } from './utils/logger';
import healthRouter from './routes/health';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { serveSwaggerUI, setupSwaggerUI } from './config/swagger';

// Load environment variables
config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://kyc-api-pf6f.onrender.com', 'http://localhost:3000', 'https://kyc-api-pf6f.onrender.com/api/docs']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI setup
app.use('/api/docs', serveSwaggerUI, setupSwaggerUI);

// API base route
app.get('/api/v1', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'KYC API is running',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Routes
app.use('/api/v1/health', healthRouter);
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
      logger.info(`API Documentation available at: /api/docs`);
      logger.info(`Health check available at: /api/v1/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 