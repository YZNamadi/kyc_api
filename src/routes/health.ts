import { Router } from 'express';
import { checkRedisConnection } from '../config/redis';
import { testConnection } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

router.get('/health', async (_, res) => {
  try {
    // Check database connection
    await testConnection();
    
    // Check Redis connection
    const redisConnected = await checkRedisConnection();
    
    if (!redisConnected) {
      throw new Error('Redis connection failed');
    }
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected'
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
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