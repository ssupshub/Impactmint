import { Router } from 'express';
import CreditController from '../controllers/credit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isProjectDeveloper } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  mintCreditValidation,
  retireCreditValidation,
  mongoIdValidation,
  paginationValidation,
} from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Mint new credits (project developers only)
router.post(
  '/mint',
  isProjectDeveloper,
  mintCreditValidation,
  validate,
  CreditController.mint
);

// List credits
router.get(
  '/',
  paginationValidation,
  validate,
  CreditController.list
);

// Get credit by ID
router.get(
  '/:id',
  mongoIdValidation,
  validate,
  CreditController.getById
);

// Retire credits
router.post(
  '/:id/retire',
  retireCreditValidation,
  validate,
  CreditController.retire
);

export default router;
