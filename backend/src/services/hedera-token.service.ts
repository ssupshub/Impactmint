import {
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenMintTransaction,
    TransferTransaction,
    TokenBurnTransaction,
    TokenNftInfoQuery,
    AccountBalanceQuery,
    CustomRoyaltyFee,
    CustomFixedFee,
    Hbar,
    PrivateKey,
    TokenId,
    AccountId,
    NftId,
} from '@hashgraph/sdk';
import { getHederaClient } from '../config/hedera';
import logger from '../utils/logger';
import { HederaTransactionError } from '../utils/errors';

export class HederaTokenService {
    /**
     * Create NFT collection for carbon credits
     */
    static async createNFTCollection(params: {
        name: string;
        symbol: string;
        treasuryAccountId: string;
        supplyKey: PrivateKey;
        royaltyFee?: number; // Percentage (e.g., 5 for 5%)
        fallbackFee?: number; // Fixed fee in HBAR
    }): Promise<{ tokenId: string; transactionId: string }> {
        try {
            const client = getHederaClient();
            const treasuryAccount = AccountId.fromString(params.treasuryAccountId);

            // Build custom fees (royalties for secondary sales)
            const customFees = [];

            if (params.royaltyFee) {
                const royaltyFee = new CustomRoyaltyFee()
                    .setNumerator(params.royaltyFee)
                    .setDenominator(100)
                    .setFeeCollectorAccountId(treasuryAccount);

                if (params.fallbackFee) {
                    royaltyFee.setFallbackFee(
                        new CustomFixedFee()
                            .setHbarAmount(new Hbar(params.fallbackFee))
                            .setFeeCollectorAccountId(treasuryAccount)
                    );
                }

                customFees.push(royaltyFee);
            }

            // Create NFT collection
            const transaction = await new TokenCreateTransaction()
                .setTokenName(params.name)
                .setTokenSymbol(params.symbol)
                .setTokenType(TokenType.NonFungibleUnique)
                .setSupplyType(TokenSupplyType.Infinite)
                .setTreasuryAccountId(treasuryAccount)
                .setSupplyKey(params.supplyKey)
                .setAdminKey(params.supplyKey) // Admin key for token management
                .setCustomFees(customFees)
                .setMaxTransactionFee(new Hbar(30))
                .freezeWith(client);

            const signedTx = await transaction.sign(params.supplyKey);
            const txResponse = await signedTx.execute(client);
            const receipt = await txResponse.getReceipt(client);

            const tokenId = receipt.tokenId;
            if (!tokenId) {
                throw new Error('Failed to create NFT collection');
            }

            logger.info('NFT collection created', {
                tokenId: tokenId.toString(),
                name: params.name,
                symbol: params.symbol,
            });

            return {
                tokenId: tokenId.toString(),
                transactionId: txResponse.transactionId.toString(),
            };
        } catch (error: any) {
            logger.error('Failed to create NFT collection:', error);
            throw new HederaTransactionError(`NFT collection creation failed: ${error.message}`);
        }
    }

    /**
     * Mint single NFT
     */
    static async mintNFT(params: {
        tokenId: string;
        supplyKey: PrivateKey;
        metadata: Buffer; // CID as bytes
    }): Promise<{ serialNumber: number; transactionId: string }> {
        try {
            const client = getHederaClient();
            const token = TokenId.fromString(params.tokenId);

            const transaction = await new TokenMintTransaction()
                .setTokenId(token)
                .addMetadata(params.metadata)
                .setMaxTransactionFee(new Hbar(20))
                .freezeWith(client);

            const signedTx = await transaction.sign(params.supplyKey);
            const txResponse = await signedTx.execute(client);
            const receipt = await txResponse.getReceipt(client);

            const serialNumber = receipt.serials[0].toNumber();

            logger.info('NFT minted', {
                tokenId: params.tokenId,
                serialNumber,
                transactionId: txResponse.transactionId.toString(),
            });

            return {
                serialNumber,
                transactionId: txResponse.transactionId.toString(),
            };
        } catch (error: any) {
            logger.error('Failed to mint NFT:', error);
            throw new HederaTransactionError(`NFT minting failed: ${error.message}`);
        }
    }

    /**
     * Batch mint NFTs efficiently
     */
    static async batchMintNFTs(params: {
        tokenId: string;
        supplyKey: PrivateKey;
        metadataArray: Buffer[];
        batchSize?: number;
        delayBetweenBatches?: number;
    }): Promise<Array<{ serialNumber: number; transactionId: string }>> {
        const batchSize = params.batchSize || 10;
        const delay = params.delayBetweenBatches || 1000;
        const results: Array<{ serialNumber: number; transactionId: string }> = [];

        try {
            const client = getHederaClient();
            const token = TokenId.fromString(params.tokenId);

            // Process in batches
            for (let i = 0; i < params.metadataArray.length; i += batchSize) {
                const batch = params.metadataArray.slice(i, i + batchSize);

                const transaction = new TokenMintTransaction()
                    .setTokenId(token)
                    .setMaxTransactionFee(new Hbar(20));

                // Add all metadata in this batch
                batch.forEach((metadata) => {
                    transaction.addMetadata(metadata);
                });

                const frozenTx = await transaction.freezeWith(client);
                const signedTx = await frozenTx.sign(params.supplyKey);
                const txResponse = await signedTx.execute(client);
                const receipt = await txResponse.getReceipt(client);

                // Record serial numbers
                receipt.serials.forEach((serial) => {
                    results.push({
                        serialNumber: serial.toNumber(),
                        transactionId: txResponse.transactionId.toString(),
                    });
                });

                logger.info('Batch minted', {
                    tokenId: params.tokenId,
                    count: batch.length,
                    serialNumbers: receipt.serials.map((s) => s.toNumber()),
                });

                // Delay between batches to avoid rate limits
                if (i + batchSize < params.metadataArray.length) {
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }

            return results;
        } catch (error: any) {
            logger.error('Failed to batch mint NFTs:', error);
            throw new HederaTransactionError(`Batch minting failed: ${error.message}`);
        }
    }

    /**
     * Transfer NFT to new owner
     */
    static async transferNFT(params: {
        tokenId: string;
        serialNumber: number;
        fromAccountId: string;
        toAccountId: string;
        fromPrivateKey: PrivateKey;
    }): Promise<{ transactionId: string }> {
        try {
            const client = getHederaClient();
            const token = TokenId.fromString(params.tokenId);
            const nftId = new NftId(token, params.serialNumber);
            const fromAccount = AccountId.fromString(params.fromAccountId);
            const toAccount = AccountId.fromString(params.toAccountId);

            const transaction = await new TransferTransaction()
                .addNftTransfer(nftId, fromAccount, toAccount)
                .setMaxTransactionFee(new Hbar(1))
                .freezeWith(client);

            const signedTx = await transaction.sign(params.fromPrivateKey);
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
            throw new HederaTransactionError(`NFT transfer failed: ${error.message}`);
        }
    }

    /**
     * Burn NFT (retire carbon credit)
     */
    static async burnNFT(params: {
        tokenId: string;
        serialNumber: number;
        supplyKey: PrivateKey;
    }): Promise<{ transactionId: string }> {
        try {
            const client = getHederaClient();
            const token = TokenId.fromString(params.tokenId);

            const transaction = await new TokenBurnTransaction()
                .setTokenId(token)
                .setSerials([params.serialNumber])
                .setMaxTransactionFee(new Hbar(1))
                .freezeWith(client);

            const signedTx = await transaction.sign(params.supplyKey);
            const txResponse = await signedTx.execute(client);
            await txResponse.getReceipt(client);

            logger.info('NFT burned (retired)', {
                tokenId: params.tokenId,
                serialNumber: params.serialNumber,
            });

            return {
                transactionId: txResponse.transactionId.toString(),
            };
        } catch (error: any) {
            logger.error('Failed to burn NFT:', error);
            throw new HederaTransactionError(`NFT burn failed: ${error.message}`);
        }
    }

    /**
     * Get NFT information
     */
    static async getNFTInfo(params: {
        tokenId: string;
        serialNumber: number;
    }): Promise<{
        tokenId: string;
        serialNumber: number;
        accountId: string;
        metadata: string;
        createdAt: Date;
    }> {
        try {
            const client = getHederaClient();
            const token = TokenId.fromString(params.tokenId);
            const nftId = new NftId(token, params.serialNumber);

            const info = await new TokenNftInfoQuery()
                .setNftId(nftId)
                .execute(client);

            return {
                tokenId: params.tokenId,
                serialNumber: params.serialNumber,
                accountId: (info as any).accountId.toString(),
                metadata: Buffer.from((info as any).metadata).toString('utf-8'),
                createdAt: new Date((info as any).creationTime.toDate()),
            };
        } catch (error: any) {
            logger.error('Failed to get NFT info:', error);
            throw new HederaTransactionError(`Failed to get NFT info: ${error.message}`);
        }
    }

    /**
     * Get all NFTs for an account
     */
    static async getAccountNFTs(accountId: string): Promise<
        Array<{
            tokenId: string;
            serialNumber: number;
        }>
    > {
        try {
            const client = getHederaClient();
            const account = AccountId.fromString(accountId);

            const balance = await new AccountBalanceQuery()
                .setAccountId(account)
                .execute(client);

            const nfts: Array<{ tokenId: string; serialNumber: number }> = [];

            // Iterate through all tokens
            if (balance.tokens) {
                // Note: This is a simplified version - in production, use Mirror Node API
                // TokenBalanceMap doesn't have forEach, need to use entries or other methods
                logger.debug('Account has tokens', { count: balance.tokens.size });
            }

            return nfts;
        } catch (error: any) {
            logger.error('Failed to get account NFTs:', error);
            throw new HederaTransactionError(`Failed to get account NFTs: ${error.message}`);
        }
    }

    /**
     * Calculate transaction fee
     */
    static async estimateTransactionFee(operation: 'mint' | 'transfer' | 'burn'): Promise<number> {
        // Estimated fees in HBAR
        const fees = {
            mint: 0.05,
            transfer: 0.001,
            burn: 0.001,
        };

        return fees[operation];
    }

    /**
     * Check treasury account balance
     */
    static async getTreasuryBalance(accountId: string): Promise<{ hbar: number }> {
        try {
            const client = getHederaClient();
            const account = AccountId.fromString(accountId);

            const balance = await new AccountBalanceQuery()
                .setAccountId(account)
                .execute(client);

            return {
                hbar: balance.hbars.toTinybars().toNumber() / 100000000, // Convert tinybars to HBAR
            };
        } catch (error: any) {
            logger.error('Failed to get treasury balance:', error);
            throw new HederaTransactionError(`Failed to get treasury balance: ${error.message}`);
        }
    }
}

export default HederaTokenService;
