import { Request, Response, NextFunction } from 'express';
import MRVData from '../models/MRVData.model';
import MRVService from '../services/mrv.service';
import ApiResponseUtil from '../utils/response';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { MRVDataType, MRVDataStatus, UserRole } from '../types';

export class MRVController {
    /**
     * Submit MRV data for a project
     */
    static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                projectId,
                dataType,
                monitoringPeriodStart,
                monitoringPeriodEnd,
                data,
            } = req.body;

            // Validate data type
            if (!Object.values(MRVDataType).includes(dataType)) {
                throw new BadRequestError('Invalid MRV data type');
            }

            // Validate MRV data against methodology requirements
            const validation = await MRVService.validateMRVData(dataType, data);
            if (!validation.isValid) {
                throw new BadRequestError(`MRV data validation failed: ${validation.errors.join(', ')}`);
            }

            // Calculate expected credits
            const calculatedCredits = MRVService.calculateCredits(dataType, data);

            // Create MRV data entry
            const mrvData = await MRVData.create({
                projectId,
                dataType,
                monitoringPeriodStart: new Date(monitoringPeriodStart),
                monitoringPeriodEnd: new Date(monitoringPeriodEnd),
                data,
                validationStatus: MRVDataStatus.VALIDATED,
                calculatedCredits,
                submittedBy: req.user?._id,
            });

            // Add to submission queue
            await MRVService.submitToQueue(mrvData._id.toString());

            ApiResponseUtil.created(res, mrvData, 'MRV data submitted successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all MRV data for a project
     */
    static async getByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { projectId } = req.params;

            const mrvData = await MRVService.getByProject(projectId);
            const statistics = await MRVService.getStatistics(projectId);

            ApiResponseUtil.success(res, {
                mrvData,
                statistics,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get specific MRV data entry
     */
    static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const mrvData = await MRVData.findById(id).populate('submittedBy', 'firstName lastName email');

            if (!mrvData) {
                throw new NotFoundError('MRV data not found');
            }

            ApiResponseUtil.success(res, mrvData);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update MRV data (before Guardian submission)
     */
    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { data, monitoringPeriodStart, monitoringPeriodEnd } = req.body;

            const mrvData = await MRVData.findById(id);

            if (!mrvData) {
                throw new NotFoundError('MRV data not found');
            }

            // Check if already submitted to Guardian
            if (mrvData.guardianSubmissionStatus === 'submitted') {
                throw new BadRequestError('Cannot update MRV data that has been submitted to Guardian');
            }

            // Check ownership
            if (mrvData.submittedBy !== req.user?._id && req.user?.role !== UserRole.ADMIN) {
                throw new ForbiddenError('You do not have permission to update this MRV data');
            }

            // Update fields
            if (data !== undefined) {
                // Validate updated data
                const validation = await MRVService.validateMRVData(mrvData.dataType, data);
                if (!validation.isValid) {
                    throw new BadRequestError(`MRV data validation failed: ${validation.errors.join(', ')}`);
                }
                mrvData.data = data;
                mrvData.calculatedCredits = MRVService.calculateCredits(mrvData.dataType, data);
            }

            if (monitoringPeriodStart) mrvData.monitoringPeriodStart = new Date(monitoringPeriodStart);
            if (monitoringPeriodEnd) mrvData.monitoringPeriodEnd = new Date(monitoringPeriodEnd);

            await mrvData.save();

            ApiResponseUtil.success(res, mrvData, 'MRV data updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete MRV data (before Guardian submission)
     */
    static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const mrvData = await MRVData.findById(id);

            if (!mrvData) {
                throw new NotFoundError('MRV data not found');
            }

            // Check if already submitted to Guardian
            if (mrvData.guardianSubmissionStatus === 'submitted') {
                throw new BadRequestError('Cannot delete MRV data that has been submitted to Guardian');
            }

            // Check ownership
            if (mrvData.submittedBy !== req.user?._id && req.user?.role !== UserRole.ADMIN) {
                throw new ForbiddenError('You do not have permission to delete this MRV data');
            }

            await mrvData.deleteOne();

            ApiResponseUtil.success(res, null, 'MRV data deleted successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate MRV data without submitting
     */
    static async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { dataType, data } = req.body;

            if (!Object.values(MRVDataType).includes(dataType)) {
                throw new BadRequestError('Invalid MRV data type');
            }

            const validation = await MRVService.validateMRVData(dataType, data);
            const calculatedCredits = validation.isValid ? MRVService.calculateCredits(dataType, data) : 0;

            ApiResponseUtil.success(res, {
                isValid: validation.isValid,
                errors: validation.errors,
                calculatedCredits,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default MRVController;
