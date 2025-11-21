import { Request, Response, NextFunction } from 'express';
import HederaTokenService from '../services/hedera-token.service';
import IPFSService from '../services/ipfs.service';
import CertificateGeneratorService from '../services/certificate-generator.service';
import NFT, { NFTStatus } from '../models/NFT.model';
import NFTTransfer from '../models/NFTTransfer.model';
import TreasuryAccount from '../models/TreasuryAccount.model';
import Project from '../models/Project.model';
import ApiResponseUtil from '../utils/response';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { UserRole } from '../types';
import { PrivateKey } from '@hashgraph/sdk';
import logger from '../utils/logger';

export class NFTController {
    /**
     * Create NFT collection
     */
    static async createCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, symbol, methodology, royaltyFee, fallbackFee } = req.body;

            // Get or create treasury account
            let treasury = await TreasuryAccount.findOne({ methodology });
            if (!treasury) {
                throw new BadRequestError('Treasury account not configured for this methodology');
            }

            const supplyKey = PrivateKey.fromString(treasury.privateKey);

            // Create NFT collection on Hedera
            const result = await HederaTokenService.createNFTCollection({
                name,
                symbol,
                treasuryAccountId: treasury.accountId,
                supplyKey,
                royaltyFee,
                fallbackFee,
            });

            // Update treasury with new collection
            (treasury as any).addTokenCollection(result.tokenId, name, symbol);
            await treasury.save();

            ApiResponseUtil.created(res, {
                tokenId: result.tokenId,
                transactionId: result.transactionId,
                treasuryAccountId: treasury.accountId,
            }, 'NFT collection created successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mint single NFT
     */
    static async mintNFT(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { projectId, tonsCO2 } = req.body;

            const project = await Project.findById(projectId);
            if (!project) {
                throw new NotFoundError('Project not found');
            }

            // Get treasury and token collection
            const treasury = await TreasuryAccount.findOne({});
            if (!treasury || treasury.tokenCollections.length === 0) {
                throw new BadRequestError('No NFT collection configured');
            }

            const tokenCollection = treasury.tokenCollections[0];
            const supplyKey = PrivateKey.fromString(treasury.privateKey);

            // Generate certificate image
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

            // Upload certificate to IPFS
            const certificateUpload = await IPFSService.uploadImage(
                certificateBuffer,
                `certificate-${projectId}-${Date.now()}.png`
            );

            // Generate metadata
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

            // Upload metadata to IPFS
            const metadataUpload = await IPFSService.uploadMetadata(metadata);

            // Mint NFT on Hedera
            const mintResult = await HederaTokenService.mintNFT({
                tokenId: tokenCollection.tokenId,
                supplyKey,
                metadata: IPFSService.hashToBytes(metadataUpload.ipfsHash),
            });

            // Save NFT to database
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

            // Update treasury mint count
            (treasury as any).incrementMintCount(tokenCollection.tokenId, 1);
            await treasury.save();

            logger.info('NFT minted successfully', {
                nftId: nft._id,
                tokenId: tokenCollection.tokenId,
                serialNumber: mintResult.serialNumber,
            });

            ApiResponseUtil.created(res, {
                nft,
                transactionId: mintResult.transactionId,
                certificateUrl: certificateUpload.url,
                metadataUrl: metadataUpload.url,
            }, 'NFT minted successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Transfer NFT
     */
    static async transferNFT(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { nftId, toAccountId, reason, price } = req.body;

            const nft = await NFT.findById(nftId);
            if (!nft) {
                throw new NotFoundError('NFT not found');
            }

            if (nft.status === NFTStatus.RETIRED) {
                throw new BadRequestError('Cannot transfer retired NFT');
            }

            // Get treasury (current owner)
            const treasury = await TreasuryAccount.findOne({ accountId: nft.owner });
            if (!treasury) {
                throw new NotFoundError('Treasury account not found');
            }

            const fromPrivateKey = PrivateKey.fromString(treasury.privateKey);

            // Transfer on Hedera
            const transferResult = await HederaTokenService.transferNFT({
                tokenId: nft.tokenId,
                serialNumber: nft.serialNumber,
                fromAccountId: nft.owner,
                toAccountId,
                fromPrivateKey,
            });

            // Record transfer in database
            await NFTTransfer.create({
                nftId: nft._id,
                tokenId: nft.tokenId,
                serialNumber: nft.serialNumber,
                from: nft.owner,
                to: toAccountId,
                transactionId: transferResult.transactionId,
                transferredAt: new Date(),
                reason: reason || 'other',
                price,
            });

            // Update NFT owner
            nft.owner = toAccountId;
            nft.status = NFTStatus.TRANSFERRED;
            await nft.save();

            ApiResponseUtil.success(res, {
                nft,
                transactionId: transferResult.transactionId,
            }, 'NFT transferred successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retire (burn) NFT
     */
    static async retireNFT(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { nftId, retiredBy } = req.body;

            const nft = await NFT.findById(nftId);
            if (!nft) {
                throw new NotFoundError('NFT not found');
            }

            if (nft.status === NFTStatus.RETIRED) {
                throw new BadRequestError('NFT already retired');
            }

            const project = await Project.findById(nft.projectId);
            if (!project) {
                throw new NotFoundError('Project not found');
            }

            // Get treasury
            const treasury = await TreasuryAccount.findOne({});
            if (!treasury) {
                throw new NotFoundError('Treasury account not found');
            }

            const supplyKey = PrivateKey.fromString(treasury.privateKey);

            // Burn NFT on Hedera
            const burnResult = await HederaTokenService.burnNFT({
                tokenId: nft.tokenId,
                serialNumber: nft.serialNumber,
                supplyKey,
            });

            // Generate retirement certificate
            const retirementCertBuffer = await CertificateGeneratorService.generateRetirementCertificate({
                projectName: project.name,
                tonsCO2: nft.metadata.attributes.find((a) => a.trait_type === 'Tons CO2')?.value as number || 1,
                retiredBy,
                retirementDate: new Date(),
                originalSerialNumber: nft.serialNumber,
                tokenId: nft.tokenId,
            });

            // Upload retirement certificate to IPFS
            const retirementUpload = await IPFSService.uploadImage(
                retirementCertBuffer,
                `retirement-${nftId}-${Date.now()}.png`
            );

            // Update NFT status
            nft.status = NFTStatus.RETIRED;
            nft.retiredAt = new Date();
            nft.retirementCertificateId = retirementUpload.ipfsHash;
            await nft.save();

            // Record transfer to burn address
            await NFTTransfer.create({
                nftId: nft._id,
                tokenId: nft.tokenId,
                serialNumber: nft.serialNumber,
                from: nft.owner,
                to: '0.0.0',
                transactionId: burnResult.transactionId,
                transferredAt: new Date(),
                reason: 'retirement',
            });

            ApiResponseUtil.success(res, {
                nft,
                transactionId: burnResult.transactionId,
                retirementCertificateUrl: retirementUpload.url,
            }, 'NFT retired successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get NFT details
     */
    static async getNFT(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tokenId, serialNumber } = req.params;

            const nft = await NFT.findOne({
                tokenId,
                serialNumber: parseInt(serialNumber),
            }).populate('projectId');

            if (!nft) {
                throw new NotFoundError('NFT not found');
            }

            // Get transfer history
            const transfers = await NFTTransfer.find({ nftId: nft._id }).sort({ transferredAt: -1 });

            ApiResponseUtil.success(res, {
                nft,
                transfers,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get NFTs by project
     */
    static async getNFTsByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { projectId } = req.params;

            const nfts = await NFT.find({ projectId }).sort({ mintedAt: -1 });

            const stats = {
                total: nfts.length,
                active: nfts.filter((n) => n.status === NFTStatus.ACTIVE).length,
                transferred: nfts.filter((n) => n.status === NFTStatus.TRANSFERRED).length,
                retired: nfts.filter((n) => n.status === NFTStatus.RETIRED).length,
                totalCO2: nfts.reduce((sum, n) => {
                    const co2 = n.metadata.attributes.find((a) => a.trait_type === 'Tons CO2')?.value as number || 0;
                    return sum + co2;
                }, 0),
            };

            ApiResponseUtil.success(res, { nfts, stats });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get NFT analytics
     */
    static async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const totalNFTs = await NFT.countDocuments();
            const activeNFTs = await NFT.countDocuments({ status: NFTStatus.ACTIVE });
            const retiredNFTs = await NFT.countDocuments({ status: NFTStatus.RETIRED });

            const allNFTs = await NFT.find();
            const totalCO2 = allNFTs.reduce((sum, nft) => {
                const co2 = nft.metadata.attributes.find((a) => a.trait_type === 'Tons CO2')?.value as number || 0;
                return sum + co2;
            }, 0);

            const retiredCO2 = allNFTs
                .filter((n) => n.status === NFTStatus.RETIRED)
                .reduce((sum, nft) => {
                    const co2 = nft.metadata.attributes.find((a) => a.trait_type === 'Tons CO2')?.value as number || 0;
                    return sum + co2;
                }, 0);

            ApiResponseUtil.success(res, {
                totalNFTs,
                activeNFTs,
                retiredNFTs,
                totalCO2,
                retiredCO2,
                activeCO2: totalCO2 - retiredCO2,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default NFTController;
