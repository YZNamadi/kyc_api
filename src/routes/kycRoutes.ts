import { Router } from 'express';
import { KYCController } from '../controllers/kycController';
import { validate, schemas } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { kycLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: KYC
 *   description: KYC verification endpoints
 */

// Authenticated user routes
router.post('/', authenticate, kycLimiter, validate(schemas.kycVerification.create), KYCController.submitKYC);
router.get('/:id', authenticate, KYCController.getKYCStatus);
router.get('/', authenticate, KYCController.listUserKYC);

// Admin routes
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), KYCController.listAllKYC);
router.patch('/admin/:id/status', authenticate, authorize(UserRole.ADMIN), validate(schemas.kycVerification.update), KYCController.updateKYCStatus);

export default router; 