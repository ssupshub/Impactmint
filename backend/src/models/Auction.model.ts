import mongoose, { Document, Schema } from 'mongoose';

export interface IBid {
    bidder: mongoose.Types.ObjectId;
    amount: number;
    timestamp: Date;
}

export interface IAuction extends Document {
    auctionId: string;
    listingId: mongoose.Types.ObjectId;
    startPrice: number;
    reservePrice: number;
    currentBid: number;
    currentBidder?: mongoose.Types.ObjectId;
    bids: IBid[];
    endsAt: Date;
    autoExtend: boolean;
    finalized: boolean;
    smartContractAuctionId?: number;
}

const BidSchema = new Schema<IBid>(
    {
        bidder: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false }
);

const AuctionSchema = new Schema<IAuction>(
    {
        auctionId: {
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
        startPrice: {
            type: Number,
            required: true,
        },
        reservePrice: {
            type: Number,
            required: true,
        },
        currentBid: {
            type: Number,
            default: 0,
        },
        currentBidder: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        bids: [BidSchema],
        endsAt: {
            type: Date,
            required: true,
            index: true,
        },
        autoExtend: {
            type: Boolean,
            default: true,
        },
        finalized: {
            type: Boolean,
            default: false,
        },
        smartContractAuctionId: Number,
    },
    {
        timestamps: true,
    }
);

// Indexes
AuctionSchema.index({ endsAt: 1, finalized: 1 });

export default mongoose.model<IAuction>('Auction', AuctionSchema);
