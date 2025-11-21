import { Request, Response, NextFunction } from 'express';
import MethodologyService from '../services/methodology.service';
import ApiResponseUtil from '../utils/response';

export class MethodologyController {
    /**
     * Get all methodologies
     */
    static async getAllMethodologies(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { category, status, tags } = req.query;

            const filters: any = {};
            if (category) filters.category = category;
            if (status) filters.status = status;
            if (tags) filters.tags = (tags as string).split(',');

            const methodologies = await MethodologyService.getAllMethodologies(filters);

            ApiResponseUtil.success(res, methodologies);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get methodology by ID
     */
    static async getMethodologyById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            const methodology = await MethodologyService.getMethodologyById(id);

            ApiResponseUtil.success(res, methodology);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new methodology (admin only)
     */
    static async createMethodology(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const methodologyData = req.body;

            const methodology = await MethodologyService.createMethodology(methodologyData);

            ApiResponseUtil.success(res, methodology, 'Methodology created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update methodology (admin only)
     */
    static async updateMethodology(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const updates = req.body;

            const methodology = await MethodologyService.updateMethodology(id, updates);

            ApiResponseUtil.success(res, methodology, 'Methodology updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate project data against methodology
     */
    static async validateProjectData(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { methodologyId, projectData } = req.body;

            if (!methodologyId || !projectData) {
                ApiResponseUtil.error(
                    res,
                    'methodologyId and projectData are required',
                    400
                );
                return;
            }

            const validation = await MethodologyService.validateProjectData(
                methodologyId,
                projectData
            );

            ApiResponseUtil.success(res, validation);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Calculate carbon offset
     */
    static async calculateCarbonOffset(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { methodologyId, projectData } = req.body;

            if (!methodologyId || !projectData) {
                ApiResponseUtil.error(
                    res,
                    'methodologyId and projectData are required',
                    400
                );
                return;
            }

            const methodology = await MethodologyService.getMethodologyById(methodologyId);
            const calculatedValue = MethodologyService.calculateCarbonOffset(
                methodology,
                projectData
            );

            ApiResponseUtil.success(res, {
                methodologyId,
                calculatedValue,
                unit: 'tons CO2',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get methodology recommendations
     */
    static async getRecommendations(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const projectCharacteristics = req.body;

            if (!projectCharacteristics.projectType) {
                ApiResponseUtil.error(res, 'projectType is required', 400);
                return;
            }

            const recommendations = await MethodologyService.getRecommendations(
                projectCharacteristics
            );

            ApiResponseUtil.success(res, recommendations);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Compare methodologies
     */
    static async compareMethodologies(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { methodologyIds } = req.body;

            if (!Array.isArray(methodologyIds) || methodologyIds.length < 2) {
                ApiResponseUtil.error(
                    res,
                    'At least 2 methodology IDs required for comparison',
                    400
                );
                return;
            }

            if (methodologyIds.length > 4) {
                ApiResponseUtil.error(res, 'Maximum 4 methodologies can be compared', 400);
                return;
            }

            const comparison = await MethodologyService.compareMethodologies(methodologyIds);

            ApiResponseUtil.success(res, comparison);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Search methodologies
     */
    static async searchMethodologies(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { q } = req.query;

            if (!q || typeof q !== 'string') {
                ApiResponseUtil.error(res, 'Search query (q) is required', 400);
                return;
            }

            const results = await MethodologyService.searchMethodologies(q);

            ApiResponseUtil.success(res, results);
        } catch (error) {
            next(error);
        }
    }
}

export default MethodologyController;
