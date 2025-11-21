import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import QRService from './qr.service';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

interface CertificateData {
    certificateId: string;
    projectName: string;
    methodology: string;
    tonsCO2: number;
    vintage: number;
    beneficiary: string;
    organization?: string;
    retirementDate: Date;
    burnTransactionId: string;
    language?: string;
}

export class RetirementCertificateGenerator {
    private static readonly CERT_DIR = path.join(__dirname, '../../certificates');

    /**
     * Initialize certificate directory
     */
    static initialize(): void {
        if (!fs.existsSync(this.CERT_DIR)) {
            fs.mkdirSync(this.CERT_DIR, { recursive: true });
        }
    }

    /**
     * Generate digital signature for certificate
     */
    private static generateSignature(data: CertificateData): string {
        const signatureData = `${data.certificateId}${data.projectName}${data.tonsCO2}${data.retirementDate.toISOString()}`;
        return crypto.createHash('sha256').update(signatureData).digest('hex');
    }

    /**
     * Generate retirement certificate PDF
     */
    static async generateCertificate(data: CertificateData): Promise<{
        pdfPath: string;
        pngPath: string;
        certificateId: string;
        digitalSignature: string;
        verificationUrl: string;
    }> {
        try {
            this.initialize();

            const certificateId = data.certificateId || uuidv4();
            const digitalSignature = this.generateSignature({ ...data, certificateId });
            const verificationUrl = QRService.generateVerificationUrl(certificateId);
            const qrCodeDataUrl = await QRService.generateCertificateQR(certificateId);

            const pdfPath = path.join(this.CERT_DIR, `${certificateId}.pdf`);
            const pngPath = path.join(this.CERT_DIR, `${certificateId}.png`);

            // Create PDF document
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                info: {
                    Title: `Carbon Credit Retirement Certificate - ${certificateId}`,
                    Author: 'ImpactMint',
                    Subject: 'Carbon Credit Retirement',
                },
            });

            const stream = fs.createWriteStream(pdfPath);
            doc.pipe(stream);

            // Background gradient
            doc.rect(0, 0, 595, 842).fillColor('#f0f9ff').fill();

            // Header border
            doc.rect(30, 30, 535, 782)
                .lineWidth(3)
                .strokeColor('#1e40af')
                .stroke();

            // Inner border
            doc.rect(40, 40, 515, 762)
                .lineWidth(1)
                .strokeColor('#60a5fa')
                .stroke();

            // Logo placeholder (you can add actual logo)
            doc.fontSize(24)
                .fillColor('#1e40af')
                .font('Helvetica-Bold')
                .text('🌍 ImpactMint', 50, 60, { align: 'center' });

            // Title
            doc.fontSize(32)
                .fillColor('#1e40af')
                .font('Helvetica-Bold')
                .text('Certificate of', 50, 120, { align: 'center' })
                .text('Carbon Credit Retirement', 50, 160, { align: 'center' });

            // Decorative line
            doc.moveTo(150, 210)
                .lineTo(445, 210)
                .lineWidth(2)
                .strokeColor('#60a5fa')
                .stroke();

            // Certificate ID
            doc.fontSize(10)
                .fillColor('#6b7280')
                .font('Helvetica')
                .text(`Certificate ID: ${certificateId}`, 50, 230, { align: 'center' });

            // Main content
            const beneficiaryText = data.organization
                ? `${data.beneficiary} (${data.organization})`
                : data.beneficiary;

            doc.fontSize(14)
                .fillColor('#111827')
                .font('Helvetica')
                .text('This certifies that', 50, 280, { align: 'center' });

            doc.fontSize(20)
                .fillColor('#1e40af')
                .font('Helvetica-Bold')
                .text(beneficiaryText, 50, 310, { align: 'center', width: 495 });

            doc.fontSize(14)
                .fillColor('#111827')
                .font('Helvetica')
                .text('has permanently and irrevocably retired', 50, 360, { align: 'center' });

            doc.fontSize(28)
                .fillColor('#22c55e')
                .font('Helvetica-Bold')
                .text(`${data.tonsCO2.toFixed(2)} metric tons of CO₂`, 50, 390, {
                    align: 'center',
                });

            doc.fontSize(14)
                .fillColor('#111827')
                .font('Helvetica')
                .text('from the carbon offset project', 50, 440, { align: 'center' });

            doc.fontSize(16)
                .fillColor('#1e40af')
                .font('Helvetica-Bold')
                .text(data.projectName, 50, 470, { align: 'center', width: 495 });

            // Project details box
            doc.rect(100, 520, 395, 100)
                .fillColor('#e0f2fe')
                .fill();

            doc.fontSize(12)
                .fillColor('#111827')
                .font('Helvetica')
                .text(`Methodology: ${data.methodology}`, 120, 540)
                .text(`Vintage Year: ${data.vintage}`, 120, 565)
                .text(
                    `Retirement Date: ${data.retirementDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}`,
                    120,
                    590
                );

            // QR Code
            if (qrCodeDataUrl) {
                const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
                doc.image(qrBuffer, 247.5, 640, { width: 100, height: 100 });
            }

            doc.fontSize(10)
                .fillColor('#6b7280')
                .font('Helvetica')
                .text('Scan to verify on blockchain', 50, 750, { align: 'center' });

            // Footer
            doc.fontSize(8)
                .fillColor('#9ca3af')
                .font('Helvetica')
                .text(
                    `Hedera Transaction ID: ${data.burnTransactionId}`,
                    50,
                    780,
                    { align: 'center', width: 495 }
                )
                .text(`Digital Signature: ${digitalSignature.substring(0, 32)}...`, 50, 795, {
                    align: 'center',
                    width: 495,
                });

            // Finalize PDF
            doc.end();

            // Wait for PDF to be written
            await new Promise((resolve, reject) => {
                stream.on('finish', () => resolve(undefined));
                stream.on('error', reject);
            });

            logger.info('Retirement certificate generated', { certificateId });

            return {
                pdfPath,
                pngPath, // TODO: Convert PDF to PNG if needed
                certificateId,
                digitalSignature,
                verificationUrl,
            };
        } catch (error: any) {
            logger.error('Failed to generate retirement certificate:', error);
            throw new Error(`Certificate generation failed: ${error.message}`);
        }
    }

    /**
     * Generate certificate with custom branding
     */
    static async generateBrandedCertificate(
        data: CertificateData,
        _branding?: {
            logoPath?: string;
            primaryColor?: string;
            secondaryColor?: string;
        }
    ): Promise<any> {
        // TODO: Implement custom branding
        return this.generateCertificate(data);
    }

    /**
     * Get certificate file path
     */
    static getCertificatePath(certificateId: string, format: 'pdf' | 'png' = 'pdf'): string {
        return path.join(this.CERT_DIR, `${certificateId}.${format}`);
    }

    /**
     * Check if certificate exists
     */
    static certificateExists(certificateId: string): boolean {
        const pdfPath = this.getCertificatePath(certificateId, 'pdf');
        return fs.existsSync(pdfPath);
    }
}

export default RetirementCertificateGenerator;
