import mongoose, { Schema } from 'mongoose';
import { IMRVData, MRVDataType, MRVDataStatus } from '../types';

const MRVDataSchema = new Schema<IMRVData>(
    {
        projectId: {
            type: String,
            ref: 'Project',
            required: true,
            index: true,
        },
        dataType: {
            type: String,
            enum: Object.values(MRVDataType),
            required: true,
            index: true,
        },
        monitoringPeriodStart: {
            type: Date,
            required: true,
        },
        monitoringPeriodEnd: {
            type: Date,
            required: true,
            validate: {
                validator: function (this: IMRVData, value: Date) {
                    return value > this.monitoringPeriodStart;
                },
                message: 'Monitoring period end must be after start date',
            },
        },
        data: {
            type: Schema.Types.Mixed,
            required: true,
        },
        validationStatus: {
            type: String,
            enum: Object.values(MRVDataStatus),
            default: MRVDataStatus.DRAFT,
            required: true,
            index: true,
        },
        validationErrors: {
            type: [String],
            default: [],
        },
        guardianSubmissionStatus: {
            type: String,
            enum: ['pending', 'submitted', 'failed'],
        },
        guardianVCId: {
            type: String,
            sparse: true,
        },
        ipfsHash: {
            type: String,
            sparse: true,
        },
        calculatedCredits: {
            type: Number,
            min: 0,
        },
        submittedBy: {
            type: String,
            ref: 'User',
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                delete (ret as any).__v;
                return ret;
            },
        },
    }
);

// Indexes
MRVDataSchema.index({ projectId: 1, validationStatus: 1 });
MRVDataSchema.index({ dataType: 1, validationStatus: 1 });
MRVDataSchema.index({ submittedBy: 1, createdAt: -1 });
MRVDataSchema.index({ guardianSubmissionStatus: 1 }, { sparse: true });

// Virtual for monitoring period duration
MRVDataSchema.virtual('monitoringPeriodDays').get(function (this: IMRVData) {
    const diff = this.monitoringPeriodEnd.getTime() - this.monitoringPeriodStart.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const MRVData = mongoose.model<IMRVData>('MRVData', MRVDataSchema);

export default MRVData;
