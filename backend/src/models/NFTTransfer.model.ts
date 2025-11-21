import mongoose, { Schema } from 'mongoose';

export interface INFTTransfer extends mongoose.Document {
    nftId: string;
    tokenId: string;
    serialNumber: number;
    from: string;
    to: string;
    transactionId: string;
    transferredAt: Date;
    reason: 'sale' | 'gift' | 'retirement' | 'other';
    price?: number;
    priceUnit?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const NFTTransferSchema = new Schema<INFTTransfer>(
    {
        nftId: {
            type: String,
            ref: 'NFT',
            required: true,
            index: true,
        },
        tokenId: {
            type: String,
            required: true,
            index: true,
        },
        serialNumber: {
            type: Number,
            required: true,
        },
        from: {
            type: String,
            required: true,
            index: true,
        },
        to: {
            type: String,
            required: true,
            index: true,
        },
        transactionId: {
            type: String,
            required: true,
            unique: true,
        },
        transferredAt: {
            type: Date,
            default: Date.now,
            required: true,
        },
        reason: {
            type: String,
            enum: ['sale', 'gift', 'retirement', 'other'],
            default: 'other',
        },
        price: {
            type: Number,
            min: 0,
        },
        priceUnit: {
            type: String,
            default: 'USD',
        },
        notes: {
            type: String,
            maxlength: 500,
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
NFTTransferSchema.index({ nftId: 1, transferredAt: -1 });
NFTTransferSchema.index({ from: 1, transferredAt: -1 });
NFTTransferSchema.index({ to: 1, transferredAt: -1 });

const NFTTransfer = mongoose.model<INFTTransfer>('NFTTransfer', NFTTransferSchema);

export default NFTTransfer;
