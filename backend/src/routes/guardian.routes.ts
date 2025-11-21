import { Router } from 'express';
import GuardianController from '../controllers/guardian.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/guardian/policies
 * @desc    Get list of available Guardian policies
 * @access  Authenticated
 */
router.get('/policies', authenticate, GuardianController.getPolicies);

/**
 * @route   GET /api/guardian/policies/:id
 * @desc    Get specific policy details
 * @access  Authenticated
 */
router.get('/policies/:id', authenticate, GuardianController.getPolicyById);

/**
 * @route   POST /api/guardian/webhook
 * @desc    Handle Guardian webhook events
 * @access  Public (verified by signature)
 */
router.post('/webhook', GuardianController.handleWebhook);

/**
 * @route   GET /api/guardian/documents/:hash
 * @desc    Retrieve document from IPFS
 * @access  Authenticated
 */
router.get('/documents/:hash', authenticate, GuardianController.getDocument);

/**
 * @route   GET /api/guardian/status/:projectId
 * @desc    Get detailed Guardian status for a project
 * @access  Authenticated
 */
router.get('/status/:projectId', authenticate, GuardianController.getProjectStatus);

export default router;
