import mongoose, { Schema } from 'mongoose';
import { IGuardianWorkflow, GuardianWorkflowStatus } from '../types';

const GuardianWorkflowSchema = new Schema<IGuardianWorkflow>(
    {
        projectId: {
            type: String,
            ref: 'Project',
            required: true,
            index: true,
        },
        policyId: {
            type: String,
            required: true,
            index: true,
        },
        policyTag: {
            type: String,
            required: true,
        },
        currentStatus: {
            type: String,
            enum: Object.values(GuardianWorkflowStatus),
            default: GuardianWorkflowStatus.SUBMITTED,
            required: true,
            index: true,
        },
        guardianProjectId: {
            type: String,
            sparse: true,
        },
        guardianDID: {
            type: String,
            sparse: true,
        },
        guardianVPId: {
            type: String,
            sparse: true,
        },
        guardianVCIds: {
            type: [String],
            default: [],
        },
        stateHistory: [
            {
                status: {
                    type: String,
                    enum: Object.values(GuardianWorkflowStatus),
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                message: String,
                metadata: Schema.Types.Mixed,
            },
        ],
        errorLogs: [
            {
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                error: {
                    type: String,
                    required: true,
                },
                stackTrace: String,
            },
        ],
        retryCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastSyncedAt: {
            type: Date,
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
GuardianWorkflowSchema.index({ projectId: 1, currentStatus: 1 });
GuardianWorkflowSchema.index({ currentStatus: 1, lastSyncedAt: 1 });
GuardianWorkflowSchema.index({ guardianProjectId: 1 }, { sparse: true });

// Methods
GuardianWorkflowSchema.methods.addStateTransition = function (
    status: GuardianWorkflowStatus,
    message?: string,
    metadata?: Record<string, any>
) {
    this.stateHistory.push({
        status,
        timestamp: new Date(),
        message,
        metadata,
    });
    this.currentStatus = status;
    this.lastSyncedAt = new Date();
};

GuardianWorkflowSchema.methods.addErrorLog = function (error: string, stackTrace?: string) {
    this.errorLogs.push({
        timestamp: new Date(),
        error,
        stackTrace,
    });
    this.retryCount += 1;
};

const GuardianWorkflow = mongoose.model<IGuardianWorkflow>('GuardianWorkflow', GuardianWorkflowSchema);

export default GuardianWorkflow;
