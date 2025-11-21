import { Request, Response, NextFunction } from 'express';
import Project from '../models/Project.model';
import NFT, { NFTStatus } from '../models/NFT.model';
import MRVData from '../models/MRVData.model';
import ApiResponseUtil from '../utils/response';
import { ProjectStatus } from '../types';

export class AnalyticsController {
    /**
     * Get overview metrics
     */
    static async getOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Total tons CO2 offset
            const totalTonsCO2 = await NFT.aggregate([
                { $match: { status: { $in: [NFTStatus.ACTIVE, NFTStatus.TRANSFERRED, NFTStatus.RETIRED] } } },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $toDouble: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$metadata.attributes',
                                                cond: { $eq: ['$$this.trait_type', 'Tons CO2'] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            ]);

            // Project counts
            const projectStats = await Project.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]);

            // NFT stats
            const nftStats = await NFT.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]);

            // MRV data stats
            const mrvStats = await MRVData.aggregate([
                {
                    $group: {
                        _id: null,
                        totalSubmissions: { $sum: 1 },
                        totalCredits: { $sum: '$calculatedCredits' },
                    },
                },
            ]);

            const overview = {
                totalTonsCO2: totalTonsCO2[0]?.total || 0,
                totalProjects: await Project.countDocuments(),
                activeProjects: projectStats.find((s) => s._id === ProjectStatus.ACTIVE)?.count || 0,
                verifiedProjects: projectStats.find((s) => s._id === ProjectStatus.APPROVED)?.count || 0,
                pendingProjects: projectStats.find((s) => s._id === ProjectStatus.PENDING_AUDIT)?.count || 0,
                totalCredits: nftStats.reduce((sum, s) => sum + s.count, 0),
                creditsActive: nftStats.find((s) => s._id === NFTStatus.ACTIVE)?.count || 0,
                creditsRetired: nftStats.find((s) => s._id === NFTStatus.RETIRED)?.count || 0,
                totalMRVSubmissions: mrvStats[0]?.totalSubmissions || 0,
                calculatedCredits: mrvStats[0]?.totalCredits || 0,
                marketplaceVolume: 0, // TODO: Calculate from marketplace transactions
            };

            ApiResponseUtil.success(res, overview);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get project analytics
     */
    static async getProjectAnalytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const projects = await Project.aggregate([
                {
                    $lookup: {
                        from: 'nfts',
                        localField: '_id',
                        foreignField: 'projectId',
                        as: 'nfts',
                    },
                },
                {
                    $lookup: {
                        from: 'guardianworkflows',
                        localField: '_id',
                        foreignField: 'projectId',
                        as: 'workflow',
                    },
                },
                {
                    $project: {
                        name: 1,
                        methodology: 1,
                        status: 1,
                        location: 1,
                        capacity: 1,
                        verifiedCapacity: 1,
                        startDate: 1,
                        createdAt: 1,
                        nftCount: { $size: '$nfts' },
                        workflowStatus: { $arrayElemAt: ['$workflow.currentStatus', 0] },
                        healthScore: {
                            $cond: [
                                { $and: [{ $ne: ['$verifiedCapacity', null] }, { $gt: ['$verifiedCapacity', 0] }] },
                                100,
                                50,
                            ],
                        },
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
            ]);

            ApiResponseUtil.success(res, projects);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get methodology breakdown
     */
    static async getMethodologyBreakdown(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const breakdown = await Project.aggregate([
                {
                    $group: {
                        _id: '$methodology',
                        count: { $sum: 1 },
                        totalCapacity: { $sum: '$capacity' },
                        verifiedCapacity: { $sum: '$verifiedCapacity' },
                        avgCapacity: { $avg: '$capacity' },
                    },
                },
                {
                    $sort: { count: -1 },
                },
            ]);

            // Get NFT counts by methodology
            const nftByMethodology = await NFT.aggregate([
                {
                    $lookup: {
                        from: 'projects',
                        localField: 'projectId',
                        foreignField: '_id',
                        as: 'project',
                    },
                },
                {
                    $unwind: '$project',
                },
                {
                    $group: {
                        _id: '$project.methodology',
                        nftCount: { $sum: 1 },
                        retiredCount: {
                            $sum: { $cond: [{ $eq: ['$status', NFTStatus.RETIRED] }, 1, 0] },
                        },
                    },
                },
            ]);

            // Merge data
            const result = breakdown.map((item) => {
                const nftData = nftByMethodology.find((n) => n._id === item._id);
                return {
                    methodology: item._id,
                    projectCount: item.count,
                    totalCapacity: item.totalCapacity || 0,
                    verifiedCapacity: item.verifiedCapacity || 0,
                    avgCapacity: item.avgCapacity || 0,
                    nftCount: nftData?.nftCount || 0,
                    retiredCount: nftData?.retiredCount || 0,
                };
            });

            ApiResponseUtil.success(res, result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get timeline data
     */
    static async getTimelineData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { start, end } = req.query;
            const startDate = start ? new Date(start as string) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
            const endDate = end ? new Date(end as string) : new Date();

            // Get NFT minting timeline
            const timeline = await NFT.aggregate([
                {
                    $match: {
                        mintedAt: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $lookup: {
                        from: 'projects',
                        localField: 'projectId',
                        foreignField: '_id',
                        as: 'project',
                    },
                },
                {
                    $unwind: '$project',
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$mintedAt' },
                            month: { $month: '$mintedAt' },
                            methodology: '$project.methodology',
                        },
                        count: { $sum: 1 },
                        tons: {
                            $sum: {
                                $toDouble: {
                                    $arrayElemAt: [
                                        {
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: '$metadata.attributes',
                                                        cond: { $eq: ['$$this.trait_type', 'Tons CO2'] },
                                                    },
                                                },
                                                as: 'attr',
                                                in: '$$attr.value',
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 },
                },
            ]);

            // Transform to chart-friendly format
            const chartData: any[] = [];
            const dateMap = new Map();

            timeline.forEach((item) => {
                const dateKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
                if (!dateMap.has(dateKey)) {
                    dateMap.set(dateKey, {
                        date: new Date(item._id.year, item._id.month - 1),
                        total: 0,
                        REC: 0,
                        REDD: 0,
                        OPR: 0,
                    });
                }
                const entry = dateMap.get(dateKey);
                entry.total += item.tons;
                entry[item._id.methodology] = item.tons;
            });

            // Calculate cumulative
            let cumulative = 0;
            dateMap.forEach((value) => {
                cumulative += value.total;
                chartData.push({
                    ...value,
                    cumulative,
                });
            });

            ApiResponseUtil.success(res, chartData);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get geographic data
     */
    static async getGeographicData(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const projects = await Project.aggregate([
                {
                    $match: {
                        'location.coordinates': { $exists: true },
                    },
                },
                {
                    $lookup: {
                        from: 'nfts',
                        localField: '_id',
                        foreignField: 'projectId',
                        as: 'nfts',
                    },
                },
                {
                    $project: {
                        name: 1,
                        methodology: 1,
                        status: 1,
                        location: 1,
                        capacity: 1,
                        nftCount: { $size: '$nfts' },
                        coordinates: '$location.coordinates',
                    },
                },
            ]);

            ApiResponseUtil.success(res, projects);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get marketplace analytics
     */
    static async getMarketplaceAnalytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // TODO: Implement when marketplace is built
            const analytics = {
                currentListings: 0,
                totalVolume: 0,
                avgPrice: 0,
                priceHistory: [],
                mostTraded: [],
            };

            ApiResponseUtil.success(res, analytics);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user metrics
     */
    static async getUserMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const User = require('../models/User.model').default;

            const userStats = await User.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 },
                    },
                },
            ]);

            const totalUsers = await User.countDocuments();
            const activeUsers = await User.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });

            ApiResponseUtil.success(res, {
                totalUsers,
                activeUsers,
                usersByRole: userStats,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export analytics data
     */
    static async exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { format } = req.query;

            const overview = await this.getOverviewData();

            if (format === 'csv') {
                const csv = this.convertToCSV(overview);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
                res.send(csv);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=analytics.json');
                res.send(JSON.stringify(overview, null, 2));
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Helper: Get overview data
     */
    private static async getOverviewData(): Promise<any> {
        // Reuse getOverview logic
        return {};
    }

    /**
     * Helper: Convert to CSV
     */
    private static convertToCSV(data: any): string {
        const headers = Object.keys(data).join(',');
        const values = Object.values(data).join(',');
        return `${headers}\n${values}`;
    }
}

export default AnalyticsController;
