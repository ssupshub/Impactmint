import mongoose, { Document, Schema } from 'mongoose';

export enum RetirementReason {
    CORPORATE_NEUTRALITY = 'corporate_neutrality',
    EVENT_OFFSET = 'event_offset',
    PERSONAL_ACTION = 'personal_action',
    OTHER = 'other',
}

export interface IRetirement extends Document {
    retirementId: string;
    nftId: mongoose.Types.ObjectId;
    tokenId: string;
    serialNumber: number;
    projectId: mongoose.Types.ObjectId;
    retiredBy: mongoose.Types.ObjectId;
    beneficiary: {
        name: string;
        organization?: string;
        email?: string;
    };
    reason: RetirementReason;
    tonsCO2: number;
    retiredAt: Date;
    burnTransactionId: string;
    certificateId: string;
    certificatePdfUrl?: string;
    certificatePngUrl?: string;
    verified: boolean;
    publiclyVisible: boolean;
    metadata?: Record<string, any>;
}

const RetirementSchema = new Schema<IRetirement>(
    {
        retirementId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        nftId: {
            type: Schema.Types.ObjectId,
            ref: 'NFT',
            required: true,
            index: true,
        },
        tokenId: {
            type: String,
            required: true,
        },
        serialNumber: {
            type: Number,
            required: true,
        },
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        retiredBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        beneficiary: {
            name: {
                type: String,
                required: true,
            },
            organization: String,
            email: String,
        },
        reason: {
            type: String,
            enum: Object.values(RetirementReason),
            required: true,
        },
        tonsCO2: {
            type: Number,
            required: true,
        },
        retiredAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        burnTransactionId: {
            type: String,
            required: true,
            unique: true,
        },
        certificateId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        certificatePdfUrl: String,
        certificatePngUrl: String,
        verified: {
            type: Boolean,
            default: false,
        },
        publiclyVisible: {
            type: Boolean,
            default: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
RetirementSchema.index({ retiredBy: 1, retiredAt: -1 });
RetirementSchema.index({ 'beneficiary.organization': 1, retiredAt: -1 });
RetirementSchema.index({ projectId: 1, retiredAt: -1 });

export default mongoose.model<IRetirement>('Retirement', RetirementSchema);
