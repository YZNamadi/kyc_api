import { Router } from 'express';
import * as documentController from '../controllers/documentController';
import { validate, schemas } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { uploadConfigs, handleUploadError } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Documents
 *   description: Document upload and management endpoints
 */

/**
 * @openapi
 * /api/v1/documents:
 *   post:
 *     tags: [Documents]
 *     summary: Upload a document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - documentType
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               documentType:
 *                 type: string
 *                 enum: [passport, national_id, proof_of_address, selfie]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 document:
 *                   $ref: '#/components/schemas/DocumentResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many requests
 */
router.post(
  '/',
  authenticate,
  uploadLimiter,
  uploadConfigs.document,
  handleUploadError,
  validate(schemas.document.create),
  documentController.uploadDocument
);

/**
 * @openapi
 * /api/v1/documents/{id}:
 *   get:
 *     tags: [Documents]
 *     summary: Get document details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 document:
 *                   $ref: '#/components/schemas/DocumentResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 */
router.get('/:id', authenticate, documentController.getDocument);

/**
 * @openapi
 * /api/v1/documents:
 *   get:
 *     tags: [Documents]
 *     summary: List user's documents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: documentType
 *         schema:
 *           type: string
 *           enum: [passport, national_id, proof_of_address, selfie]
 *         description: Filter by document type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, verified, rejected]
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
 *         description: List of user's documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DocumentResponse'
 *                 total:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, documentController.listDocuments);

/**
 * @openapi
 * /api/v1/documents/admin/all:
 *   get:
 *     tags: [Documents]
 *     summary: List all documents (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: documentType
 *         schema:
 *           type: string
 *           enum: [passport, national_id, proof_of_address, selfie]
 *         description: Filter by document type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, verified, rejected]
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
 *         description: List of all documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DocumentResponse'
 *                 total:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), documentController.listDocuments);

/**
 * @openapi
 * /api/v1/documents/admin/{id}/status:
 *   patch:
 *     tags: [Documents]
 *     summary: Update document status (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentStatusUpdate'
 *     responses:
 *       200:
 *         description: Document status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 document:
 *                   $ref: '#/components/schemas/DocumentResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Document not found
 */
router.patch(
  '/admin/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(schemas.document.update),
  documentController.updateDocumentStatus
);

export default router; 