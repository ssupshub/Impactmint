import Methodology, { IMethodology } from '../models/Methodology.model';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    calculatedValue?: number;
}

export class MethodologyService {
    /**
     * Get all active methodologies
     */
    static async getAllMethodologies(filters?: {
        category?: string;
        status?: string;
        tags?: string[];
    }): Promise<IMethodology[]> {
        const query: any = {};

        if (filters?.category) query.category = filters.category;
        if (filters?.status) query.status = filters.status;
        else query.status = 'active'; // Default to active only

        if (filters?.tags && filters.tags.length > 0) {
            query.tags = { $in: filters.tags };
        }

        return Methodology.find(query).sort({ name: 1 });
    }

    /**
     * Get methodology by ID
     */
    static async getMethodologyById(methodologyId: string): Promise<IMethodology> {
        const methodology = await Methodology.findOne({ methodologyId, status: 'active' });

        if (!methodology) {
            throw new NotFoundError('Methodology not found');
        }

        return methodology;
    }

    /**
     * Create new methodology
     */
    static async createMethodology(data: Partial<IMethodology>): Promise<IMethodology> {
        const methodology = await Methodology.create(data);
        logger.info('Methodology created', { methodologyId: methodology.methodologyId });
        return methodology;
    }

    /**
     * Update methodology (creates new version)
     */
    static async updateMethodology(
        methodologyId: string,
        updates: Partial<IMethodology>
    ): Promise<IMethodology> {
        const existing = await this.getMethodologyById(methodologyId);

        // Increment version
        const versionParts = existing.version.split('.');
        const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}`;

        // Create new version
        const newMethodology = await Methodology.create({
            ...existing.toObject(),
            ...updates,
            _id: undefined,
            version: newVersion,
            lastUpdated: new Date(),
        });

        // Deprecate old version
        existing.status = 'deprecated' as any;
        await existing.save();

        logger.info('Methodology updated', {
            methodologyId,
            oldVersion: existing.version,
            newVersion,
        });

        return newMethodology;
    }

    /**
     * Validate project data against methodology
     */
    static async validateProjectData(
        methodologyId: string,
        projectData: Record<string, any>
    ): Promise<ValidationResult> {
        const methodology = await this.getMethodologyById(methodologyId);
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check required fields
        for (const field of methodology.requiredFields) {
            if (field.required && !projectData[field.name]) {
                errors.push(`Required field missing: ${field.name}`);
                continue;
            }

            const value = projectData[field.name];

            // Type validation
            if (value !== undefined && value !== null) {
                if (field.type === 'number' && typeof value !== 'number') {
                    errors.push(`Field ${field.name} must be a number`);
                }

                // Min/max validation
                if (field.type === 'number') {
                    if (field.min !== undefined && value < field.min) {
                        errors.push(`Field ${field.name} must be >= ${field.min}`);
                    }
                    if (field.max !== undefined && value > field.max) {
                        errors.push(`Field ${field.name} must be <= ${field.max}`);
                    }
                }
            }
        }

        // Apply validation rules
        for (const rule of methodology.validationRules) {
            const fieldValue = projectData[rule.field];

            if (fieldValue === undefined || fieldValue === null) continue;

            switch (rule.rule) {
                case 'min':
                    if (fieldValue < rule.value) {
                        errors.push(rule.message);
                    }
                    break;

                case 'max':
                    if (fieldValue > rule.value) {
                        errors.push(rule.message);
                    }
                    break;

                case 'range':
                    if (rule.min !== undefined && fieldValue < rule.min) {
                        errors.push(rule.message);
                    }
                    if (rule.max !== undefined && fieldValue > rule.max) {
                        errors.push(rule.message);
                    }
                    break;

                case 'regex':
                    if (rule.pattern && !new RegExp(rule.pattern).test(String(fieldValue))) {
                        errors.push(rule.message);
                    }
                    break;

                case 'custom':
                    // Custom validation would be evaluated here
                    warnings.push(`Custom validation for ${rule.field} not yet implemented`);
                    break;
            }
        }

        // Calculate carbon offset if validation passes
        let calculatedValue: number | undefined;
        if (errors.length === 0) {
            try {
                calculatedValue = this.calculateCarbonOffset(methodology, projectData);
            } catch (error: any) {
                errors.push(`Calculation error: ${error.message}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            calculatedValue,
        };
    }

    /**
     * Calculate carbon offset using methodology formula
     */
    static calculateCarbonOffset(
        methodology: IMethodology,
        projectData: Record<string, any>
    ): number {
        try {
            // Parse and evaluate formula
            let formula = methodology.calculationFormula;

            // Replace variables with actual values
            for (const field of methodology.requiredFields) {
                const value = projectData[field.name] ?? field.default ?? 0;
                formula = formula.replace(new RegExp(field.name, 'g'), String(value));
            }

            // Evaluate formula (safe evaluation)
            const result = this.evaluateFormula(formula);

            // Round to 2 decimal places
            return Math.round(result * 100) / 100;
        } catch (error: any) {
            logger.error('Formula calculation error:', error);
            throw new Error(`Failed to calculate carbon offset: ${error.message}`);
        }
    }

    /**
     * Safe formula evaluation
     */
    private static evaluateFormula(formula: string): number {
        // Remove any potentially dangerous characters
        const safeFormula = formula.replace(/[^0-9+\-*/().\s]/g, '');

        // Use Function constructor for safe evaluation (limited scope)
        try {
            const result = new Function(`return ${safeFormula}`)();
            return parseFloat(result);
        } catch (error) {
            throw new Error('Invalid formula');
        }
    }

    /**
     * Get methodology recommendations based on project characteristics
     */
    static async getRecommendations(projectCharacteristics: {
        projectType: string;
        scale: 'small' | 'medium' | 'large';
        location: string;
        availableData: string[];
        budget?: number;
    }): Promise<Array<{ methodology: IMethodology; score: number; reasons: string[] }>> {
        const allMethodologies = await this.getAllMethodologies();
        const recommendations: Array<{ methodology: IMethodology; score: number; reasons: string[] }> =
            [];

        for (const methodology of allMethodologies) {
            let score = 0;
            const reasons: string[] = [];

            // Project type match (highest weight: 40 points)
            if (methodology.category.toLowerCase().includes(projectCharacteristics.projectType.toLowerCase())) {
                score += 40;
                reasons.push('Perfect match for project type');
            }

            // Data availability (30 points)
            const requiredDataPoints = methodology.monitoringRequirements.dataPoints;
            const availableDataPoints = projectCharacteristics.availableData;
            const dataMatch = requiredDataPoints.filter((dp) =>
                availableDataPoints.some((ad) => ad.toLowerCase().includes(dp.toLowerCase()))
            ).length;
            const dataScore = (dataMatch / requiredDataPoints.length) * 30;
            score += dataScore;
            if (dataScore > 20) {
                reasons.push('Good data availability match');
            }

            // Regional eligibility (10 points)
            if (
                methodology.eligibleRegions.includes('global') ||
                methodology.eligibleRegions.includes(projectCharacteristics.location)
            ) {
                score += 10;
                reasons.push('Eligible in your region');
            }

            // Market demand (10 points)
            if (methodology.marketDemand === 'high') {
                score += 10;
                reasons.push('High market demand');
            } else if (methodology.marketDemand === 'medium') {
                score += 5;
            }

            // Budget consideration (10 points)
            if (projectCharacteristics.budget && methodology.verificationCost) {
                if (methodology.verificationCost <= projectCharacteristics.budget) {
                    score += 10;
                    reasons.push('Within budget');
                }
            }

            recommendations.push({ methodology, score, reasons });
        }

        // Sort by score and return top 3
        return recommendations.sort((a, b) => b.score - a.score).slice(0, 3);
    }

    /**
     * Compare multiple methodologies
     */
    static async compareMethodologies(methodologyIds: string[]): Promise<any> {
        const methodologies = await Promise.all(
            methodologyIds.map((id) => this.getMethodologyById(id))
        );

        return {
            methodologies: methodologies.map((m) => ({
                id: m.methodologyId,
                name: m.name,
                category: m.category,
                requiredFields: m.requiredFields.length,
                calculationMethod: m.calculationFormula,
                monitoringFrequency: m.monitoringRequirements.frequency,
                verificationCost: m.verificationCost,
                typicalPrice: m.typicalCreditPrice,
                marketDemand: m.marketDemand,
            })),
        };
    }

    /**
     * Search methodologies
     */
    static async searchMethodologies(query: string): Promise<IMethodology[]> {
        return Methodology.find({
            status: 'active',
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } },
            ],
        }).limit(10);
    }
}

export default MethodologyService;
