import mongoose, { Schema } from 'mongoose';
import { ICredit, CreditStatus } from '../types';

const CreditSchema = new Schema<ICredit>(
  {
    projectId: {
      type: String,
      ref: 'Project',
      required: true,
      index: true,
    },
    tokenId: {
      type: String,
      required: [true, 'Token ID is required'],
      unique: true,
      index: true,
    },
    serialNumber: {
      type: Number,
      required: [true, 'Serial number is required'],
      min: 1,
    },
    owner: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    status: {
      type: String,
      enum: Object.values(CreditStatus),
      default: CreditStatus.ACTIVE,
      required: true,
      index: true,
    },
    mintTransactionId: {
      type: String,
      required: [true, 'Mint transaction ID is required'],
      index: true,
    },
    retireTransactionId: {
      type: String,
      index: true,
    },
    metadata: {
      vintage: {
        type: Number,
        required: [true, 'Vintage year is required'],
        min: 2000,
        max: 2100,
      },
      methodology: {
        type: String,
        required: [true, 'Methodology is required'],
      },
      verificationStandard: {
        type: String,
        required: [true, 'Verification standard is required'],
      },
      additionalData: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
    ipfsMetadataUrl: {
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
CreditSchema.index({ tokenId: 1 }, { unique: true });
CreditSchema.index({ tokenId: 1, serialNumber: 1 }, { unique: true });
CreditSchema.index({ owner: 1 });
CreditSchema.index({ projectId: 1 });
CreditSchema.index({ status: 1 });
CreditSchema.index({ 'metadata.vintage': 1 });
CreditSchema.index({ createdAt: -1 });

// Virtual for credit identifier
CreditSchema.virtual('identifier').get(function (this: ICredit) {
  return `${this.tokenId}:${this.serialNumber}`;
});

const Credit = mongoose.model<ICredit>('Credit', CreditSchema);

export default Credit;
