import GuardianWorkflow from '../models/GuardianWorkflow.model';
import Project from '../models/Project.model';
import TreasuryAccount from '../models/TreasuryAccount.model';
import HederaTokenService from '../services/hedera-token.service';
import IPFSService from '../services/ipfs.service';
import CertificateGeneratorService from '../services/certificate-generator.service';
import NotificationService from '../services/notification.service';
import WebSocketService from '../services/websocket.service';
import NFT, { NFTStatus } from '../models/NFT.model';
import { GuardianWorkflowStatus } from '../types';
import { PrivateKey } from '@hashgraph/sdk';
import logger from '../utils/logger';

export class NFTMintingWorker {
    private static isRunning = false;
    private static intervalId: NodeJS.Timeout | null = null;
    private static readonly CHECK_INTERVAL = parseInt(process.env.NFT_MINTING_INTERVAL || '60000'); // 1 minute

    /**
     * Start the NFT minting worker
     */
    static start(): void {
        if (this.isRunning) {
            logger.warn('NFT minting worker is already running');
            return;
        }

        this.isRunning = true;
        logger.info('Starting NFT minting worker', { interval: this.CHECK_INTERVAL });

        // Run immediately on start
        this.processQueue();

        // Then run on interval
        this.intervalId = setInterval(() => {
            this.processQueue();
        }, this.CHECK_INTERVAL);
    }

    /**
     * Stop the NFT minting worker
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
        logger.info('NFT minting worker stopped');
    }

    /**
     * Process minting queue
     */
    private static async processQueue(): Promise<void> {
        try {
            // Find approved Guardian workflows without NFTs
            const approvedWorkflows = await GuardianWorkflow.find({
                currentStatus: GuardianWorkflowStatus.AUDITOR_APPROVED,
            }).limit(10);

            logger.debug(`Processing ${approvedWorkflows.length} approved projects for minting`);

            for (const workflow of approvedWorkflows) {
                try {
                    // Check if NFT already minted
                    const existingNFT = await NFT.findOne({ projectId: workflow.projectId });
                    if (existingNFT) {
                        logger.debug('NFT already minted for project', { projectId: workflow.projectId });
                        continue;
                    }

                    await this.mintForProject(workflow.projectId);
                } catch (error: any) {
                    logger.error('Failed to mint NFT for project:', {
                        projectId: workflow.projectId,
                        error: error.message,
                    });
                }
            }
        } catch (error: any) {
            logger.error('NFT minting worker error:', error);
        }
    }

    /**
     * Mint NFT for approved project
     */
    private static async mintForProject(projectId: string): Promise<void> {
        const project = await Project.findById(projectId);
        if (!project) {
            logger.warn('Project not found', { projectId });
            return;
        }

        // Get treasury and token collection
        const treasury = await TreasuryAccount.findOne({});
        if (!treasury || treasury.tokenCollections.length === 0) {
            logger.error('No NFT collection configured');
            return;
        }

        const tokenCollection = treasury.tokenCollections[0];
        const supplyKey = PrivateKey.fromString(treasury.privateKey);

        // Calculate CO2 credits (this should come from MRV data)
        const tonsCO2 = project.verifiedCapacity || project.capacity || 1;

        logger.info('Starting NFT minting process', {
            projectId,
            projectName: project.name,
            tonsCO2,
        });

        // Step 1: Generate certificate image
        const certificateBuffer = await CertificateGeneratorService.generateCertificate({
            projectName: project.name,
            methodology: project.methodology,
            tonsCO2,
            vintage: new Date().getFullYear(),
            location: `${project.location.region}, ${project.location.country}`,
            verificationDate: new Date(),
            serialNumber: tokenCollection.totalMinted + 1,
            tokenId: tokenCollection.tokenId,
        });

        // Step 2: Upload certificate to IPFS
        const certificateUpload = await IPFSService.uploadImage(
            certificateBuffer,
            `certificate-${projectId}-${Date.now()}.png`
        );

        logger.info('Certificate uploaded to IPFS', {
            projectId,
            ipfsHash: certificateUpload.ipfsHash,
        });

        // Step 3: Generate metadata
        const metadata = IPFSService.generateMetadata({
            projectId: project._id.toString(),
            projectName: project.name,
            methodology: project.methodology,
            tonsCO2,
            vintage: new Date().getFullYear(),
            location: `${project.location.region}, ${project.location.country}`,
            verificationDate: new Date(),
            verifier: 'Guardian Auditor Pool',
            certificateImageHash: certificateUpload.ipfsHash,
            guardianPolicyId: project.guardianPolicyId,
        });

        // Step 4: Upload metadata to IPFS
        const metadataUpload = await IPFSService.uploadMetadata(metadata);

        logger.info('Metadata uploaded to IPFS', {
            projectId,
            ipfsHash: metadataUpload.ipfsHash,
        });

        // Step 5: Mint NFT on Hedera
        const mintResult = await HederaTokenService.mintNFT({
            tokenId: tokenCollection.tokenId,
            supplyKey,
            metadata: IPFSService.hashToBytes(metadataUpload.ipfsHash),
        });

        logger.info('NFT minted on Hedera', {
            projectId,
            tokenId: tokenCollection.tokenId,
            serialNumber: mintResult.serialNumber,
            transactionId: mintResult.transactionId,
        });

        // Step 6: Save NFT to database
        const nft = await NFT.create({
            tokenId: tokenCollection.tokenId,
            serialNumber: mintResult.serialNumber,
            projectId: project._id,
            owner: treasury.accountId,
            metadata,
            ipfsHash: metadataUpload.ipfsHash,
            certificateImageHash: certificateUpload.ipfsHash,
            status: NFTStatus.ACTIVE,
            mintTransactionId: mintResult.transactionId,
            mintedAt: new Date(),
        });

        // Step 7: Update treasury mint count
        (treasury as any).incrementMintCount(tokenCollection.tokenId, 1);
        await treasury.save();

        // Step 8: Update Guardian workflow status
        const workflow = await GuardianWorkflow.findOne({ projectId });
        if (workflow) {
            (workflow as any).addStateTransition(
                GuardianWorkflowStatus.MINTING,
                'NFT minting completed',
                {
                    tokenId: tokenCollection.tokenId,
                    serialNumber: mintResult.serialNumber,
                    transactionId: mintResult.transactionId,
                }
            );
            await workflow.save();
        }

        // Step 9: Send notification
        const owner = await require('../models/User.model').default.findById(project.owner);
        if (owner) {
            await NotificationService.sendMintingCompleteNotification(
                owner.email,
                project.name,
                project._id.toString(),
                tonsCO2,
                tokenCollection.tokenId
            );
        }

        // Step 10: Emit WebSocket event
        WebSocketService.emitMintingProgress(project._id.toString(), {
            status: 'complete',
            tokenId: tokenCollection.tokenId,
            serialNumber: mintResult.serialNumber,
            transactionId: mintResult.transactionId,
            certificateUrl: certificateUpload.url,
            metadataUrl: metadataUpload.url,
        });

        logger.info('NFT minting process completed successfully', {
            projectId,
            nftId: nft._id,
            tokenId: tokenCollection.tokenId,
            serialNumber: mintResult.serialNumber,
        });
    }
}

export default NFTMintingWorker;
