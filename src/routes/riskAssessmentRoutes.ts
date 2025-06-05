import { Router } from 'express';
import * as riskAssessmentController from '../controllers/riskAssessmentController';
import { validate, schemas } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// User routes
router.post('/', authenticate, validate(schemas.riskAssessment.create), riskAssessmentController.createAssessment);
router.get('/my-assessments', authenticate, riskAssessmentController.listUserAssessments);
router.get('/:id', authenticate, riskAssessmentController.getAssessment);

// Admin routes
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), riskAssessmentController.listAllAssessments);

export default router; 