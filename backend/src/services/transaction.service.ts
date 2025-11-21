import Transaction from '../models/Transaction.model';
import { TransactionType, TransactionStatus } from '../types';
import logger from '../utils/logger';

export class TransactionService {
  // Create transaction record
  static async createTransaction(data: {
    userId: string;
    hederaTransactionId: string;
    type: TransactionType;
    creditId?: string;
    projectId?: string;
    from?: string;
    to?: string;
    amount?: number;
    memo?: string;
  }) {
    try {
      const transaction = await Transaction.create({
        ...data,
        status: TransactionStatus.PENDING,
        retryCount: 0,
      });

      logger.info('Transaction record created', {
        id: transaction._id,
        hederaTransactionId: data.hederaTransactionId,
      });

      return transaction;
    } catch (error) {
      logger.error('Failed to create transaction record:', error);
      throw error;
    }
  }

  // Update transaction status
  static async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    receipt?: any,
    errorMessage?: string
  ) {
    try {
      const transaction = await Transaction.findByIdAndUpdate(
        transactionId,
        {
          status,
          receipt,
          errorMessage,
          updatedAt: new Date(),
        },
        { new: true }
      );

      logger.info('Transaction status updated', {
        id: transactionId,
        status,
      });

      return transaction;
    } catch (error) {
      logger.error('Failed to update transaction status:', error);
      throw error;
    }
  }

  // Get user transactions
  static async getUserTransactions(userId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        Transaction.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Transaction.countDocuments({ userId }),
      ]);

      return {
        transactions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Failed to get user transactions:', error);
      throw error;
    }
  }
}

export default TransactionService;
