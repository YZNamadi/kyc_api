import express from 'express';
import { checkRedisConnection } from '../config/redis';
import { testConnection } from '../config/database';
import { logger } from '../utils/logger';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const [redisStatus, dbStatus] = await Promise.all([
      checkRedisConnection(),
      testConnection()
    ]);

    res.json({
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus ? 'connected' : 'disconnected',
        redis: redisStatus ? 'connected' : 'disconnected'
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Temporary debug endpoint - REMOVE IN PRODUCTION
router.get('/debug', (_req, res) => {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
    REDIS_URL: process.env.REDIS_URL ? 'set' : 'not set',
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
  };
  res.json(env);
});

export default router; 