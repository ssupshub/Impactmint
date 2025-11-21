import { Request, Response, NextFunction } from 'express';
import RetirementService from '../services/retirement.service';
import { RetirementReason } from '../models/Retirement.model';
import ApiResponseUtil from '../utils/response';
import path from 'path';
import fs from 'fs';

export class RetirementController {
    /**
     * Retire a carbon credit
     */
    static async retireCredit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { nftId, beneficiary, reason, publiclyVisible } = req.body;
            const userId = (req as any).user.id;

            const result = await RetirementService.retireCredit({
                nftId,
                userId,
                beneficiary,
                reason: reason as RetirementReason,
                publiclyVisible,
            });

            ApiResponseUtil.success(res, result, 'Credit retired successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bulk retire multiple credits
     */
    static async bulkRetire(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { nftIds, beneficiary, reason } = req.body;
            const userId = (req as any).user.id;

            if (!Array.isArray(nftIds) || nftIds.length === 0) {
                ApiResponseUtil.error(res, 'nftIds must be a non-empty array', 400);
                return;
            }

            if (nftIds.length > 1000) {
                ApiResponseUtil.error(res, 'Cannot retire more than 1000 credits at once', 400);
                return;
            }

            const results = await RetirementService.bulkRetireCredits(
                nftIds,
                userId,
                beneficiary,
                reason as RetirementReason
            );

            const successful = results.filter((r) => r.success).length;
            const failed = results.filter((r) => !r.success).length;

            ApiResponseUtil.success(res, {
                results,
                summary: { total: nftIds.length, successful, failed },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get certificate by ID
     */
    static async getCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { certificateId } = req.params;
            const { format = 'json' } = req.query;

            if (format === 'pdf') {
                const certificatePath = path.join(
                    __dirname,
                    '../../certificates',
                    `${certificateId}.pdf`
                );

                if (!fs.existsSync(certificatePath)) {
                    ApiResponseUtil.error(res, 'Certificate file not found', 404);
                    return;
                }

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader(
                    'Content-Disposition',
                    `attachment; filename=retirement-certificate-${certificateId}.pdf`
                );
                fs.createReadStream(certificatePath).pipe(res);
            } else {
                const certificate = await RetirementService.verifyCertificate(certificateId);
                ApiResponseUtil.success(res, certificate);
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify certificate authenticity
     */
    static async verifyCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { certificateId } = req.params;

            const verification = await RetirementService.verifyCertificate(certificateId);

            ApiResponseUtil.success(res, verification);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get retirement history
     */
    static async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const { startDate, endDate, projectId, methodology } = req.query;

            const filters: any = {};
            if (startDate) filters.startDate = new Date(startDate as string);
            if (endDate) filters.endDate = new Date(endDate as string);
            if (projectId) filters.projectId = projectId;
            if (methodology) filters.methodology = methodology;

            const history = await RetirementService.getRetirementHistory(userId, filters);

            ApiResponseUtil.success(res, history);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get public retirement registry
     */
    static async getRegistry(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { limit, offset, methodology } = req.query;

            const filters: any = {};
            if (limit) filters.limit = parseInt(limit as string);
            if (offset) filters.offset = parseInt(offset as string);
            if (methodology) filters.methodology = methodology;

            const registry = await RetirementService.getPublicRegistry(filters);

            ApiResponseUtil.success(res, registry);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate ESG report
     */
    static async generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const { format = 'json' } = req.query;

            const statistics = await RetirementService.getStatistics(userId);

            if (format === 'csv') {
                // Generate CSV
                const csv = this.generateCSV(statistics);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=esg-report.csv');
                res.send(csv);
            } else if (format === 'json') {
                ApiResponseUtil.success(res, statistics);
            } else {
                ApiResponseUtil.error(res, 'Invalid format. Use json or csv', 400);
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get retirement statistics
     */
    static async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.id;

            const statistics = await RetirementService.getStatistics(userId);

            ApiResponseUtil.success(res, statistics);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Helper: Generate CSV from statistics
     */
    private static generateCSV(data: any): string {
        const headers = ['Metric', 'Value'];
        const rows = [
            ['Total Retirements', data.totalRetirements],
            ['Total Tons CO2', data.totalTonsCO2],
        ];

        data.byMethodology.forEach((item: any) => {
            rows.push([`${item._id} - Count`, item.count]);
            rows.push([`${item._id} - Tons CO2`, item.tonsCO2]);
        });

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        return csvContent;
    }
}

export default RetirementController;
