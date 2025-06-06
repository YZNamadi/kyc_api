import { Router } from 'express';
import * as riskAssessmentController from '../controllers/riskAssessmentController';
import { validate, schemas } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Risk Assessment
 *   description: Risk assessment management endpoints
 */

/**
 * @openapi
 * /api/v1/risk-assessments:
 *   post:
 *     tags: [Risk Assessment]
 *     summary: Create a new risk assessment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RiskAssessmentCreate'
 *     responses:
 *       201:
 *         description: Risk assessment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 assessment:
 *                   $ref: '#/components/schemas/RiskAssessmentResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, validate(schemas.riskAssessment.create), riskAssessmentController.createAssessment);

/**
 * @openapi
 * /api/v1/risk-assessments/my-assessments:
 *   get:
 *     tags: [Risk Assessment]
 *     summary: List user's risk assessments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [identity, address, employment, financial]
 *         description: Filter by assessment type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed]
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
 *         description: List of user's risk assessments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assessments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RiskAssessmentResponse'
 *                 total:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/my-assessments', authenticate, riskAssessmentController.listUserAssessments);

/**
 * @openapi
 * /api/v1/risk-assessments/{id}:
 *   get:
 *     tags: [Risk Assessment]
 *     summary: Get risk assessment details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Risk assessment ID
 *     responses:
 *       200:
 *         description: Risk assessment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assessment:
 *                   $ref: '#/components/schemas/RiskAssessmentResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Risk assessment not found
 */
router.get('/:id', authenticate, riskAssessmentController.getAssessment);

/**
 * @openapi
 * /api/v1/risk-assessments/admin/all:
 *   get:
 *     tags: [Risk Assessment]
 *     summary: List all risk assessments (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed]
 *         description: Filter by status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
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
 *         description: List of all risk assessments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assessments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RiskAssessmentResponse'
 *                 total:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), riskAssessmentController.listAllAssessments);

export default router; 