import QRCode from 'qrcode';
import logger from '../utils/logger';

export class QRService {
    /**
     * Generate QR code as data URL
     */
    static async generateQRCode(data: string): Promise<string> {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(data, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                width: 300,
                margin: 2,
            });

            return qrCodeDataUrl;
        } catch (error: any) {
            logger.error('Failed to generate QR code:', error);
            throw new Error(`QR code generation failed: ${error.message}`);
        }
    }

    /**
     * Generate QR code as buffer
     */
    static async generateQRCodeBuffer(data: string): Promise<Buffer> {
        try {
            const buffer = await QRCode.toBuffer(data, {
                errorCorrectionLevel: 'H',
                type: 'png',
                width: 300,
                margin: 2,
            });

            return buffer;
        } catch (error: any) {
            logger.error('Failed to generate QR code buffer:', error);
            throw new Error(`QR code generation failed: ${error.message}`);
        }
    }

    /**
     * Generate verification URL
     */
    static generateVerificationUrl(certificateId: string): string {
        const baseUrl = process.env.APP_URL || 'http://localhost:3000';
        return `${baseUrl}/verify/${certificateId}`;
    }

    /**
     * Generate QR code for certificate verification
     */
    static async generateCertificateQR(certificateId: string): Promise<string> {
        const verificationUrl = this.generateVerificationUrl(certificateId);
        return this.generateQRCode(verificationUrl);
    }
}

export default QRService;
