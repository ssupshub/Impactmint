import { v4 as uuidv4 } from 'uuid';
import Listing from '../models/Listing.model';
import { ListingStatus } from '../types';
import Sale from '../models/Sale.model';
import NFT, { NFTStatus } from '../models/NFT.model';
import { NotFoundError, BadRequestError } from '../utils/errors';
import logger from '../utils/logger';

interface CreateListingInput {
    nftId: string;
    userId: string;
    listingType: string;
    price: number;
    duration: number; // in hours
}

interface PurchaseInput {
    listingId: string;
    buyerId: string;
}

export class MarketplaceService {
    // Marketplace fee (2.5%)
    private static readonly MARKETPLACE_FEE_BPS = 250;
    private static readonly BPS_DENOMINATOR = 10000;

    /**
     * Create a new listing
     */
    static async createListing(input: CreateListingInput): Promise<any> {
        const { nftId, userId, listingType, price, duration } = input;

        try {
            // Validate NFT
            const nft = await NFT.findById(nftId);
            if (!nft) {
                throw new NotFoundError('NFT not found');
            }

            if (nft.owner !== userId) {
                throw new BadRequestError('You do not own this NFT');
            }

            if (nft.status !== NFTStatus.ACTIVE) {
                throw new BadRequestError('NFT is not available for listing');
            }

            // Check if already listed
            const existingListing = await Listing.findOne({
                creditId: nftId,
                status: ListingStatus.ACTIVE,
            });

            if (existingListing) {
                throw new BadRequestError('NFT is already listed');
            }

            // Get HBAR to USD conversion (simplified - you'd use a price oracle)
            const hbarToUSD = 0.05; // Example rate
            const priceUSD = price * hbarToUSD;

            // Calculate expiration
            const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);

            // Create listing
            const listingId = uuidv4();
            const listing = await Listing.create({
                creditId: nftId,
                sellerId: userId,
                price,
                quantity: 1,
                remainingQuantity: 1,
                currency: 'HBAR',
                status: ListingStatus.ACTIVE,
                expiresAt,
                metadata: {
                    views: 0,
                    favorites: 0,
                    offers: 0,
                    listingType,
                    priceUSD,
                },
            });

            // NFT status remains ACTIVE (no LISTED status exists)
            // nft.status = NFTStatus.ACTIVE;
            // await nft.save();

            logger.info('Listing created', { listingId, nftId });

            return listing;
        } catch (error: any) {
            logger.error('Failed to create listing:', error);
            throw error;
        }
    }

    /**
     * Purchase a credit
     */
    static async purchaseCredit(input: PurchaseInput): Promise<any> {
        const { listingId, buyerId } = input;

        try {
            // Get listing
            const listing = await Listing.findById(listingId).populate('creditId');
            if (!listing) {
                throw new NotFoundError('Listing not found');
            }

            if (listing.status !== ListingStatus.ACTIVE) {
                throw new BadRequestError('Listing is not active');
            }

            if (listing.expiresAt && new Date() > listing.expiresAt) {
                listing.status = ListingStatus.EXPIRED;
                await listing.save();
                throw new BadRequestError('Listing has expired');
            }

            if (listing.sellerId.toString() === buyerId) {
                throw new BadRequestError('Cannot buy your own listing');
            }

            // Calculate fees
            const marketplaceFee =
                (listing.price * this.MARKETPLACE_FEE_BPS) / this.BPS_DENOMINATOR;
            const sellerProceeds = listing.price - marketplaceFee;

            // Get NFT
            const nft: any = await NFT.findById(listing.creditId);
            if (!nft) {
                throw new NotFoundError('NFT not found');
            }

            // Create sale record
            const saleId = uuidv4();
            const sale = await Sale.create({
                saleId,
                listingId: listing._id,
                nftId: nft._id,
                seller: listing.sellerId,
                buyer: buyerId,
                salePrice: listing.price,
                salePriceUSD: listing.metadata.priceUSD || listing.price * 0.05,
                marketplaceFee,
                sellerProceeds,
                transactionId: `HBAR-${Date.now()}`, // Placeholder - would be actual Hedera tx
                soldAt: new Date(),
            });

            // Update listing status
            listing.status = ListingStatus.SOLD;
            await listing.save();

            // Transfer NFT ownership
            nft.owner = buyerId;
            nft.status = NFTStatus.ACTIVE;
            await nft.save();

            logger.info('Credit purchased', { saleId, listingId, buyerId });

            return {
                sale,
                listing,
                nft,
            };
        } catch (error: any) {
            logger.error('Failed to purchase credit:', error);
            throw error;
        }
    }

    /**
     * Get all listings with filters
     */
    static async getListings(filters?: {
        status?: ListingStatus;
        listingType?: string;
        minPrice?: number;
        maxPrice?: number;
        methodology?: string;
        seller?: string;
        limit?: number;
        offset?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<any> {
        const query: any = {};

        // Apply filters
        if (filters?.status) query.status = filters.status;
        else query.status = ListingStatus.ACTIVE; // Default to active

        if (filters?.listingType) query['metadata.listingType'] = filters.listingType;
        if (filters?.seller) query.sellerId = filters.seller;

        if (filters?.minPrice || filters?.maxPrice) {
            query.price = {};
            if (filters.minPrice) query.price.$gte = filters.minPrice;
            if (filters.maxPrice) query.price.$lte = filters.maxPrice;
        }

        const limit = filters?.limit || 20;
        const offset = filters?.offset || 0;
        const sortBy = filters?.sortBy || 'createdAt';
        const sortOrder = filters?.sortOrder === 'asc' ? 1 : -1;

        const listings = await Listing.find(query)
            .populate({
                path: 'creditId',
                populate: { path: 'projectId' },
            })
            .populate('sellerId', 'username email')
            .sort({ [sortBy]: sortOrder })
            .limit(limit)
            .skip(offset);

        const total = await Listing.countDocuments(query);

        return {
            listings,
            total,
            limit,
            offset,
        };
    }

    /**
     * Get listing by ID
     */
    static async getListingById(listingId: string): Promise<any> {
        const listing = await Listing.findById(listingId)
            .populate({
                path: 'creditId',
                populate: { path: 'projectId' },
            })
            .populate('sellerId', 'username email');

        if (!listing) {
            throw new NotFoundError('Listing not found');
        }

        // Increment view count
        listing.metadata.views += 1;
        await listing.save();

        return listing;
    }

    /**
     * Cancel a listing
     */
    static async cancelListing(listingId: string, userId: string): Promise<any> {
        const listing = await Listing.findOne({ listingId });

        if (!listing) {
            throw new NotFoundError('Listing not found');
        }

        if (listing.sellerId.toString() !== userId) {
            throw new BadRequestError('Not the seller');
        }

        if (listing.status !== ListingStatus.ACTIVE) {
            throw new BadRequestError('Listing is not active');
        }

        listing.status = ListingStatus.CANCELLED;
        await listing.save();

        // Update NFT status
        const nft = await NFT.findById(listing.creditId);
        if (nft) {
            nft.status = NFTStatus.ACTIVE;
            await nft.save();
        }

        logger.info('Listing cancelled', { listingId });

        return listing;
    }

    /**
     * Get user's listings
     */
    static async getUserListings(userId: string, status?: ListingStatus): Promise<any[]> {
        const query: any = { sellerId: userId };
        if (status) query.status = status;

        return Listing.find(query)
            .populate({
                path: 'creditId',
                populate: { path: 'projectId' },
            })
            .sort({ createdAt: -1 });
    }

    /**
     * Get user's purchases
     */
    static async getUserPurchases(userId: string): Promise<any[]> {
        return Sale.find({ buyer: userId })
            .populate({
                path: 'nftId',
                populate: { path: 'projectId' },
            })
            .populate('seller', 'username')
            .sort({ soldAt: -1 });
    }

    /**
     * Get marketplace statistics
     */
    static async getMarketplaceStats(): Promise<any> {
        const [
            totalListings,
            activeListings,
            totalSales,
            volumeData,
            avgPriceData,
        ] = await Promise.all([
            Listing.countDocuments(),
            Listing.countDocuments({ status: ListingStatus.ACTIVE }),
            Sale.countDocuments(),
            Sale.aggregate([
                { $group: { _id: null, totalVolume: { $sum: '$salePrice' } } },
            ]),
            Sale.aggregate([
                { $group: { _id: null, avgPrice: { $avg: '$salePrice' } } },
            ]),
        ]);

        const totalVolume = volumeData[0]?.totalVolume || 0;
        const avgPrice = avgPriceData[0]?.avgPrice || 0;

        // Get floor price (lowest active listing)
        const floorPriceListing = await Listing.findOne({
            status: ListingStatus.ACTIVE,
        }).sort({ price: 1 });

        return {
            totalListings,
            activeListings,
            totalSales,
            totalVolume,
            avgPrice,
            floorPrice: floorPriceListing?.price || 0,
        };
    }

    /**
     * Search listings
     */
    static async searchListings(searchTerm: string): Promise<any[]> {
        const listings = await Listing.find({
            status: ListingStatus.ACTIVE,
        })
            .populate({
                path: 'creditId',
                populate: { path: 'projectId' },
            })
            .populate('sellerId', 'username');

        // Filter by project name or methodology
        return listings.filter((listing: any) => {
            const nft = listing.creditId;
            if (!nft) return false;
            const project = nft.projectId;
            if (!project) return false;

            const searchLower = searchTerm.toLowerCase();
            return (
                project.name.toLowerCase().includes(searchLower) ||
                project.methodology.toLowerCase().includes(searchLower)
            );
        });
    }
}

export default MarketplaceService;
