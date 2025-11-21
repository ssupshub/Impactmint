import mongoose, { Schema } from 'mongoose';

export interface ITreasuryAccount extends mongoose.Document {
    accountId: string;
    privateKey: string;
    methodology?: 'REC' | 'REDD' | 'OPR';
    balance: number;
    tokenCollections: Array<{
        tokenId: string;
        name: string;
        symbol: string;
        totalMinted: number;
        createdAt: Date;
    }>;
    lastBalanceCheck: Date;
    alertThreshold: number;
    autoRefill: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TreasuryAccountSchema = new Schema<ITreasuryAccount>(
    {
        accountId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        privateKey: {
            type: String,
            required: true,
            // In production, this should be encrypted
        },
        methodology: {
            type: String,
            enum: ['REC', 'REDD', 'OPR'],
            sparse: true,
        },
        balance: {
            type: Number,
            default: 0,
            min: 0,
        },
        tokenCollections: [
            {
                tokenId: {
                    type: String,
                    required: true,
                },
                name: String,
                symbol: String,
                totalMinted: {
                    type: Number,
                    default: 0,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        lastBalanceCheck: {
            type: Date,
            default: Date.now,
        },
        alertThreshold: {
            type: Number,
            default: 10, // Alert when balance < 10 HBAR
        },
        autoRefill: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                // Don't expose private key in JSON
                delete ret.privateKey;
                delete (ret as any).__v;
                return ret;
            },
        },
    }
);

// Methods
TreasuryAccountSchema.methods.addTokenCollection = function (
    tokenId: string,
    name: string,
    symbol: string
) {
    this.tokenCollections.push({
        tokenId,
        name,
        symbol,
        totalMinted: 0,
        createdAt: new Date(),
    });
};

TreasuryAccountSchema.methods.incrementMintCount = function (tokenId: string, count: number = 1) {
    const collection = this.tokenCollections.find((c: any) => c.tokenId === tokenId);
    if (collection) {
        collection.totalMinted += count;
    }
};

const TreasuryAccount = mongoose.model<ITreasuryAccount>('TreasuryAccount', TreasuryAccountSchema);

export default TreasuryAccount;
