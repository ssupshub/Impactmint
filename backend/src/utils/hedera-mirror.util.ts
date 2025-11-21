import axios from 'axios';
import logger from '../utils/logger';

export class HederaMirrorUtil {
    private static readonly MIRROR_NODE_URL = process.env.HEDERA_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';

    /**
     * Get NFT information from Mirror Node
     */
    static async getNFTInfo(tokenId: string, serialNumber: number): Promise<any> {
        try {
            const url = `${this.MIRROR_NODE_URL}/api/v1/tokens/${tokenId}/nfts/${serialNumber}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error: any) {
            logger.error('Failed to get NFT info from Mirror Node:', error);
            throw new Error(`Mirror Node query failed: ${error.message}`);
        }
    }

    /**
     * Get all NFTs for an account
     */
    static async getAccountNFTs(accountId: string): Promise<any[]> {
        try {
            const url = `${this.MIRROR_NODE_URL}/api/v1/accounts/${accountId}/nfts`;
            const response = await axios.get(url);
            return response.data.nfts || [];
        } catch (error: any) {
            logger.error('Failed to get account NFTs from Mirror Node:', error);
            throw new Error(`Mirror Node query failed: ${error.message}`);
        }
    }

    /**
     * Get transaction details
     */
    static async getTransaction(transactionId: string): Promise<any> {
        try {
            const url = `${this.MIRROR_NODE_URL}/api/v1/transactions/${transactionId}`;
            const response = await axios.get(url);
            return response.data.transactions?.[0] || null;
        } catch (error: any) {
            logger.error('Failed to get transaction from Mirror Node:', error);
            throw new Error(`Mirror Node query failed: ${error.message}`);
        }
    }

    /**
     * Get NFT transfer history
     */
    static async getNFTTransferHistory(tokenId: string, serialNumber: number): Promise<any[]> {
        try {
            const url = `${this.MIRROR_NODE_URL}/api/v1/tokens/${tokenId}/nfts/${serialNumber}/transactions`;
            const response = await axios.get(url);
            return response.data.transactions || [];
        } catch (error: any) {
            logger.error('Failed to get NFT transfer history from Mirror Node:', error);
            throw new Error(`Mirror Node query failed: ${error.message}`);
        }
    }

    /**
     * Verify NFT ownership on-chain
     */
    static async verifyOwnership(tokenId: string, serialNumber: number, expectedOwner: string): Promise<boolean> {
        try {
            const nftInfo = await this.getNFTInfo(tokenId, serialNumber);
            return nftInfo.account_id === expectedOwner;
        } catch (error: any) {
            logger.error('Failed to verify NFT ownership:', error);
            return false;
        }
    }

    /**
     * Get token information
     */
    static async getTokenInfo(tokenId: string): Promise<any> {
        try {
            const url = `${this.MIRROR_NODE_URL}/api/v1/tokens/${tokenId}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error: any) {
            logger.error('Failed to get token info from Mirror Node:', error);
            throw new Error(`Mirror Node query failed: ${error.message}`);
        }
    }

    /**
     * Get account balance
     */
    static async getAccountBalance(accountId: string): Promise<any> {
        try {
            const url = `${this.MIRROR_NODE_URL}/api/v1/balances?account.id=${accountId}`;
            const response = await axios.get(url);
            return response.data.balances?.[0] || null;
        } catch (error: any) {
            logger.error('Failed to get account balance from Mirror Node:', error);
            throw new Error(`Mirror Node query failed: ${error.message}`);
        }
    }

    /**
     * Build HashScan URL for transaction
     */
    static getHashScanUrl(transactionId: string, network: 'mainnet' | 'testnet' = 'testnet'): string {
        return `https://hashscan.io/${network}/transaction/${transactionId}`;
    }

    /**
     * Build HashScan URL for NFT
     */
    static getHashScanNFTUrl(tokenId: string, serialNumber: number, network: 'mainnet' | 'testnet' = 'testnet'): string {
        return `https://hashscan.io/${network}/token/${tokenId}/${serialNumber}`;
    }
}

export default HederaMirrorUtil;
