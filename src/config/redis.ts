import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Parse Redis URL if provided (Render provides REDIS_URL)
const redisUrl = process.env.REDIS_URL;
let redisConfig;

if (redisUrl) {
  logger.info('Using REDIS_URL for configuration');
  try {
    // Handle both formats:
    // 1. redis://:password@host:port
    // 2. redis://host:port
    const url = new URL(redisUrl);
    redisConfig = {
      host: url.hostname,
      port: parseInt(url.port || '6379'),
      password: url.password || undefined,
    };
    logger.info('Successfully parsed REDIS_URL', {
      host: redisConfig.host,
      port: redisConfig.port,
      hasPassword: !!redisConfig.password
    });
  } catch (error) {
    logger.error('Failed to parse REDIS_URL:', error);
  }
} else {
  logger.info('Using individual Redis environment variables');
}

// Log the final configuration (without sensitive data)
logger.info('Redis configuration:', {
  host: redisConfig?.host || process.env.REDIS_HOST || 'redis',
  port: redisConfig?.port || parseInt(process.env.REDIS_PORT || '6379'),
  hasPassword: !!(redisConfig?.password || process.env.REDIS_PASSWORD),
  isProduction: process.env.NODE_ENV === 'production',
  hasTLS: process.env.NODE_ENV === 'production'
});

// Redis configuration
const config = {
  host: redisConfig?.host || process.env.REDIS_HOST || 'redis',
  port: redisConfig?.port || parseInt(process.env.REDIS_PORT || '6379'),
  password: redisConfig?.password || process.env.REDIS_PASSWORD || undefined,
  tls: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : undefined,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 1000, 30000); // Max 30 second delay
    logger.info(`Redis retry attempt ${times} with delay ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: 10,
  enableOfflineQueue: true,
  connectTimeout: 30000,
  lazyConnect: true,
  reconnectOnError: (err: Error) => {
    logger.error('Redis reconnect on error:', err.message);
    return true;
  }
};

// Create Redis client
const redisClient = new Redis(config);

// Handle Redis connection events
redisClient.on('connect', () => {
  logger.info('Redis client connected successfully');
});

redisClient.on('error', (err: Error) => {
  logger.error('Redis connection error:', err);
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting');
});

redisClient.on('end', () => {
  logger.info('Redis client connection ended');
});

// Function to check Redis connection
export const checkRedisConnection = async (): Promise<boolean> => {
  try {
    await redisClient.ping();
    logger.info('Redis connection check successful');
    return true;
  } catch (error) {
    logger.error('Redis connection check failed:', error);
    return false;
  }
};

// Function to gracefully close Redis connection
export const closeRedisConnection = async (): Promise<void> => {
  try {
    await redisClient.quit();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
};

export default redisClient; 