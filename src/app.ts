import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './utils/errorHandler';
import { stream, logger } from './utils/logger';
import { checkRedisConnection } from './config/redis';
import { setupRoutes } from './routes';
import { specs, swaggerUi } from './config/swagger';

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Swagger UI
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream }));

// Swagger docs
app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'KYC API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
    filter: true,
    showCommonExtensions: true
  }
}));

// Routes
setupRoutes(app);

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    const redisStatus = await checkRedisConnection();
    res.json({
      status: 'ok',
      services: {
        redis: redisStatus ? 'connected' : 'disconnected',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app; 