import { Router } from 'express';
import AuditController from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAuditor } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createAuditValidation,
  updateAuditValidation,
  mongoIdValidation,
} from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create new audit (auditors and admins only)
router.post(
  '/',
  isAuditor,
  createAuditValidation,
  validate,
  AuditController.create
);

// Get audits for a project
router.get(
  '/project/:projectId',
  mongoIdValidation,
  validate,
  AuditController.getProjectAudits
);

// Approve project (auditors and admins only)
router.put(
  '/:id/approve',
  isAuditor,
  updateAuditValidation,
  validate,
  AuditController.approve
);

// Reject project (auditors and admins only)
router.put(
  '/:id/reject',
  isAuditor,
  updateAuditValidation,
  validate,
  AuditController.reject
);

export default router;
