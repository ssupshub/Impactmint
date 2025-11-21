import nodemailer from 'nodemailer';
import config from '../config/env';
import logger from '../utils/logger';

export class NotificationService {
    private static transporter: nodemailer.Transporter;

    /**
     * Initialize email transporter
     */
    static initialize(): void {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        logger.info('Notification service initialized');
    }

    /**
     * Send project submitted notification
     */
    static async sendProjectSubmittedNotification(
        userEmail: string,
        projectName: string,
        projectId: string
    ): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@impactmint.io',
                to: userEmail,
                subject: 'Project Submitted for Verification',
                html: `
          <h2>Project Submitted Successfully</h2>
          <p>Your project "${projectName}" has been submitted to Guardian for verification.</p>
          <p>Project ID: ${projectId}</p>
          <p>You will receive updates as your project progresses through the verification workflow.</p>
          <p><a href="${config.frontendUrl}/projects/${projectId}">View Project</a></p>
        `,
            });

            logger.info('Project submitted notification sent', { userEmail, projectId });
        } catch (error: any) {
            logger.error('Failed to send project submitted notification:', error);
        }
    }

    /**
     * Send auditor assignment notification
     */
    static async sendAuditorAssignmentNotification(
        auditorEmail: string,
        projectName: string,
        projectId: string
    ): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@impactmint.io',
                to: auditorEmail,
                subject: 'New Project Assigned for Audit',
                html: `
          <h2>New Audit Assignment</h2>
          <p>You have been assigned to audit the project "${projectName}".</p>
          <p>Project ID: ${projectId}</p>
          <p>Please review the project details and MRV data at your earliest convenience.</p>
          <p><a href="${config.frontendUrl}/auditor/projects/${projectId}">Review Project</a></p>
        `,
            });

            logger.info('Auditor assignment notification sent', { auditorEmail, projectId });
        } catch (error: any) {
            logger.error('Failed to send auditor assignment notification:', error);
        }
    }

    /**
     * Send approval notification
     */
    static async sendApprovalNotification(
        userEmail: string,
        projectName: string,
        projectId: string
    ): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@impactmint.io',
                to: userEmail,
                subject: 'Project Approved',
                html: `
          <h2>Project Approved!</h2>
          <p>Congratulations! Your project "${projectName}" has been approved by the auditor.</p>
          <p>Project ID: ${projectId}</p>
          <p>Carbon credit NFTs will be minted shortly.</p>
          <p><a href="${config.frontendUrl}/projects/${projectId}">View Project</a></p>
        `,
            });

            logger.info('Approval notification sent', { userEmail, projectId });
        } catch (error: any) {
            logger.error('Failed to send approval notification:', error);
        }
    }

    /**
     * Send minting complete notification
     */
    static async sendMintingCompleteNotification(
        userEmail: string,
        projectName: string,
        projectId: string,
        amount: number,
        tokenId: string
    ): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@impactmint.io',
                to: userEmail,
                subject: 'Carbon Credits Minted',
                html: `
          <h2>Carbon Credits Minted Successfully!</h2>
          <p>Your carbon credits for project "${projectName}" have been minted.</p>
          <p>Amount: ${amount} tCO2</p>
          <p>Token ID: ${tokenId}</p>
          <p>Project ID: ${projectId}</p>
          <p><a href="${config.frontendUrl}/projects/${projectId}">View Project</a></p>
          <p><a href="https://hashscan.io/testnet/token/${tokenId}">View on HashScan</a></p>
        `,
            });

            logger.info('Minting complete notification sent', { userEmail, projectId, amount });
        } catch (error: any) {
            logger.error('Failed to send minting complete notification:', error);
        }
    }

    /**
     * Send rejection notification
     */
    static async sendRejectionNotification(
        userEmail: string,
        projectName: string,
        projectId: string,
        reason: string
    ): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@impactmint.io',
                to: userEmail,
                subject: 'Project Verification Update',
                html: `
          <h2>Project Verification Update</h2>
          <p>Your project "${projectName}" requires additional attention.</p>
          <p>Project ID: ${projectId}</p>
          <p>Reason: ${reason}</p>
          <p>Please review the feedback and make necessary updates.</p>
          <p><a href="${config.frontendUrl}/projects/${projectId}">View Project</a></p>
        `,
            });

            logger.info('Rejection notification sent', { userEmail, projectId });
        } catch (error: any) {
            logger.error('Failed to send rejection notification:', error);
        }
    }
}

export default NotificationService;
