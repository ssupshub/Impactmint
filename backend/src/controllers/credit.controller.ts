import { Request, Response, NextFunction } from 'express';
import Credit from '../models/Credit.model';
import Project from '../models/Project.model';
import TokenService from '../services/token.service';
import TransactionService from '../services/transaction.service';
import ApiResponseUtil from '../utils/response';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { CreditStatus, ProjectStatus, TransactionType, UserRole } from '../types';

export class CreditController {
  // Mint new NFT credits
  static async mint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId, quantity, metadata } = req.body;

      // Verify project exists and is approved
      const project = await Project.findById(projectId);

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      // Check if user is project owner or admin
      if (project.owner !== req.user?._id && req.user?.role !== UserRole.ADMIN) {
        throw new ForbiddenError('You do not have permission to mint credits for this project');
      }

      // Verify project is approved or active
      if (![ProjectStatus.APPROVED, ProjectStatus.ACTIVE].includes(project.status)) {
        throw new BadRequestError('Only approved or active projects can mint credits');
      }

      // TODO: In production, get these from user's profile or environment
      const tokenId = process.env.DEFAULT_TOKEN_ID || '0.0.123456';
      const supplyKey = process.env.HEDERA_OPERATOR_KEY || '';

      // Mint NFTs on Hedera
      const metadataStrings = Array(quantity).fill(JSON.stringify(metadata));
      const mintResult = await TokenService.mintNFT({
        tokenId,
        metadata: metadataStrings,
        supplyKey,
      });

      // Create transaction record
      const transaction = await TransactionService.createTransaction({
        userId: req.user!._id,
        hederaTransactionId: mintResult.transactionId,
        type: TransactionType.MINT,
        projectId,
        to: req.user!._id,
      });

      // Create credit records for each serial number
      const credits = await Promise.all(
        mintResult.serialNumbers.map((serialNumber) =>
          Credit.create({
            projectId,
            tokenId,
            serialNumber,
            owner: req.user!._id,
            quantity: 1, // Each NFT represents 1 metric ton
            status: CreditStatus.ACTIVE,
            mintTransactionId: mintResult.transactionId,
            metadata,
          })
        )
      );

      ApiResponseUtil.created(res, { credits, transaction }, 'Credits minted successfully');
    } catch (error) {
      next(error);
    }
  }

  // List credits with filters
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sort = (req.query.sort as string) || 'createdAt';
      const order = (req.query.order as string) === 'asc' ? 1 : -1;
      const status = req.query.status as string;
      const owner = req.query.owner as string;
      const projectId = req.query.projectId as string;
      const vintage = req.query.vintage as string;

      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      if (status) filter.status = status;
      if (owner) filter.owner = owner;
      if (projectId) filter.projectId = projectId;
      if (vintage) filter['metadata.vintage'] = parseInt(vintage);

      // Get credits with pagination
      const [credits, total] = await Promise.all([
        Credit.find(filter)
          .populate('owner', 'firstName lastName email hederaAccountId')
          .populate('projectId', 'name location methodology')
          .sort({ [sort]: order })
          .skip(skip)
          .limit(limit),
        Credit.countDocuments(filter),
      ]);

      ApiResponseUtil.success(res, {
        credits,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get credit by ID
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const credit = await Credit.findById(id)
        .populate('owner', 'firstName lastName email hederaAccountId')
        .populate('projectId', 'name description location methodology capacity');

      if (!credit) {
        throw new NotFoundError('Credit not found');
      }

      ApiResponseUtil.success(res, credit);
    } catch (error) {
      next(error);
    }
  }

  // Retire credits (burn NFT)
  static async retire(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const credit = await Credit.findById(id);

      if (!credit) {
        throw new NotFoundError('Credit not found');
      }

      // Check ownership or admin
      if (credit.owner !== req.user?._id && req.user?.role !== UserRole.ADMIN) {
        throw new ForbiddenError('You do not have permission to retire these credits');
      }

      // Verify credit is active
      if (credit.status !== CreditStatus.ACTIVE) {
        throw new BadRequestError('Only active credits can be retired');
      }

      // Verify quantity
      const retireQuantity = quantity || credit.quantity;
      if (retireQuantity > credit.quantity) {
        throw new BadRequestError('Cannot retire more credits than available');
      }

      // TODO: In production, get supply key from secure storage
      const supplyKey = process.env.HEDERA_OPERATOR_KEY || '';

      // Burn NFT on Hedera
      const burnResult = await TokenService.burnNFT({
        tokenId: credit.tokenId,
        serialNumbers: [credit.serialNumber],
        supplyKey,
      });

      // Update credit status
      credit.status = CreditStatus.RETIRED;
      credit.retireTransactionId = burnResult.transactionId;
      await credit.save();

      // Create transaction record
      const transaction = await TransactionService.createTransaction({
        userId: req.user!._id,
        hederaTransactionId: burnResult.transactionId,
        type: TransactionType.RETIRE,
        creditId: credit._id.toString(),
        from: req.user!._id,
      });

      ApiResponseUtil.success(
        res,
        { credit, transaction },
        'Credit retired successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

export default CreditController;
