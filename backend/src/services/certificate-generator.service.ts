import { createCanvas, loadImage, registerFont } from 'canvas';
import QRCode from 'qrcode';
import logger from '../utils/logger';
import path from 'path';

export class CertificateGeneratorService {
    private static readonly CANVAS_WIDTH = 1200;
    private static readonly CANVAS_HEIGHT = 900;

    /**
     * Generate certificate image for carbon credit NFT
     */
    static async generateCertificate(params: {
        projectName: string;
        methodology: string;
        tonsCO2: number;
        vintage: number;
        location: string;
        verificationDate: Date;
        serialNumber: number;
        tokenId: string;
        transactionId?: string;
    }): Promise<Buffer> {
        try {
            const canvas = createCanvas(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            const ctx = canvas.getContext('2d');

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, this.CANVAS_HEIGHT);
            gradient.addColorStop(0, '#1a472a');
            gradient.addColorStop(1, '#2d5a3d');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

            // Border
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 8;
            ctx.strokeRect(40, 40, this.CANVAS_WIDTH - 80, this.CANVAS_HEIGHT - 80);

            // Title
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('CARBON CREDIT CERTIFICATE', this.CANVAS_WIDTH / 2, 140);

            // Subtitle
            ctx.font = '28px Arial';
            ctx.fillStyle = '#4ade80';
            ctx.fillText('Verified Carbon Offset', this.CANVAS_WIDTH / 2, 190);

            // Main content box
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(100, 240, this.CANVAS_WIDTH - 200, 400);

            // Project details
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Project:', 140, 300);
            ctx.font = '28px Arial';
            ctx.fillText(params.projectName, 140, 340);

            // CO2 Amount (highlighted)
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${params.tonsCO2} tCO₂`, this.CANVAS_WIDTH / 2, 420);

            // Details grid
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'left';

            const details = [
                { label: 'Methodology:', value: params.methodology },
                { label: 'Vintage:', value: params.vintage.toString() },
                { label: 'Location:', value: params.location },
                { label: 'Verified:', value: params.verificationDate.toLocaleDateString() },
                { label: 'Serial #:', value: params.serialNumber.toString() },
            ];

            let yPos = 480;
            details.forEach((detail) => {
                ctx.font = 'bold 22px Arial';
                ctx.fillText(detail.label, 140, yPos);
                ctx.font = '22px Arial';
                ctx.fillText(detail.value, 320, yPos);
                yPos += 35;
            });

            // QR Code
            if (params.transactionId) {
                const hashscanUrl = `https://hashscan.io/testnet/transaction/${params.transactionId}`;
                const qrCodeDataUrl = await QRCode.toDataURL(hashscanUrl, {
                    width: 180,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#ffffff',
                    },
                });

                const qrImage = await loadImage(qrCodeDataUrl);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(this.CANVAS_WIDTH - 280, 460, 200, 200);
                ctx.drawImage(qrImage, this.CANVAS_WIDTH - 270, 470, 180, 180);

                ctx.fillStyle = '#ffffff';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Verify on Hedera', this.CANVAS_WIDTH - 170, 685);
            }

            // Footer
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ImpactMint Carbon Credit Platform', this.CANVAS_WIDTH / 2, 760);

            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.fillText('Powered by Hedera Guardian', this.CANVAS_WIDTH / 2, 790);

            ctx.font = '14px Arial';
            ctx.fillStyle = '#a0a0a0';
            ctx.fillText(`Token ID: ${params.tokenId}`, this.CANVAS_WIDTH / 2, 820);

            // Watermark
            ctx.save();
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 120px Arial';
            ctx.textAlign = 'center';
            ctx.translate(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText('VERIFIED', 0, 0);
            ctx.restore();

            logger.info('Certificate generated', {
                projectName: params.projectName,
                serialNumber: params.serialNumber,
            });

            return canvas.toBuffer('image/png');
        } catch (error: any) {
            logger.error('Failed to generate certificate:', error);
            throw new Error(`Certificate generation failed: ${error.message}`);
        }
    }

    /**
     * Generate retirement certificate
     */
    static async generateRetirementCertificate(params: {
        projectName: string;
        tonsCO2: number;
        retiredBy: string;
        retirementDate: Date;
        originalSerialNumber: number;
        tokenId: string;
    }): Promise<Buffer> {
        try {
            const canvas = createCanvas(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            const ctx = canvas.getContext('2d');

            // Background gradient (different color for retirement)
            const gradient = ctx.createLinearGradient(0, 0, 0, this.CANVAS_HEIGHT);
            gradient.addColorStop(0, '#1e3a8a');
            gradient.addColorStop(1, '#3b82f6');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

            // Border
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 8;
            ctx.strokeRect(40, 40, this.CANVAS_WIDTH - 80, this.CANVAS_HEIGHT - 80);

            // Title
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('CARBON CREDIT RETIRED', this.CANVAS_WIDTH / 2, 140);

            // Subtitle
            ctx.font = '28px Arial';
            ctx.fillStyle = '#60a5fa';
            ctx.fillText('Permanent Carbon Offset', this.CANVAS_WIDTH / 2, 190);

            // Main content
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(100, 240, this.CANVAS_WIDTH - 200, 400);

            // CO2 Amount
            ctx.fillStyle = '#60a5fa';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${params.tonsCO2} tCO₂ RETIRED`, this.CANVAS_WIDTH / 2, 340);

            // Details
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'left';

            const details = [
                { label: 'Project:', value: params.projectName },
                { label: 'Retired By:', value: params.retiredBy },
                { label: 'Retirement Date:', value: params.retirementDate.toLocaleDateString() },
                { label: 'Original Serial:', value: params.originalSerialNumber.toString() },
                { label: 'Token ID:', value: params.tokenId },
            ];

            let yPos = 420;
            details.forEach((detail) => {
                ctx.font = 'bold 22px Arial';
                ctx.fillText(detail.label, 140, yPos);
                ctx.font = '22px Arial';
                ctx.fillText(detail.value, 320, yPos);
                yPos += 40;
            });

            // Footer
            ctx.fillStyle = '#60a5fa';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('This carbon credit has been permanently retired', this.CANVAS_WIDTH / 2, 720);

            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.fillText('ImpactMint Carbon Credit Platform', this.CANVAS_WIDTH / 2, 760);

            // Watermark
            ctx.save();
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 120px Arial';
            ctx.textAlign = 'center';
            ctx.translate(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText('RETIRED', 0, 0);
            ctx.restore();

            logger.info('Retirement certificate generated', {
                projectName: params.projectName,
                originalSerialNumber: params.originalSerialNumber,
            });

            return canvas.toBuffer('image/png');
        } catch (error: any) {
            logger.error('Failed to generate retirement certificate:', error);
            throw new Error(`Retirement certificate generation failed: ${error.message}`);
        }
    }
}

export default CertificateGeneratorService;
