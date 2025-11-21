import { Router } from 'express';
import NFTController from '../controllers/nft.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/nft/collections
 * @desc    Create NFT collection
 * @access  Admin only
 */
router.post(
    '/collections',
    authorize([UserRole.ADMIN]),
    NFTController.createCollection
);

/**
 * @route   POST /api/nft/mint
 * @desc    Mint single NFT
 * @access  Admin or Project Developer
 */
router.post(
    '/mint',
    authorize([UserRole.ADMIN, UserRole.PROJECT_DEVELOPER]),
    NFTController.mintNFT
);

/**
 * @route   POST /api/nft/transfer
 * @desc    Transfer NFT to new owner
 * @access  Admin
 */
router.post(
    '/transfer',
    authorize([UserRole.ADMIN]),
    NFTController.transferNFT
);

/**
 * @route   POST /api/nft/retire
 * @desc    Retire (burn) NFT
 * @access  Authenticated
 */
router.post(
    '/retire',
    NFTController.retireNFT
);

/**
 * @route   GET /api/nft/:tokenId/:serialNumber
 * @desc    Get NFT details
 * @access  Authenticated
 */
router.get(
    '/:tokenId/:serialNumber',
    NFTController.getNFT
);

/**
 * @route   GET /api/nft/project/:projectId
 * @desc    Get all NFTs for a project
 * @access  Authenticated
 */
router.get(
    '/project/:projectId',
    NFTController.getNFTsByProject
);

/**
 * @route   GET /api/nft/analytics
 * @desc    Get NFT analytics
 * @access  Authenticated
 */
router.get(
    '/analytics',
    NFTController.getAnalytics
);

export default router;
