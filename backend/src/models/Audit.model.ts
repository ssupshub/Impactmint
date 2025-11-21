import mongoose, { Schema } from 'mongoose';
import { IAudit, AuditStatus } from '../types';

const AuditSchema = new Schema<IAudit>(
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
    status: {
      type: String,
      enum: Object.values(AuditStatus),
      default: AuditStatus.PENDING,
      required: true,
      index: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    completedAt: {
      type: Date,
    },
    findings: {
      type: String,
      maxlength: [10000, 'Findings cannot exceed 10000 characters'],
      default: '',
    },
    verifiedCapacity: {
      type: Number,
      min: [0, 'Verified capacity must be non-negative'],
    },
    documents: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    recommendations: {
      type: [String],
      default: [],
    },
    approvalSignature: {
      type: String,
      trim: true,
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
AuditSchema.index({ projectId: 1 });
AuditSchema.index({ auditorId: 1 });
AuditSchema.index({ status: 1 });
AuditSchema.index({ createdAt: -1 });
AuditSchema.index({ projectId: 1, status: 1 });
AuditSchema.index({ auditorId: 1, status: 1 });

// Pre-save hook to set completedAt
AuditSchema.pre('save', function (next) {
  if (
    this.isModified('status') &&
    (this.status === AuditStatus.APPROVED || this.status === AuditStatus.REJECTED) &&
    !this.completedAt
  ) {
    this.completedAt = new Date();
  }
  next();
});

const Audit = mongoose.model<IAudit>('Audit', AuditSchema);

export default Audit;
