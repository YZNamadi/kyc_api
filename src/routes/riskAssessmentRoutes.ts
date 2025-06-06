import { Router } from 'express';
import * as riskAssessmentController from '../controllers/riskAssessmentController';
import { validate, schemas } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Risk Assessment
 *   description: Risk assessment management endpoints
 */

/**
 * @swagger
 * /api/v1/risk-assessment:
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
 *               $ref: '#/components/schemas/RiskAssessmentResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, validate(schemas.riskAssessment.create), riskAssessmentController.createAssessment);

/**
 * @swagger
 * /api/v1/risk-assessment/my-assessments:
 *   get:
 *     tags: [Risk Assessment]
 *     summary: List user's risk assessments
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RiskAssessmentResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/my-assessments', authenticate, riskAssessmentController.listUserAssessments);

/**
 * @swagger
 * /api/v1/risk-assessment/{id}:
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
 *         description: Risk assessment ID
 *     responses:
 *       200:
 *         description: Risk assessment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RiskAssessmentResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Risk assessment not found
 */
router.get('/:id', authenticate, riskAssessmentController.getAssessment);

/**
 * @swagger
 * /api/v1/risk-assessment/admin/all:
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RiskAssessmentResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), riskAssessmentController.listAllAssessments);

export default router; 