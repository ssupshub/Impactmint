import { Router } from 'express';
import MRVController from '../controllers/mrv.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/mrv/submit
 * @desc    Submit MRV data for a project
 * @access  Project Developer
 */
router.post(
    '/submit',
    authorize([UserRole.PROJECT_DEVELOPER, UserRole.ADMIN]),
    MRVController.submit
);

/**
 * @route   GET /api/mrv/project/:projectId
 * @desc    Get all MRV data for a project
 * @access  Authenticated
 */
router.get('/project/:projectId', MRVController.getByProject);

/**
 * @route   GET /api/mrv/:id
 * @desc    Get specific MRV data entry
 * @access  Authenticated
 */
router.get('/:id', MRVController.getById);

/**
 * @route   PUT /api/mrv/:id
 * @desc    Update MRV data (before Guardian submission)
 * @access  Project Developer (owner) or Admin
 */
router.put(
    '/:id',
    authorize([UserRole.PROJECT_DEVELOPER, UserRole.ADMIN]),
    MRVController.update
);

/**
 * @route   DELETE /api/mrv/:id
 * @desc    Delete MRV data (before Guardian submission)
 * @access  Project Developer (owner) or Admin
 */
router.delete(
    '/:id',
    authorize([UserRole.PROJECT_DEVELOPER, UserRole.ADMIN]),
    MRVController.delete
);

/**
 * @route   POST /api/mrv/validate
 * @desc    Validate MRV data without submitting
 * @access  Project Developer
 */
router.post(
    '/validate',
    authorize([UserRole.PROJECT_DEVELOPER, UserRole.ADMIN]),
    MRVController.validate
);

export default router;
