import { Router } from 'express';
import MethodologyController from '../controllers/methodology.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { UserRole } from '../types';

const router = Router();

/**
 * @route   GET /api/methodologies
 * @desc    Get all active methodologies
 * @access  Public
 * @query   category, status, tags
 */
router.get('/', MethodologyController.getAllMethodologies);

/**
 * @route   GET /api/methodologies/search
 * @desc    Search methodologies
 * @access  Public
 * @query   q - search query
 */
router.get('/search', MethodologyController.searchMethodologies);

/**
 * @route   GET /api/methodologies/:id
 * @desc    Get methodology by ID
 * @access  Public
 */
router.get('/:id', MethodologyController.getMethodologyById);

/**
 * @route   POST /api/methodologies
 * @desc    Create new methodology
 * @access  Admin only
 */
router.post(
    '/',
    authenticate,
    authorize(UserRole.ADMIN),
    MethodologyController.createMethodology
);

/**
 * @route   PUT /api/methodologies/:id
 * @desc    Update methodology (creates new version)
 * @access  Admin only
 */
router.put(
    '/:id',
    authenticate,
    authorize(UserRole.ADMIN),
    MethodologyController.updateMethodology
);

/**
 * @route   POST /api/methodologies/validate
 * @desc    Validate project data against methodology
 * @access  Authenticated
 */
router.post('/validate', authenticate, MethodologyController.validateProjectData);

/**
 * @route   POST /api/methodologies/calculate
 * @desc    Calculate carbon offset
 * @access  Authenticated
 */
router.post('/calculate', authenticate, MethodologyController.calculateCarbonOffset);

/**
 * @route   POST /api/methodologies/recommend
 * @desc    Get methodology recommendations
 * @access  Authenticated
 */
router.post('/recommend', authenticate, MethodologyController.getRecommendations);

/**
 * @route   POST /api/methodologies/compare
 * @desc    Compare multiple methodologies
 * @access  Public
 */
router.post('/compare', MethodologyController.compareMethodologies);

export default router;
