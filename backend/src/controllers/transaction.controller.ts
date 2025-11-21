import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction.model';
import ApiResponseUtil from '../utils/response';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { UserRole } from '../types';

export class TransactionController {
  // List user transactions with pagination
  static async listTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sort = (req.query.sort as string) || 'createdAt';
      const order = (req.query.order as string) === 'asc' ? 1 : -1;
      const type = req.query.type as string;
      const status = req.query.status as string;
      const userId = req.query.userId as string;

      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      // Admin can see all transactions, others only their own
      if (req.user?.role === UserRole.ADMIN && userId) {
        filter.userId = userId;
      } else {
        filter.userId = req.user?._id;
      }

      if (type) filter.type = type;
      if (status) filter.status = status;

      // Get transactions with pagination
      const [transactions, total] = await Promise.all([
        Transaction.find(filter)
          .populate('userId', 'firstName lastName email')
          .populate('creditId', 'tokenId serialNumber')
          .populate('projectId', 'name')
          .sort({ [sort]: order })
          .skip(skip)
          .limit(limit),
        Transaction.countDocuments(filter),
      ]);

      ApiResponseUtil.success(res, {
        transactions,
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

  // Get transaction by ID
  static async getTransactionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findById(id)
        .populate('userId', 'firstName lastName email hederaAccountId')
        .populate('creditId', 'tokenId serialNumber metadata')
        .populate('projectId', 'name description');

      if (!transaction) {
        throw new NotFoundError('Transaction not found');
      }

      // Check if user has permission to view this transaction
      if (
        transaction.userId !== req.user?._id &&
        req.user?.role !== UserRole.ADMIN
      ) {
        throw new ForbiddenError('You do not have permission to view this transaction');
      }

      ApiResponseUtil.success(res, transaction);
    } catch (error) {
      next(error);
    }
  }
}

export default TransactionController;
