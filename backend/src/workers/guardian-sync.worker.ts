import GuardianWorkflow from '../models/GuardianWorkflow.model';
import GuardianService from '../services/guardian.service';
import WebSocketService from '../services/websocket.service';
import NotificationService from '../services/notification.service';
import Project from '../models/Project.model';
import User from '../models/User.model';
import logger from '../utils/logger';
import { GuardianWorkflowStatus } from '../types';

export class GuardianSyncWorker {
    private static isRunning = false;
    private static intervalId: NodeJS.Timeout | null = null;
    private static readonly SYNC_INTERVAL = parseInt(process.env.GUARDIAN_SYNC_INTERVAL || '30000'); // 30 seconds

    /**
     * Start the Guardian sync worker
     */
    static start(): void {
        if (this.isRunning) {
            logger.warn('Guardian sync worker is already running');
            return;
        }

        this.isRunning = true;
        logger.info('Starting Guardian sync worker', { interval: this.SYNC_INTERVAL });

        // Run immediately on start
        this.sync();

        // Then run on interval
        this.intervalId = setInterval(() => {
            this.sync();
        }, this.SYNC_INTERVAL);
    }

    /**
     * Stop the Guardian sync worker
     */
    static stop(): void {
        if (!this.isRunning) {
            return;
        }

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isRunning = false;
        logger.info('Guardian sync worker stopped');
    }

    /**
     * Sync Guardian workflow states
     */
    private static async sync(): Promise<void> {
        try {
            // Find all active Guardian workflows (not complete or failed)
            const activeWorkflows = await GuardianWorkflow.find({
                currentStatus: {
                    $nin: [GuardianWorkflowStatus.COMPLETE, GuardianWorkflowStatus.FAILED],
                },
            }).limit(50);

            logger.debug(`Syncing ${activeWorkflows.length} active Guardian workflows`);

            for (const workflow of activeWorkflows) {
                try {
                    await this.syncWorkflow(workflow);
                } catch (error: any) {
                    logger.error('Failed to sync Guardian workflow:', {
                        workflowId: workflow._id,
                        error: error.message,
                    });

                    // Add error log
                    (workflow as any).addErrorLog(error.message, error.stack);
                    await workflow.save();
                }
            }
        } catch (error: any) {
            logger.error('Guardian sync worker error:', error);
        }
    }

    /**
     * Sync individual workflow
     */
    private static async syncWorkflow(workflow: any): Promise<void> {
        if (!workflow.guardianProjectId || !workflow.policyId) {
            logger.warn('Workflow missing Guardian project ID or policy ID', { workflowId: workflow._id });
            return;
        }

        // Get current status from Guardian
        const guardianStatus = await GuardianService.getProjectStatus(
            workflow.policyId,
            workflow.guardianProjectId
        );

        // Check if status has changed
        if (guardianStatus.status !== workflow.currentStatus) {
            logger.info('Guardian workflow status changed', {
                workflowId: workflow._id,
                oldStatus: workflow.currentStatus,
                newStatus: guardianStatus.status,
            });

            // Update workflow state
            workflow.addStateTransition(guardianStatus.status, 'Status updated from Guardian', {
                currentStep: guardianStatus.currentStep,
                pendingActions: guardianStatus.pendingActions,
            });

            await workflow.save();

            // Get project and owner details
            const project = await Project.findById(workflow.projectId);
            if (!project) return;

            const owner = await User.findById(project.owner);
            if (!owner) return;

            // Send notifications based on status
            await this.handleStatusChange(workflow, project, owner, guardianStatus.status);

            // Emit WebSocket event
            WebSocketService.emitGuardianStatusChange(
                workflow.projectId,
                guardianStatus.status,
                {
                    currentStep: guardianStatus.currentStep,
                    pendingActions: guardianStatus.pendingActions,
                }
            );
        }
    }

    /**
     * Handle status change notifications
     */
    private static async handleStatusChange(
        workflow: any,
        project: any,
        owner: any,
        newStatus: GuardianWorkflowStatus
    ): Promise<void> {
        switch (newStatus) {
            case GuardianWorkflowStatus.PENDING_AUDITOR:
                // Notify assigned auditors
                for (const auditorId of project.assignedAuditors) {
                    const auditor = await User.findById(auditorId);
                    if (auditor) {
                        await NotificationService.sendAuditorAssignmentNotification(
                            auditor.email,
                            project.name,
                            project._id.toString()
                        );
                    }
                }
                break;

            case GuardianWorkflowStatus.AUDITOR_APPROVED:
                await NotificationService.sendApprovalNotification(
                    owner.email,
                    project.name,
                    project._id.toString()
                );
                break;

            case GuardianWorkflowStatus.COMPLETE:
                // Get minting details from workflow metadata
                const mintingData = workflow.stateHistory.find(
                    (h: any) => h.status === GuardianWorkflowStatus.COMPLETE
                )?.metadata;

                if (mintingData) {
                    await NotificationService.sendMintingCompleteNotification(
                        owner.email,
                        project.name,
                        project._id.toString(),
                        mintingData.amount,
                        mintingData.tokenId
                    );
                }
                break;

            case GuardianWorkflowStatus.REJECTED:
                const rejectionData = workflow.stateHistory.find(
                    (h: any) => h.status === GuardianWorkflowStatus.REJECTED
                );

                await NotificationService.sendRejectionNotification(
                    owner.email,
                    project.name,
                    project._id.toString(),
                    rejectionData?.message || 'Project did not meet verification requirements'
                );
                break;
        }
    }
}

export default GuardianSyncWorker;
