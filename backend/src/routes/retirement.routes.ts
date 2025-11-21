import { Router } from 'express';
import RetirementController from '../controllers/retirement.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/retirement/retire
 * @desc    Retire a carbon credit NFT
 * @access  Authenticated
 */
router.post('/retire', authenticate, RetirementController.retireCredit);

/**
 * @route   POST /api/retirement/bulk-retire
 * @desc    Retire multiple carbon credits at once
 * @access  Authenticated
 */
router.post('/bulk-retire', authenticate, RetirementController.bulkRetire);

/**
 * @route   GET /api/retirement/certificate/:certificateId
 * @desc    Get retirement certificate
 * @access  Public
 * @query   format - json|pdf (default: json)
 */
router.get('/certificate/:certificateId', RetirementController.getCertificate);

/**
 * @route   GET /api/retirement/verify/:certificateId
 * @desc    Verify certificate authenticity
 * @access  Public
 */
router.get('/verify/:certificateId', RetirementController.verifyCertificate);

/**
 * @route   GET /api/retirement/history
 * @desc    Get user's retirement history
 * @access  Authenticated
 * @query   startDate, endDate, projectId, methodology
 */
router.get('/history', authenticate, RetirementController.getHistory);

/**
 * @route   GET /api/retirement/registry
 * @desc    Get public retirement registry
 * @access  Public
 * @query   limit, offset, methodology
 */
router.get('/registry', RetirementController.getRegistry);

/**
 * @route   GET /api/retirement/report
 * @desc    Generate ESG report
 * @access  Authenticated
 * @query   format - json|csv, year
 */
router.get('/report', authenticate, RetirementController.generateReport);

/**
 * @route   GET /api/retirement/statistics
 * @desc    Get retirement statistics
 * @access  Public (or authenticated for user-specific stats)
 */
router.get('/statistics', RetirementController.getStatistics);

export default router;
