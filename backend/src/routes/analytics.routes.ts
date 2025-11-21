import { Router } from 'express';
import AnalyticsController from '../controllers/analytics.controller';
// import { authenticate } from '../middleware/auth.middleware'; // Disabled for development

const router = Router();

// All routes require authentication
// Temporarily disabled for development/testing
// router.use(authenticate);

/**
 * @route   GET /api/analytics/overview
 * @desc    Get overview metrics
 * @access  Authenticated
 */
router.get('/overview', AnalyticsController.getOverview);

/**
 * @route   GET /api/analytics/projects
 * @desc    Get project analytics
 * @access  Authenticated
 */
router.get('/projects', AnalyticsController.getProjectAnalytics);

/**
 * @route   GET /api/analytics/methodology
 * @desc    Get methodology breakdown
 * @access  Authenticated
 */
router.get('/methodology', AnalyticsController.getMethodologyBreakdown);

/**
 * @route   GET /api/analytics/timeline
 * @desc    Get timeline data
 * @access  Authenticated
 * @query   start - Start date (ISO string)
 * @query   end - End date (ISO string)
 */
router.get('/timeline', AnalyticsController.getTimelineData);

/**
 * @route   GET /api/analytics/geographic
 * @desc    Get geographic data
 * @access  Authenticated
 */
router.get('/geographic', AnalyticsController.getGeographicData);

/**
 * @route   GET /api/analytics/marketplace
 * @desc    Get marketplace analytics
 * @access  Authenticated
 */
router.get('/marketplace', AnalyticsController.getMarketplaceAnalytics);

/**
 * @route   GET /api/analytics/users
 * @desc    Get user metrics
 * @access  Authenticated
 */
router.get('/users', AnalyticsController.getUserMetrics);

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data
 * @access  Authenticated
 * @query   format - Export format (csv|json)
 */
router.get('/export', AnalyticsController.exportData);

export default router;
