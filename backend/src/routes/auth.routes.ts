import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';
import { registerValidation, loginValidation } from '../utils/validators';

const router = Router();

// Public routes
router.post(
  '/register',
  authLimiter,
  registerValidation,
  validate,
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  loginValidation,
  validate,
  AuthController.login
);

router.post(
  '/refresh',
  AuthController.refresh
);

router.post(
  '/forgot-password',
  authLimiter,
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  AuthController.resetPassword
);

// Protected routes
router.post(
  '/logout',
  authenticate,
  AuthController.logout
);

router.get(
  '/me',
  authenticate,
  AuthController.getMe
);

export default router;
