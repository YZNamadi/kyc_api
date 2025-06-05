import rateLimit from 'express-rate-limit';
import RedisStore, { RedisReply } from 'rate-limit-redis';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { Request } from 'express';

// Create Redis store with proper typing and error handling
const createRedisStore = (prefix: string) => {
  const store = new RedisStore({
    sendCommand: async (command: string, ...args: string[]): Promise<RedisReply> => {
      try {
        const result = await redisClient.call(command, ...args);
        return result as RedisReply;
      } catch (error) {
        logger.error('Redis store error:', error);
        // Return a default value that won't block requests
        return 0;
      }
    },
    prefix,
  });

  return store;
};

// General API rate limiter
export const apiLimiter = rateLimit({
  store: createRedisStore('rl:api:'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

// Authentication rate limiter (more strict)
export const authLimiter = rateLimit({
  store: createRedisStore('rl:auth:'),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Allow 100 failed attempts per hour for testing
  message: 'Too many failed login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

// KYC verification rate limiter
export const kycLimiter = rateLimit({
  store: createRedisStore('rl:kyc:'),
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // Limit each user to 3 KYC verifications per day
  message: 'You have reached the maximum number of KYC verifications for today.',
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  keyGenerator: (req: Request): string => {
    // Use user ID if authenticated, otherwise use IP
    return (req.user as any)?.id || req.ip;
  },
});

// Document upload rate limiter
export const uploadLimiter = rateLimit({
  store: createRedisStore('rl:upload:'),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 uploads per hour
  message: 'You have reached the maximum number of uploads for this hour.',
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  keyGenerator: (req: Request): string => {
    return (req.user as any)?.id || req.ip;
  },
}); 