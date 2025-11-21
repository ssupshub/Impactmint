import mongoose, { Document, Schema } from 'mongoose';

export interface ISale extends Document {
    saleId: string;
    listingId: mongoose.Types.ObjectId;
    nftId: mongoose.Types.ObjectId;
    seller: mongoose.Types.ObjectId;
    buyer: mongoose.Types.ObjectId;
    salePrice: number;
    salePriceUSD: number;
    marketplaceFee: number;
    sellerProceeds: number;
    transactionId: string;
    soldAt: Date;
}

const SaleSchema = new Schema<ISale>(
    {
        saleId: {
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
        nftId: {
            type: Schema.Types.ObjectId,
            ref: 'NFT',
            required: true,
            index: true,
        },
        seller: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        buyer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        salePrice: {
            type: Number,
            required: true,
        },
        salePriceUSD: {
            type: Number,
            required: true,
        },
        marketplaceFee: {
            type: Number,
            required: true,
        },
        sellerProceeds: {
            type: Number,
            required: true,
        },
        transactionId: {
            type: String,
            required: true,
            unique: true,
        },
        soldAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for analytics
SaleSchema.index({ soldAt: -1 });
SaleSchema.index({ seller: 1, soldAt: -1 });
SaleSchema.index({ buyer: 1, soldAt: -1 });

export default mongoose.model<ISale>('Sale', SaleSchema);
