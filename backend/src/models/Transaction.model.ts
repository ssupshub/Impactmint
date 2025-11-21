import mongoose, { Schema } from 'mongoose';
import { ITransaction, TransactionStatus, TransactionType } from '../types';

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    hederaTransactionId: {
      type: String,
      required: [true, 'Hedera transaction ID is required'],
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, 'Transaction type is required'],
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
      required: true,
      index: true,
    },
    creditId: {
      type: String,
      ref: 'Credit',
      index: true,
    },
    projectId: {
      type: String,
      ref: 'Project',
      index: true,
    },
    from: {
      type: String,
      trim: true,
    },
    to: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      min: 0,
    },
    fee: {
      type: Number,
      min: 0,
      default: 0,
    },
    memo: {
      type: String,
      maxlength: 100,
    },
    receipt: {
      type: Schema.Types.Mixed,
    },
    errorMessage: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
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
TransactionSchema.index({ hederaTransactionId: 1 }, { unique: true });
TransactionSchema.index({ userId: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ creditId: 1 });
TransactionSchema.index({ projectId: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });

const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
