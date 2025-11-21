import { Router } from 'express';
import MarketplaceController from '../controllers/marketplace.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/marketplace/list
 * @desc    Create a new listing
 * @access  Authenticated
 */
router.post('/list', authenticate, MarketplaceController.createListing);

/**
 * @route   GET /api/marketplace/listings
 * @desc    Get all listings with filters
 * @access  Public
 * @query   status, listingType, minPrice, maxPrice, methodology, seller, limit, offset, sortBy, sortOrder
 */
router.get('/listings', MarketplaceController.getListings);

/**
 * @route   GET /api/marketplace/search
 * @desc    Search listings
 * @access  Public
 * @query   q - search query
 */
router.get('/search', MarketplaceController.searchListings);

/**
 * @route   GET /api/marketplace/listing/:id
 * @desc    Get specific listing
 * @access  Public
 */
router.get('/listing/:id', MarketplaceController.getListingById);

/**
 * @route   POST /api/marketplace/purchase/:id
 * @desc    Purchase a credit
 * @access  Authenticated
 */
router.post('/purchase/:id', authenticate, MarketplaceController.purchaseCredit);

/**
 * @route   DELETE /api/marketplace/listing/:id
 * @desc    Cancel a listing
 * @access  Authenticated (seller only)
 */
router.delete('/listing/:id', authenticate, MarketplaceController.cancelListing);

/**
 * @route   GET /api/marketplace/my-listings
 * @desc    Get user's listings
 * @access  Authenticated
 * @query   status
 */
router.get('/my-listings', authenticate, MarketplaceController.getMyListings);

/**
 * @route   GET /api/marketplace/my-purchases
 * @desc    Get user's purchase history
 * @access  Authenticated
 */
router.get('/my-purchases', authenticate, MarketplaceController.getMyPurchases);

/**
 * @route   GET /api/marketplace/stats
 * @desc    Get marketplace statistics
 * @access  Public
 */
router.get('/stats', MarketplaceController.getStats);

export default router;
