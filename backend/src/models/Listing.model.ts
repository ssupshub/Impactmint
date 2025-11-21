import mongoose, { Schema } from 'mongoose';
import { IListing, ListingStatus } from '../types';

const ListingSchema = new Schema<IListing>(
  {
    creditId: {
      type: String,
      ref: 'Credit',
      required: true,
      index: true,
    },
    sellerId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    buyerId: {
      type: String,
      ref: 'User',
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    remainingQuantity: {
      type: Number,
      required: true,
      min: [0, 'Remaining quantity must be non-negative'],
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
    },
    status: {
      type: String,
      enum: Object.values(ListingStatus),
      default: ListingStatus.ACTIVE,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
    purchasedAt: {
      type: Date,
    },
    transactionId: {
      type: String,
      ref: 'Transaction',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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
ListingSchema.index({ creditId: 1 });
ListingSchema.index({ sellerId: 1 });
ListingSchema.index({ status: 1 });
ListingSchema.index({ price: 1 });
ListingSchema.index({ createdAt: -1 });
ListingSchema.index({ status: 1, createdAt: -1 });
ListingSchema.index({ expiresAt: 1 }, { sparse: true });

// Pre-save hook to set remainingQuantity on creation
ListingSchema.pre('save', function (next) {
  if (this.isNew && this.remainingQuantity === undefined) {
    this.remainingQuantity = this.quantity;
  }
  next();
});

// Virtual for isExpired
ListingSchema.virtual('isExpired').get(function (this: IListing) {
  if (!this.expiresAt) return false;
  return this.expiresAt < new Date();
});

const Listing = mongoose.model<IListing>('Listing', ListingSchema);

export default Listing;
