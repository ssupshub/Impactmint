import mongoose, { Document, Schema } from 'mongoose';

export enum MethodologyCategory {
    RENEWABLE_ENERGY = 'Renewable Energy',
    REFORESTATION = 'Reforestation',
    OCEAN_CONSERVATION = 'Ocean Conservation',
    SOIL_CARBON = 'Soil Carbon',
    WASTE_MANAGEMENT = 'Waste Management',
    ENERGY_EFFICIENCY = 'Energy Efficiency',
}

export enum MethodologyStatus {
    ACTIVE = 'active',
    DEPRECATED = 'deprecated',
    DRAFT = 'draft',
    PENDING_APPROVAL = 'pending_approval',
}

export interface IRequiredField {
    name: string;
    type: 'number' | 'string' | 'date' | 'boolean';
    unit?: string;
    min?: number;
    max?: number;
    default?: any;
    required: boolean;
    description?: string;
}

export interface IValidationRule {
    field: string;
    rule: 'min' | 'max' | 'range' | 'regex' | 'custom';
    value?: any;
    min?: number;
    max?: number;
    pattern?: string;
    customFunction?: string;
    message: string;
}

export interface IMonitoringRequirements {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    dataPoints: string[];
    thirdPartyVerification: boolean;
    reportingFormat?: string;
}

export interface IDocumentation {
    guidelines?: string;
    examples?: string;
    calculator?: string;
    pdfUrl?: string;
}

export interface IMethodology extends Document {
    methodologyId: string;
    name: string;
    version: string;
    category: MethodologyCategory;
    description: string;
    standard: string;
    requiredFields: IRequiredField[];
    calculationFormula: string;
    validationRules: IValidationRule[];
    monitoringRequirements: IMonitoringRequirements;
    documentation: IDocumentation;
    eligibleRegions: string[];
    minProjectSize: number;
    maxProjectSize?: number;
    createdBy: string;
    approvedBy: string[];
    lastUpdated: Date;
    status: MethodologyStatus;
    tags?: string[];
    marketDemand?: 'low' | 'medium' | 'high';
    verificationCost?: number;
    typicalCreditPrice?: number;
}

const RequiredFieldSchema = new Schema<IRequiredField>(
    {
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['number', 'string', 'date', 'boolean'],
            required: true,
        },
        unit: String,
        min: Number,
        max: Number,
        default: Schema.Types.Mixed,
        required: { type: Boolean, default: true },
        description: String,
    },
    { _id: false }
);

const ValidationRuleSchema = new Schema<IValidationRule>(
    {
        field: { type: String, required: true },
        rule: {
            type: String,
            enum: ['min', 'max', 'range', 'regex', 'custom'],
            required: true,
        },
        value: Schema.Types.Mixed,
        min: Number,
        max: Number,
        pattern: String,
        customFunction: String,
        message: { type: String, required: true },
    },
    { _id: false }
);

const MonitoringRequirementsSchema = new Schema<IMonitoringRequirements>(
    {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually'],
            required: true,
        },
        dataPoints: [String],
        thirdPartyVerification: { type: Boolean, default: true },
        reportingFormat: String,
    },
    { _id: false }
);

const DocumentationSchema = new Schema<IDocumentation>(
    {
        guidelines: String,
        examples: String,
        calculator: String,
        pdfUrl: String,
    },
    { _id: false }
);

const MethodologySchema = new Schema<IMethodology>(
    {
        methodologyId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
        version: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: Object.values(MethodologyCategory),
            required: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
        },
        standard: {
            type: String,
            required: true,
        },
        requiredFields: [RequiredFieldSchema],
        calculationFormula: {
            type: String,
            required: true,
        },
        validationRules: [ValidationRuleSchema],
        monitoringRequirements: MonitoringRequirementsSchema,
        documentation: DocumentationSchema,
        eligibleRegions: [String],
        minProjectSize: {
            type: Number,
            default: 1,
        },
        maxProjectSize: Number,
        createdBy: {
            type: String,
            required: true,
        },
        approvedBy: [String],
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: Object.values(MethodologyStatus),
            default: MethodologyStatus.ACTIVE,
            index: true,
        },
        tags: [String],
        marketDemand: {
            type: String,
            enum: ['low', 'medium', 'high'],
        },
        verificationCost: Number,
        typicalCreditPrice: Number,
    },
    {
        timestamps: true,
    }
);

// Indexes
MethodologySchema.index({ methodologyId: 1, version: 1 }, { unique: true });
MethodologySchema.index({ category: 1, status: 1 });
MethodologySchema.index({ tags: 1 });

export default mongoose.model<IMethodology>('Methodology', MethodologySchema);
