import { MRVDataType, MRVDataStatus, IMRVData } from '../types';
import MRVData from '../models/MRVData.model';
import GuardianService from './guardian.service';
import logger from '../utils/logger';
import { BadRequestError } from '../utils/errors';

export class MRVService {
    /**
     * Validate MRV data against methodology requirements
     */
    static async validateMRVData(dataType: MRVDataType, data: Record<string, any>): Promise<{
        isValid: boolean;
        errors: string[];
    }> {
        const errors: string[] = [];

        switch (dataType) {
            case MRVDataType.REC:
                errors.push(...this.validateRECData(data));
                break;
            case MRVDataType.REDD:
                errors.push(...this.validateREDDData(data));
                break;
            case MRVDataType.OPR:
                errors.push(...this.validateOPRData(data));
                break;
            default:
                errors.push('Invalid MRV data type');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Validate REC (Renewable Energy) data
     */
    private static validateRECData(data: Record<string, any>): string[] {
        const errors: string[] = [];

        if (!data.energyGenerated || data.energyGenerated <= 0) {
            errors.push('Energy generated must be greater than 0');
        }

        if (!data.emissionFactor || data.emissionFactor <= 0) {
            errors.push('Emission factor must be greater than 0');
        }

        if (!data.meterReadings || !Array.isArray(data.meterReadings) || data.meterReadings.length === 0) {
            errors.push('At least one meter reading is required');
        }

        if (!data.monitoringPeriodStart || !data.monitoringPeriodEnd) {
            errors.push('Monitoring period start and end dates are required');
        }

        return errors;
    }

    /**
     * Validate REDD+ (Reforestation) data
     */
    private static validateREDDData(data: Record<string, any>): string[] {
        const errors: string[] = [];

        if (!data.fieldMeasurements) {
            errors.push('Field measurements are required');
        } else {
            if (!data.fieldMeasurements.treesPlanted || data.fieldMeasurements.treesPlanted <= 0) {
                errors.push('Trees planted must be greater than 0');
            }
            if (!data.fieldMeasurements.treesSurvived || data.fieldMeasurements.treesSurvived <= 0) {
                errors.push('Trees survived must be greater than 0');
            }
        }

        if (!data.carbonSequestration) {
            errors.push('Carbon sequestration data is required');
        } else {
            if (!data.carbonSequestration.totalSequestered || data.carbonSequestration.totalSequestered <= 0) {
                errors.push('Total carbon sequestered must be greater than 0');
            }
        }

        if (!data.vintageYear || data.vintageYear < 2000 || data.vintageYear > new Date().getFullYear()) {
            errors.push('Valid vintage year is required');
        }

        return errors;
    }

    /**
     * Validate OPR (Ocean Plastic Removal) data
     */
    private static validateOPRData(data: Record<string, any>): string[] {
        const errors: string[] = [];

        if (!data.totalPlasticCollected || data.totalPlasticCollected <= 0) {
            errors.push('Total plastic collected must be greater than 0');
        }

        if (!data.collectionEvents || !Array.isArray(data.collectionEvents) || data.collectionEvents.length === 0) {
            errors.push('At least one collection event is required');
        }

        if (!data.weighingRecords || !Array.isArray(data.weighingRecords) || data.weighingRecords.length === 0) {
            errors.push('At least one weighing record is required');
        }

        if (!data.evidencePhotos || !Array.isArray(data.evidencePhotos) || data.evidencePhotos.length === 0) {
            errors.push('At least one evidence photo is required');
        }

        return errors;
    }

    /**
     * Transform MRV data for Guardian ingestion
     */
    static transformForGuardian(dataType: MRVDataType, data: Record<string, any>): Record<string, any> {
        // Transform data to match Guardian schema format
        const transformed: Record<string, any> = {
            ...data,
            timestamp: new Date().toISOString(),
            dataType,
        };

        // Add methodology-specific transformations
        switch (dataType) {
            case MRVDataType.REC:
                transformed.calculatedEmissionsReduced = data.energyGenerated * data.emissionFactor;
                break;
            case MRVDataType.REDD:
                if (data.fieldMeasurements) {
                    transformed.fieldMeasurements.survivalRate =
                        (data.fieldMeasurements.treesSurvived / data.fieldMeasurements.treesPlanted) * 100;
                }
                break;
            case MRVDataType.OPR:
                transformed.calculatedEmissionsAverted = data.totalPlasticCollected * 2.5; // Default emission factor
                break;
        }

        return transformed;
    }

    /**
     * Submit MRV data to queue for Guardian processing
     */
    static async submitToQueue(mrvDataId: string): Promise<void> {
        try {
            const mrvData = await MRVData.findById(mrvDataId);
            if (!mrvData) {
                throw new BadRequestError('MRV data not found');
            }

            // Update status to pending submission
            mrvData.guardianSubmissionStatus = 'pending';
            await mrvData.save();

            logger.info('MRV data added to submission queue', { mrvDataId });
        } catch (error: any) {
            logger.error('Failed to add MRV data to queue:', error);
            throw error;
        }
    }

    /**
     * Process MRV data submission queue
     */
    static async processQueue(): Promise<void> {
        try {
            // Find all pending MRV data submissions
            const pendingData = await MRVData.find({
                guardianSubmissionStatus: 'pending',
            }).limit(10);

            for (const mrvData of pendingData) {
                try {
                    await this.submitToGuardian(mrvData);
                } catch (error: any) {
                    logger.error('Failed to process MRV data from queue:', {
                        mrvDataId: mrvData._id,
                        error: error.message,
                    });

                    mrvData.guardianSubmissionStatus = 'failed';
                    mrvData.validationErrors = [error.message];
                    await mrvData.save();
                }
            }
        } catch (error: any) {
            logger.error('Failed to process MRV queue:', error);
        }
    }

    /**
     * Submit MRV data to Guardian
     */
    private static async submitToGuardian(mrvData: IMRVData): Promise<void> {
        // This would be implemented with actual Guardian API calls
        // For now, this is a placeholder
        logger.info('Submitting MRV data to Guardian', { mrvDataId: mrvData._id });

        // Transform data for Guardian
        const transformedData = this.transformForGuardian(mrvData.dataType, mrvData.data);

        // In a real implementation, this would call GuardianService.uploadMRVData()
        // const result = await GuardianService.uploadMRVData(policyId, projectId, transformedData, schemaName);

        // Update MRV data with Guardian response
        mrvData.guardianSubmissionStatus = 'submitted';
        // mrvData.guardianVCId = result.vcId;
        // mrvData.ipfsHash = result.ipfsHash;
        await mrvData.save();
    }

    /**
     * Calculate expected carbon credits
     */
    static calculateCredits(dataType: MRVDataType, data: Record<string, any>): number {
        switch (dataType) {
            case MRVDataType.REC:
                return data.energyGenerated * data.emissionFactor;
            case MRVDataType.REDD:
                return data.carbonSequestration?.totalSequestered || 0;
            case MRVDataType.OPR:
                return data.totalPlasticCollected * 2.5;
            default:
                return 0;
        }
    }

    /**
     * Get MRV data by project
     */
    static async getByProject(projectId: string): Promise<IMRVData[]> {
        return await MRVData.find({ projectId }).sort({ createdAt: -1 });
    }

    /**
     * Get MRV data statistics
     */
    static async getStatistics(projectId: string): Promise<{
        totalSubmissions: number;
        validatedSubmissions: number;
        totalCreditsCalculated: number;
    }> {
        const mrvData = await MRVData.find({ projectId });

        return {
            totalSubmissions: mrvData.length,
            validatedSubmissions: mrvData.filter((d) => d.validationStatus === MRVDataStatus.VALIDATED).length,
            totalCreditsCalculated: mrvData.reduce((sum, d) => sum + (d.calculatedCredits || 0), 0),
        };
    }
}

export default MRVService;
