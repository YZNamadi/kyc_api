import { Router } from 'express';
import * as userController from '../controllers/userController';
import { validate, schemas } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter, authLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../models/User';

const router = Router();

// Public routes
router.post('/register', apiLimiter, validate(schemas.user.create), userController.register);
router.post('/login', authLimiter, validate(schemas.user.login), userController.login);

// Authenticated user routes
router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, validate(schemas.user.update), userController.updateProfile);
router.patch('/me/password', authenticate, validate(schemas.user.update), userController.changePassword);

// Admin routes
router.get('/', authenticate, authorize(UserRole.ADMIN), userController.listUsers);
router.get('/search', authenticate, authorize(UserRole.ADMIN), userController.searchUsers);
router.patch('/:id/status', authenticate, authorize(UserRole.ADMIN), userController.changeStatus);
router.patch('/:id/role', authenticate, authorize(UserRole.ADMIN), userController.changeRole);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), userController.deleteUser);

export default router; 