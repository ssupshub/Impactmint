import { Request, Response, NextFunction } from 'express';
import GuardianService from '../services/guardian.service';
import GuardianWorkflow from '../models/GuardianWorkflow.model';
import ApiResponseUtil from '../utils/response';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export class GuardianController {
    /**
     * Get list of available Guardian policies
     */
    static async getPolicies(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const policies = await GuardianService.getPolicies();
            ApiResponseUtil.success(res, policies);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get specific policy details
     */
    static async getPolicyById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const policy = await GuardianService.getPolicyById(id);
            ApiResponseUtil.success(res, policy);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handle Guardian webhook events
     */
    static async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const signature = req.headers['x-guardian-signature'] as string;
            const payload = JSON.stringify(req.body);

            // Verify webhook signature
            if (!GuardianService.verifyWebhookSignature(payload, signature)) {
                logger.warn('Invalid Guardian webhook signature');
                return ApiResponseUtil.error(res, 'Invalid signature', 401);
            }

            const { event, data } = req.body;

            logger.info('Guardian webhook received', { event, projectId: data.projectId });

            // Process webhook event
            switch (event) {
                case 'project.status_changed':
                    await this.handleStatusChange(data);
                    break;
                case 'project.approved':
                    await this.handleApproval(data);
                    break;
                case 'project.minted':
                    await this.handleMintComplete(data);
                    break;
                case 'project.error':
                    await this.handleError(data);
                    break;
                default:
                    logger.warn('Unknown Guardian webhook event', { event });
            }

            ApiResponseUtil.success(res, { received: true });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handle status change event
     */
    private static async handleStatusChange(data: any): Promise<void> {
        const workflow = await GuardianWorkflow.findOne({ guardianProjectId: data.projectId });
        if (workflow) {
            (workflow as any).addStateTransition(data.status, data.message, data.metadata);
            await workflow.save();
        }
    }

    /**
     * Handle approval event
     */
    private static async handleApproval(data: any): Promise<void> {
        const workflow = await GuardianWorkflow.findOne({ guardianProjectId: data.projectId });
        if (workflow) {
            (workflow as any).addStateTransition('auditor_approved', 'Project approved by auditor', data);
            await workflow.save();
        }
    }

    /**
     * Handle minting complete event
     */
    private static async handleMintComplete(data: any): Promise<void> {
        const workflow = await GuardianWorkflow.findOne({ guardianProjectId: data.projectId });
        if (workflow) {
            (workflow as any).addStateTransition('complete', 'NFT minting completed', {
                tokenId: data.tokenId,
                amount: data.amount,
                transactionId: data.transactionId,
            });
            await workflow.save();
        }
    }

    /**
     * Handle error event
     */
    private static async handleError(data: any): Promise<void> {
        const workflow = await GuardianWorkflow.findOne({ guardianProjectId: data.projectId });
        if (workflow) {
            (workflow as any).addErrorLog(data.error, data.stackTrace);
            (workflow as any).addStateTransition('failed', data.error);
            await workflow.save();
        }
    }

    /**
     * Get document from IPFS
     */
    static async getDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { hash } = req.params;
            const document = await GuardianService.getDocumentByHash(hash);

            res.setHeader('Content-Type', 'application/octet-stream');
            res.send(document);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get detailed Guardian status for a project
     */
    static async getProjectStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { projectId } = req.params;

            const workflow = await GuardianWorkflow.findOne({ projectId });

            if (!workflow) {
                throw new NotFoundError('Guardian workflow not found for this project');
            }

            ApiResponseUtil.success(res, {
                currentStatus: workflow.currentStatus,
                guardianProjectId: workflow.guardianProjectId,
                guardianDID: workflow.guardianDID,
                stateHistory: workflow.stateHistory,
                errorLogs: workflow.errorLogs,
                lastSyncedAt: workflow.lastSyncedAt,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default GuardianController;
