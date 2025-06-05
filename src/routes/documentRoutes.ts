import { Router } from 'express';
import * as documentController from '../controllers/documentController';
import { validate, schemas } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { uploadConfigs, handleUploadError } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../models/User';

const router = Router();

// Authenticated user routes
router.post(
  '/',
  authenticate,
  uploadLimiter,
  uploadConfigs.document,
  handleUploadError,
  validate(schemas.document.create),
  documentController.uploadDocument
);
router.get('/:id', authenticate, documentController.getDocument);
router.get('/', authenticate, documentController.listDocuments);

// Admin routes
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), documentController.listDocuments);
router.patch(
  '/admin/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(schemas.document.update),
  documentController.updateDocumentStatus
);

export default router; 