import express from 'express';
import { checkRedisConnection } from '../config/redis';
import { testConnection } from '../config/database';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check and system status endpoints
 */

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     tags: [Health]
 *     summary: Check system health
 *     description: Returns the health status of the API and its dependencies
 *     responses:
 *       200:
 *         description: System health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ok, error]
 *                 version:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       enum: [connected, disconnected]
 *                     redis:
 *                       type: string
 *                       enum: [connected, disconnected]
 *                 environment:
 *                   type: string
 *       500:
 *         description: System health check failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [error]
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
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

/**
 * @swagger
 * /api/v1/health/debug:
 *   get:
 *     tags: [Health]
 *     summary: Get debug information
 *     description: Returns detailed debug information about the system configuration
 *     responses:
 *       200:
 *         description: Debug information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 NODE_ENV:
 *                   type: string
 *                 DATABASE_URL:
 *                   type: string
 *                 REDIS_URL:
 *                   type: string
 *                 DB_HOST:
 *                   type: string
 *                 DB_PORT:
 *                   type: string
 *                 DB_NAME:
 *                   type: string
 *                 DB_USER:
 *                   type: string
 *                 REDIS_HOST:
 *                   type: string
 *                 REDIS_PORT:
 *                   type: string
 */
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