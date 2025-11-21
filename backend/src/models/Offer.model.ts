import mongoose, { Document, Schema } from 'mongoose';

export enum OfferStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    COUNTERED = 'countered',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled',
}

export interface ICounterOffer {
    price: number;
    by: mongoose.Types.ObjectId;
    at: Date;
}

export interface IOffer extends Document {
    offerId: string;
    listingId: mongoose.Types.ObjectId;
    buyer: mongoose.Types.ObjectId;
    offerPrice: number;
    status: OfferStatus;
    createdAt: Date;
    expiresAt: Date;
    smartContractOfferId?: number;
    counterOffers: ICounterOffer[];
    message?: string;
}

const CounterOfferSchema = new Schema<ICounterOffer>(
    {
        price: { type: Number, required: true },
        by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        at: { type: Date, default: Date.now },
    },
    { _id: false }
);

const OfferSchema = new Schema<IOffer>(
    {
        offerId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        listingId: {
            type: Schema.Types.ObjectId,
            ref: 'Listing',
            required: true,
            index: true,
        },
        buyer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        offerPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(OfferStatus),
            default: OfferStatus.PENDING,
            index: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
        smartContractOfferId: Number,
        counterOffers: [CounterOfferSchema],
        message: String,
    },
    {
        timestamps: true,
    }
);

// Indexes
OfferSchema.index({ listingId: 1, status: 1 });
OfferSchema.index({ buyer: 1, status: 1 });

export default mongoose.model<IOffer>('Offer', OfferSchema);
