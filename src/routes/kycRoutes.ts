import { Router } from 'express';
import { KYCController } from '../controllers/kycController';
import { validate, schemas } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { kycLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: KYC
 *   description: KYC verification and management endpoints
 */

/**
 * @openapi
 * /api/v1/kyc:
 *   post:
 *     tags: [KYC]
 *     summary: Submit KYC verification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KYCSubmission'
 *     responses:
 *       201:
 *         description: KYC submission successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KYCResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many requests
 */
router.post('/', authenticate, kycLimiter, validate(schemas.kycVerification.create), KYCController.submitKYC);

/**
 * @openapi
 * /api/v1/kyc:
 *   get:
 *     tags: [KYC]
 *     summary: List user's KYC verifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of user's KYC verifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KYCResponse'
 *                 total:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, KYCController.listUserKYC);

/**
 * @openapi
 * /api/v1/kyc/{id}:
 *   get:
 *     tags: [KYC]
 *     summary: Get KYC verification details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: KYC verification ID
 *     responses:
 *       200:
 *         description: KYC verification details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 verification:
 *                   $ref: '#/components/schemas/KYCResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this verification
 *       404:
 *         description: KYC verification not found
 */
router.get('/:id', authenticate, KYCController.getKYC);

/**
 * @openapi
 * /api/v1/kyc/admin/all:
 *   get:
 *     tags: [KYC]
 *     summary: List all KYC verifications (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of all KYC verifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KYCResponse'
 *                 total:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), KYCController.listAllKYC);

/**
 * @openapi
 * /api/v1/kyc/admin/{id}/status:
 *   patch:
 *     tags: [KYC]
 *     summary: Update KYC verification status (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: KYC verification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KYCStatusUpdate'
 *     responses:
 *       200:
 *         description: KYC status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 verification:
 *                   $ref: '#/components/schemas/KYCResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: KYC verification not found
 */
router.patch('/admin/:id/status', authenticate, authorize(UserRole.ADMIN), validate(schemas.kycVerification.update), KYCController.updateKYCStatus);

export default router; 