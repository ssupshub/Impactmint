import { Router } from 'express';
import TransactionController from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { mongoIdValidation, paginationValidation } from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List transactions
router.get(
  '/',
  paginationValidation,
  validate,
  TransactionController.listTransactions
);

// Get transaction by ID
router.get(
  '/:id',
  mongoIdValidation,
  validate,
  TransactionController.getTransactionById
);

export default router;
