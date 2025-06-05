import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { KYCController } from '../controllers/kycController';
import * as documentController from '../controllers/documentController';
import * as userController from '../controllers/userController';
import { UserRole } from '../models/User';

const router = Router();

// Admin routes
router.use(authenticate, authorize(UserRole.ADMIN));

// KYC management
router.get('/kyc', KYCController.listAllKYC);
router.put('/kyc/:id/status', KYCController.updateKYCStatus);

// Document management
router.get('/documents', documentController.listDocuments);
router.put('/documents/:id/status', documentController.updateDocumentStatus);

// User management
router.get('/users', userController.listUsers);
router.put('/users/:id/status', userController.changeStatus);

export default router; 