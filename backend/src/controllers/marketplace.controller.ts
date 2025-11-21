import { Request, Response, NextFunction } from 'express';
import MarketplaceService from '../services/marketplace.service';
import { ListingStatus } from '../types';
import ApiResponseUtil from '../utils/response';

export class MarketplaceController {
  /**
   * Create a new listing
   */
  static async createListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nftId, listingType, price, duration } = req.body;
      const userId = (req as any).user.id;

      const listing = await MarketplaceService.createListing({
        nftId,
        userId,
        listingType,
        price: parseFloat(price),
        duration: parseInt(duration),
      });

      ApiResponseUtil.success(res, listing, 'Listing created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all listings
   */
  static async getListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        status,
        listingType,
        minPrice,
        maxPrice,
        methodology,
        seller,
        limit,
        offset,
        sortBy,
        sortOrder,
      } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (listingType) filters.listingType = listingType;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (methodology) filters.methodology = methodology;
      if (seller) filters.seller = seller;
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);
      if (sortBy) filters.sortBy = sortBy;
      if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';

      const result = await MarketplaceService.getListings(filters);

      ApiResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get listing by ID
   */
  static async getListingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const listing = await MarketplaceService.getListingById(id);

      ApiResponseUtil.success(res, listing);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Purchase a credit
   */
  static async purchaseCredit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const buyerId = (req as any).user.id;

      const result = await MarketplaceService.purchaseCredit({
        listingId: id,
        buyerId,
      });

      ApiResponseUtil.success(res, result, 'Credit purchased successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel a listing
   */
  static async cancelListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const listing = await MarketplaceService.cancelListing(id, userId);

      ApiResponseUtil.success(res, listing, 'Listing cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's listings
   */
  static async getMyListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { status } = req.query;

      const listings = await MarketplaceService.getUserListings(
        userId,
        status as ListingStatus
      );

      ApiResponseUtil.success(res, listings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's purchases
   */
  static async getMyPurchases(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;

      const purchases = await MarketplaceService.getUserPurchases(userId);

      ApiResponseUtil.success(res, purchases);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get marketplace statistics
   */
  static async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await MarketplaceService.getMarketplaceStats();

      ApiResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search listings
   */
  static async searchListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        ApiResponseUtil.error(res, 'Search query required', 400);
        return;
      }

      const listings = await MarketplaceService.searchListings(q);

      ApiResponseUtil.success(res, listings);
    } catch (error) {
      next(error);
    }
  }
}

export default MarketplaceController;
