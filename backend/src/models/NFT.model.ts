import mongoose, { Schema } from 'mongoose';

export enum NFTStatus {
    ACTIVE = 'active',
    TRANSFERRED = 'transferred',
    RETIRED = 'retired',
}

export interface INFT extends mongoose.Document {
    tokenId: string;
    serialNumber: number;
    projectId: string;
    owner: string;
    metadata: {
        name: string;
        description: string;
        image: string;
        attributes: Array<{
            trait_type: string;
            value: string | number;
        }>;
        properties: Record<string, any>;
    };
    ipfsHash: string;
    certificateImageHash: string;
    status: NFTStatus;
    mintTransactionId: string;
    mintedAt: Date;
    retiredAt?: Date;
    retirementCertificateId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const NFTSchema = new Schema<INFT>(
    {
        tokenId: {
            type: String,
            required: true,
            index: true,
        },
        serialNumber: {
            type: Number,
            required: true,
            index: true,
        },
        projectId: {
            type: String,
            ref: 'Project',
            required: true,
            index: true,
        },
        owner: {
            type: String,
            required: true,
            index: true,
        },
        metadata: {
            name: String,
            description: String,
            image: String,
            attributes: [
                {
                    trait_type: String,
                    value: Schema.Types.Mixed,
                },
            ],
            properties: Schema.Types.Mixed,
        },
        ipfsHash: {
            type: String,
            required: true,
            sparse: true,
        },
        certificateImageHash: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(NFTStatus),
            default: NFTStatus.ACTIVE,
            required: true,
            index: true,
        },
        mintTransactionId: {
            type: String,
            required: true,
        },
        mintedAt: {
            type: Date,
            default: Date.now,
            required: true,
        },
        retiredAt: {
            type: Date,
        },
        retirementCertificateId: {
            type: String,
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

// Compound indexes
NFTSchema.index({ tokenId: 1, serialNumber: 1 }, { unique: true });
NFTSchema.index({ projectId: 1, status: 1 });
NFTSchema.index({ owner: 1, status: 1 });

// Virtual for NFT identifier
NFTSchema.virtual('nftId').get(function (this: INFT) {
    return `${this.tokenId}:${this.serialNumber}`;
});

const NFT = mongoose.model<INFT>('NFT', NFTSchema);

export default NFT;
