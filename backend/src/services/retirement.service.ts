import { v4 as uuidv4 } from 'uuid';
import Retirement, { RetirementReason } from '../models/Retirement.model';
import RetirementCertificate from '../models/RetirementCertificate.model';
import NFT, { NFTStatus } from '../models/NFT.model';
import Project from '../models/Project.model';
import HederaTokenService from './hedera-token.service';
import RetirementCertificateGenerator from './retirement-certificate-generator.service';
import { PrivateKey } from '@hashgraph/sdk';
import logger from '../utils/logger';
import { NotFoundError, BadRequestError } from '../utils/errors';

interface RetireCreditsInput {
    nftId: string;
    userId: string;
    beneficiary: {
        name: string;
        organization?: string;
        email?: string;
    };
    reason: RetirementReason;
    publiclyVisible?: boolean;
}

export class RetirementService {
    /**
     * Retire a carbon credit NFT
     */
    static async retireCredit(input: RetireCreditsInput): Promise<any> {
        const { nftId, userId, beneficiary, reason, publiclyVisible = true } = input;

        try {
            // 1. Get NFT and validate
            const nft = await NFT.findById(nftId).populate('projectId');
            if (!nft) {
                throw new NotFoundError('NFT not found');
            }

            if (nft.status === NFTStatus.RETIRED) {
                throw new BadRequestError('NFT has already been retired');
            }

            if (nft.owner !== userId) {
                throw new BadRequestError('You do not own this NFT');
            }

            const project = await Project.findById(nft.projectId);
            if (!project) {
                throw new NotFoundError('Project not found');
            }

            // 2. Get tons CO2 from metadata
            const tonsCO2Attr = nft.metadata.attributes.find(
                (attr: any) => attr.trait_type === 'Tons CO2'
            );
            const tonsCO2 = tonsCO2Attr ? parseFloat(String(tonsCO2Attr.value)) : 1;

            // 3. Get vintage from metadata
            const vintageAttr = nft.metadata.attributes.find(
                (attr: any) => attr.trait_type === 'Vintage'
            );
            const vintage = vintageAttr ? parseInt(String(vintageAttr.value)) : new Date().getFullYear();

            // 4. Burn NFT on Hedera
            logger.info('Burning NFT on Hedera', {
                tokenId: nft.tokenId,
                serialNumber: nft.serialNumber,
            });

            // Get supply key from treasury
            const TreasuryAccount = require('../models/TreasuryAccount.model').default;
            const treasury = await TreasuryAccount.findOne({
                'tokenCollections.tokenId': nft.tokenId,
            });

            if (!treasury) {
                throw new NotFoundError('Treasury account not found for this token');
            }

            const supplyKey = PrivateKey.fromString(treasury.privateKey);

            const burnResult = await HederaTokenService.burnNFT({
                tokenId: nft.tokenId,
                serialNumber: nft.serialNumber,
                supplyKey,
            });

            logger.info('NFT burned successfully', {
                transactionId: burnResult.transactionId,
            });

            // 5. Generate certificate
            const certificateId = uuidv4();
            const retirementDate = new Date();

            const certificateData = {
                certificateId,
                projectName: project.name,
                methodology: project.methodology,
                tonsCO2,
                vintage,
                beneficiary: beneficiary.name,
                organization: beneficiary.organization,
                retirementDate,
                burnTransactionId: burnResult.transactionId,
            };

            const certificate = await RetirementCertificateGenerator.generateCertificate(
                certificateData
            );

            logger.info('Certificate generated', { certificateId });

            // 6. Create retirement record
            const retirementId = uuidv4();
            const retirement = await Retirement.create({
                retirementId,
                nftId: nft._id,
                tokenId: nft.tokenId,
                serialNumber: nft.serialNumber,
                projectId: project._id,
                retiredBy: userId,
                beneficiary,
                reason,
                tonsCO2,
                retiredAt: retirementDate,
                burnTransactionId: burnResult.transactionId,
                certificateId,
                certificatePdfUrl: `/certificates/${certificateId}.pdf`,
                verified: true,
                publiclyVisible,
            });

            // 7. Save certificate to database
            await RetirementCertificate.create({
                certificateId,
                retirementId: retirement._id,
                projectName: project.name,
                methodology: project.methodology,
                tonsCO2,
                vintage,
                beneficiary: beneficiary.name,
                retirementDate,
                qrCodeData: certificate.verificationUrl,
                digitalSignature: certificate.digitalSignature,
                verificationUrl: certificate.verificationUrl,
                pdfUrl: `/certificates/${certificateId}.pdf`,
                language: 'en',
            });

            // 8. Update NFT status
            nft.status = NFTStatus.RETIRED;
            nft.retiredAt = retirementDate;
            nft.retirementCertificateId = certificateId;
            await nft.save();

            // 9. Send notification (TODO: implement sendRetirementConfirmation)
            // const user = await require('../models/User.model').default.findById(userId);
            // if (user) {
            //     await NotificationService.sendRetirementConfirmation(
            //         user.email,
            //         beneficiary.name,
            //         tonsCO2,
            //         certificateId
            //     );
            // }

            // 10. Emit WebSocket event (TODO: implement emitCreditRetired)
            // WebSocketService.emitCreditRetired({
            //     retirementId,
            //     certificateId,
            //     tonsCO2,
            //     projectName: project.name,
            // });

            logger.info('Credit retirement completed', { retirementId, certificateId });

            return {
                retirement,
                certificate: {
                    certificateId,
                    pdfUrl: `/certificates/${certificateId}.pdf`,
                    verificationUrl: certificate.verificationUrl,
                },
            };
        } catch (error: any) {
            logger.error('Failed to retire credit:', error);
            throw error;
        }
    }

    /**
     * Bulk retire multiple credits
     */
    static async bulkRetireCredits(
        nftIds: string[],
        userId: string,
        beneficiary: any,
        reason: RetirementReason
    ): Promise<any[]> {
        const results = [];

        for (const nftId of nftIds) {
            try {
                const result = await this.retireCredit({
                    nftId,
                    userId,
                    beneficiary,
                    reason,
                });
                results.push({ success: true, nftId, ...result });
            } catch (error: any) {
                logger.error('Failed to retire NFT in bulk operation:', {
                    nftId,
                    error: error.message,
                });
                results.push({ success: false, nftId, error: error.message });
            }
        }

        return results;
    }

    /**
     * Get retirement history for a user
     */
    static async getRetirementHistory(
        userId: string,
        filters?: {
            startDate?: Date;
            endDate?: Date;
            projectId?: string;
            methodology?: string;
        }
    ): Promise<any[]> {
        const query: any = { retiredBy: userId };

        if (filters?.startDate || filters?.endDate) {
            query.retiredAt = {};
            if (filters.startDate) query.retiredAt.$gte = filters.startDate;
            if (filters.endDate) query.retiredAt.$lte = filters.endDate;
        }

        if (filters?.projectId) {
            query.projectId = filters.projectId;
        }

        const retirements = await Retirement.find(query)
            .populate('projectId')
            .populate('nftId')
            .sort({ retiredAt: -1 });

        return retirements;
    }

    /**
     * Verify certificate authenticity
     */
    static async verifyCertificate(certificateId: string): Promise<any> {
        const certificate = await RetirementCertificate.findOne({ certificateId }).populate({
            path: 'retirementId',
            populate: { path: 'projectId' },
        });

        if (!certificate) {
            throw new NotFoundError('Certificate not found');
        }

        const retirement: any = certificate.retirementId;

        // Verify on Hedera blockchain
        const HederaMirrorUtil = require('../utils/hedera-mirror.util').default;
        const txVerified = await HederaMirrorUtil.getTransaction(retirement.burnTransactionId);

        return {
            valid: true,
            certificate,
            retirement,
            blockchainProof: txVerified,
        };
    }

    /**
     * Get public retirement registry
     */
    static async getPublicRegistry(filters?: {
        limit?: number;
        offset?: number;
        methodology?: string;
    }): Promise<any> {
        const query: any = { publiclyVisible: true };

        if (filters?.methodology) {
            const projects = await Project.find({ methodology: filters.methodology }).select('_id');
            query.projectId = { $in: projects.map((p) => p._id) };
        }

        const limit = filters?.limit || 50;
        const offset = filters?.offset || 0;

        const retirements = await Retirement.find(query)
            .populate('projectId')
            .sort({ retiredAt: -1 })
            .limit(limit)
            .skip(offset);

        const total = await Retirement.countDocuments(query);

        return {
            retirements,
            total,
            limit,
            offset,
        };
    }

    /**
     * Get retirement statistics
     */
    static async getStatistics(userId?: string): Promise<any> {
        const query = userId ? { retiredBy: userId } : {};

        const totalRetirements = await Retirement.countDocuments(query);
        const totalTonsCO2 = await Retirement.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$tonsCO2' } } },
        ]);

        const byMethodology = await Retirement.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'projectId',
                    foreignField: '_id',
                    as: 'project',
                },
            },
            { $unwind: '$project' },
            {
                $group: {
                    _id: '$project.methodology',
                    count: { $sum: 1 },
                    tonsCO2: { $sum: '$tonsCO2' },
                },
            },
        ]);

        return {
            totalRetirements,
            totalTonsCO2: totalTonsCO2[0]?.total || 0,
            byMethodology,
        };
    }
}

export default RetirementService;
