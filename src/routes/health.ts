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

export default router; 