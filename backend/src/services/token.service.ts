import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenBurnTransaction,
  TransferTransaction,
  PrivateKey,
  AccountId,
} from '@hashgraph/sdk';
import { getHederaClient } from '../config/hedera';
import logger from '../utils/logger';
import { HederaTransactionError } from '../utils/errors';

export class TokenService {
  // Create NFT collection
  static async createNFTCollection(params: {
    name: string;
    symbol: string;
    treasuryAccountId: string;
    supplyKey?: string;
  }): Promise<{ tokenId: string; transactionId: string }> {
    try {
      const client = getHederaClient();
      const treasuryAccount = AccountId.fromString(params.treasuryAccountId);
      const supplyKey = params.supplyKey
        ? PrivateKey.fromString(params.supplyKey)
        : PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY || '');

      // Create NFT collection
      const transaction = await new TokenCreateTransaction()
        .setTokenName(params.name)
        .setTokenSymbol(params.symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(treasuryAccount)
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(supplyKey.publicKey)
        .setAdminKey(client.operatorPublicKey!)
        .freezeWith(client);

      const signedTx = await transaction.sign(supplyKey);
      const txResponse = await signedTx.execute(client);
      const receipt = await txResponse.getReceipt(client);

      const tokenId = receipt.tokenId;
      if (!tokenId) {
        throw new Error('Failed to create NFT collection');
      }

      logger.info('NFT collection created', {
        tokenId: tokenId.toString(),
        name: params.name,
      });

      return {
        tokenId: tokenId.toString(),
        transactionId: txResponse.transactionId.toString(),
      };
    } catch (error: any) {
      logger.error('Failed to create NFT collection:', error);
      throw new HederaTransactionError('Failed to create NFT collection');
    }
  }

  // Mint NFT
  static async mintNFT(params: {
    tokenId: string;
    metadata: string[];
    supplyKey: string;
  }): Promise<{ serialNumbers: number[]; transactionId: string }> {
    try {
      const client = getHederaClient();
      const supplyKey = PrivateKey.fromString(params.supplyKey);

      // Convert metadata to buffer
      const metadataBuffer = params.metadata.map(m => Buffer.from(m));

      // Mint NFT
      const transaction = await new TokenMintTransaction()
        .setTokenId(params.tokenId)
        .setMetadata(metadataBuffer)
        .freezeWith(client);

      const signedTx = await transaction.sign(supplyKey);
      const txResponse = await signedTx.execute(client);
      const receipt = await txResponse.getReceipt(client);

      const serialNumbers = receipt.serials.map(s => s.toNumber());

      logger.info('NFT minted', {
        tokenId: params.tokenId,
        serialNumbers,
      });

      return {
        serialNumbers,
        transactionId: txResponse.transactionId.toString(),
      };
    } catch (error: any) {
      logger.error('Failed to mint NFT:', error);
      throw new HederaTransactionError('Failed to mint NFT');
    }
  }

  // Transfer NFT
  static async transferNFT(params: {
    tokenId: string;
    serialNumber: number;
    fromAccountId: string;
    toAccountId: string;
    fromPrivateKey: string;
  }): Promise<{ transactionId: string }> {
    try {
      const client = getHederaClient();
      const fromKey = PrivateKey.fromString(params.fromPrivateKey);
      const fromAccount = AccountId.fromString(params.fromAccountId);
      const toAccount = AccountId.fromString(params.toAccountId);

      // Transfer NFT
      const transaction = await new TransferTransaction()
        .addNftTransfer(params.tokenId, params.serialNumber, fromAccount, toAccount)
        .freezeWith(client);

      const signedTx = await transaction.sign(fromKey);
      const txResponse = await signedTx.execute(client);
      await txResponse.getReceipt(client);

      logger.info('NFT transferred', {
        tokenId: params.tokenId,
        serialNumber: params.serialNumber,
        from: params.fromAccountId,
        to: params.toAccountId,
      });

      return {
        transactionId: txResponse.transactionId.toString(),
      };
    } catch (error: any) {
      logger.error('Failed to transfer NFT:', error);
      throw new HederaTransactionError('Failed to transfer NFT');
    }
  }

  // Burn NFT (retire carbon credit)
  static async burnNFT(params: {
    tokenId: string;
    serialNumbers: number[];
    supplyKey: string;
  }): Promise<{ transactionId: string }> {
    try {
      const client = getHederaClient();
      const supplyKey = PrivateKey.fromString(params.supplyKey);

      // Burn NFT
      const transaction = await new TokenBurnTransaction()
        .setTokenId(params.tokenId)
        .setSerials(params.serialNumbers)
        .freezeWith(client);

      const signedTx = await transaction.sign(supplyKey);
      const txResponse = await signedTx.execute(client);
      await txResponse.getReceipt(client);

      logger.info('NFT burned', {
        tokenId: params.tokenId,
        serialNumbers: params.serialNumbers,
      });

      return {
        transactionId: txResponse.transactionId.toString(),
      };
    } catch (error: any) {
      logger.error('Failed to burn NFT:', error);
      throw new HederaTransactionError('Failed to burn NFT');
    }
  }
}

export default TokenService;
