import mongoose, { Document, Schema } from 'mongoose';

export interface IRetirementCertificate extends Document {
    certificateId: string;
    retirementId: mongoose.Types.ObjectId;
    projectName: string;
    methodology: string;
    tonsCO2: number;
    vintage: number;
    beneficiary: string;
    retirementDate: Date;
    qrCodeData: string;
    digitalSignature: string;
    verificationUrl: string;
    pdfUrl?: string;
    pngUrl?: string;
    language: string;
}

const RetirementCertificateSchema = new Schema<IRetirementCertificate>(
    {
        certificateId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        retirementId: {
            type: Schema.Types.ObjectId,
            ref: 'Retirement',
            required: true,
            index: true,
        },
        projectName: {
            type: String,
            required: true,
        },
        methodology: {
            type: String,
            required: true,
        },
        tonsCO2: {
            type: Number,
            required: true,
        },
        vintage: {
            type: Number,
            required: true,
        },
        beneficiary: {
            type: String,
            required: true,
        },
        retirementDate: {
            type: Date,
            required: true,
        },
        qrCodeData: {
            type: String,
            required: true,
        },
        digitalSignature: {
            type: String,
            required: true,
        },
        verificationUrl: {
            type: String,
            required: true,
        },
        pdfUrl: String,
        pngUrl: String,
        language: {
            type: String,
            default: 'en',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IRetirementCertificate>(
    'RetirementCertificate',
    RetirementCertificateSchema
);
