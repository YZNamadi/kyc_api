import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { errorHandler, notFoundHandler } from './utils/errorHandler';
import { logHttpRequest, logger } from './utils/logger';
import { checkRedisConnection } from './config/redis';
import userRoutes from './routes/userRoutes';
import kycRoutes from './routes/kycRoutes';
import documentRoutes from './routes/documentRoutes';
import riskAssessmentRoutes from './routes/riskAssessmentRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(logHttpRequest);

// Static files (for uploaded documents)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/risk-assessments', riskAssessmentRoutes);

// Swagger docs
const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

// Not found and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app; 