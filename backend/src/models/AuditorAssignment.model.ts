import mongoose, { Schema } from 'mongoose';
import { IAuditorAssignment } from '../types';

const AuditorAssignmentSchema = new Schema<IAuditorAssignment>(
    {
        projectId: {
            type: String,
            ref: 'Project',
            required: true,
            index: true,
        },
        auditorId: {
            type: String,
            ref: 'User',
            required: true,
            index: true,
        },
        assignedAt: {
            type: Date,
            default: Date.now,
            required: true,
        },
        assignedBy: {
            type: String,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed', 'declined'],
            default: 'pending',
            required: true,
            index: true,
        },
        reviewNotes: {
            type: String,
            maxlength: 5000,
        },
        approvalDecision: {
            type: String,
            enum: ['approved', 'rejected', 'conditional'],
        },
        approvalSignature: {
            type: String,
        },
        completedAt: {
            type: Date,
        },
        notificationSent: {
            type: Boolean,
            default: false,
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
AuditorAssignmentSchema.index({ projectId: 1, auditorId: 1 }, { unique: true });
AuditorAssignmentSchema.index({ auditorId: 1, status: 1 });
AuditorAssignmentSchema.index({ status: 1, assignedAt: 1 });

// Virtual for review duration
AuditorAssignmentSchema.virtual('reviewDuration').get(function (this: IAuditorAssignment) {
    if (!this.completedAt) return null;
    const diff = this.completedAt.getTime() - this.assignedAt.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)); // days
});

const AuditorAssignment = mongoose.model<IAuditorAssignment>('AuditorAssignment', AuditorAssignmentSchema);

export default AuditorAssignment;
