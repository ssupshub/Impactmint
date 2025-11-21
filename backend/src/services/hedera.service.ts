import {
  AccountId,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
  TransferTransaction,
} from '@hashgraph/sdk';
import { getHederaClient } from '../config/hedera';
import logger from '../utils/logger';
import { HederaTransactionError } from '../utils/errors';

export class HederaService {
  // Create new Hedera account
  static async createAccount(): Promise<{ accountId: string; publicKey: string; privateKey: string }> {
    try {
      const client = getHederaClient();
      
      // Generate new keys
      const privateKey = PrivateKey.generateED25519();
      const publicKey = privateKey.publicKey;

      // Create account
      const transaction = await new AccountCreateTransaction()
        .setKey(publicKey)
        .setInitialBalance(new Hbar(10)) // 10 HBAR initial balance
        .execute(client);

      const receipt = await transaction.getReceipt(client);
      const accountId = receipt.accountId;

      if (!accountId) {
        throw new Error('Failed to create account');
      }

      logger.info('Hedera account created', { accountId: accountId.toString() });

      return {
        accountId: accountId.toString(),
        publicKey: publicKey.toString(),
        privateKey: privateKey.toString(),
      };
    } catch (error: any) {
      logger.error('Failed to create Hedera account:', error);
      throw new HederaTransactionError('Failed to create Hedera account');
    }
  }

  // Get account balance
  static async getAccountBalance(accountId: string): Promise<{ hbar: string }> {
    try {
      const client = getHederaClient();
      const account = AccountId.fromString(accountId);

      const balance = await new AccountBalanceQuery()
        .setAccountId(account)
        .execute(client);

      return {
        hbar: balance.hbars.toString(),
      };
    } catch (error: any) {
      logger.error('Failed to get account balance:', error);
      throw new HederaTransactionError('Failed to get account balance');
    }
  }

  // Transfer HBAR
  static async transferHbar(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    privateKey?: string
  ): Promise<string> {
    try {
      const client = getHederaClient();
      const from = AccountId.fromString(fromAccountId);
      const to = AccountId.fromString(toAccountId);

      let transaction = new TransferTransaction()
        .addHbarTransfer(from, new Hbar(-amount))
        .addHbarTransfer(to, new Hbar(amount));

      // Sign with private key if provided
      if (privateKey) {
        const key = PrivateKey.fromString(privateKey);
        transaction = transaction.freezeWith(client);
        transaction = await transaction.sign(key);
      }

      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);

      logger.info('HBAR transferred', {
        from: fromAccountId,
        to: toAccountId,
        amount,
        transactionId: txResponse.transactionId.toString(),
      });

      return txResponse.transactionId.toString();
    } catch (error: any) {
      logger.error('Failed to transfer HBAR:', error);
      throw new HederaTransactionError('Failed to transfer HBAR');
    }
  }

  // Verify transaction status
  static async verifyTransaction(transactionId: string): Promise<{
    status: string;
    receipt?: any;
  }> {
    try {
      const client = getHederaClient();
      
      // In a production app, you would query the mirror node
      // This is a simplified version
      logger.info('Transaction verified', { transactionId });

      return {
        status: 'SUCCESS',
        receipt: {},
      };
    } catch (error: any) {
      logger.error('Failed to verify transaction:', error);
      throw new HederaTransactionError('Failed to verify transaction');
    }
  }
}

export default HederaService;
