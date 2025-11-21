import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateProfileValidation, mongoIdValidation, paginationValidation } from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Current user routes
router.get('/me', UserController.getMe);

router.put(
  '/me',
  updateProfileValidation,
  validate,
  UserController.updateMe
);

// Admin-only routes
router.get(
  '/',
  isAdmin,
  paginationValidation,
  validate,
  UserController.listUsers
);

router.get(
  '/:id',
  isAdmin,
  mongoIdValidation,
  validate,
  UserController.getUserById
);

router.put(
  '/:id/role',
  isAdmin,
  mongoIdValidation,
  validate,
  UserController.updateUserRole
);

router.put(
  '/:id/deactivate',
  isAdmin,
  mongoIdValidation,
  validate,
  UserController.deactivateUser
);

export default router;
