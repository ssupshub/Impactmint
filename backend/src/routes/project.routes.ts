import { Router } from 'express';
import ProjectController from '../controllers/project.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { isProjectDeveloper } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createProjectValidation,
  updateProjectValidation,
  mongoIdValidation,
  paginationValidation,
} from '../utils/validators';

const router = Router();

// Public routes (with optional authentication for personalized views)
router.get(
  '/',
  optionalAuthenticate,
  paginationValidation,
  validate,
  ProjectController.list
);

router.get(
  '/:id',
  optionalAuthenticate,
  mongoIdValidation,
  validate,
  ProjectController.getById
);

// Protected routes - require authentication
router.post(
  '/',
  authenticate,
  isProjectDeveloper,
  createProjectValidation,
  validate,
  ProjectController.create
);

router.put(
  '/:id',
  authenticate,
  updateProjectValidation,
  validate,
  ProjectController.update
);

router.delete(
  '/:id',
  authenticate,
  mongoIdValidation,
  validate,
  ProjectController.delete
);

router.post(
  '/:id/submit-for-audit',
  authenticate,
  mongoIdValidation,
  validate,
  ProjectController.submitForAudit
);

export default router;
