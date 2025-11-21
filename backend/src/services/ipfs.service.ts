import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import logger from '../utils/logger';
import config from '../config/env';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: Record<string, any>;
}

export class IPFSService {
  private static client: AxiosInstance;
  private static provider: 'pinata' | 'nft.storage' | 'web3.storage';

  /**
   * Initialize IPFS service
   */
  static initialize(): void {
    this.provider = (process.env.IPFS_PROVIDER as any) || 'pinata';

    switch (this.provider) {
      case 'pinata':
        this.client = axios.create({
          baseURL: 'https://api.pinata.cloud',
          headers: {
            pinata_api_key: process.env.IPFS_API_KEY || '',
            pinata_secret_api_key: process.env.IPFS_API_SECRET || '',
          },
        });
        break;

      case 'nft.storage':
        this.client = axios.create({
          baseURL: 'https://api.nft.storage',
          headers: {
            Authorization: `Bearer ${process.env.IPFS_API_KEY}`,
          },
        });
        break;

      case 'web3.storage':
        this.client = axios.create({
          baseURL: 'https://api.web3.storage',
          headers: {
            Authorization: `Bearer ${process.env.IPFS_API_KEY}`,
          },
        });
        break;
    }

    logger.info('IPFS service initialized', { provider: this.provider });
  }

  /**
   * Upload metadata JSON to IPFS
   */
  static async uploadMetadata(metadata: NFTMetadata): Promise<{
    ipfsHash: string;
    url: string;
  }> {
    try {
      const jsonString = JSON.stringify(metadata, null, 2);

      if (this.provider === 'pinata') {
        const formData = new FormData();
        formData.append('file', Buffer.from(jsonString), {
          filename: 'metadata.json',
          contentType: 'application/json',
        });

        const pinataMetadata = JSON.stringify({
          name: metadata.name,
          keyvalues: {
            type: 'carbon-credit-metadata',
            projectId: metadata.properties.projectId,
          },
        });
        formData.append('pinataMetadata', pinataMetadata);

        const response = await this.client.post('/pinning/pinFileToIPFS', formData, {
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
        });

        const ipfsHash = response.data.IpfsHash;
        const url = `${process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/'}${ipfsHash}`;

        logger.info('Metadata uploaded to IPFS', { ipfsHash, provider: this.provider });

        return { ipfsHash, url };
      } else if (this.provider === 'nft.storage') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const formData = new FormData();
        formData.append('file', blob, 'metadata.json');

        const response = await this.client.post('/upload', formData);
        const ipfsHash = response.data.value.cid;
        const url = `https://nftstorage.link/ipfs/${ipfsHash}`;

        logger.info('Metadata uploaded to IPFS', { ipfsHash, provider: this.provider });

        return { ipfsHash, url };
      } else {
        // web3.storage
        const response = await this.client.post('/upload', jsonString, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const ipfsHash = response.data.cid;
        const url = `https://w3s.link/ipfs/${ipfsHash}`;

        logger.info('Metadata uploaded to IPFS', { ipfsHash, provider: this.provider });

        return { ipfsHash, url };
      }
    } catch (error: any) {
      logger.error('Failed to upload metadata to IPFS:', error);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Upload image to IPFS
   */
  static async uploadImage(imageBuffer: Buffer, filename: string): Promise<{
    ipfsHash: string;
    url: string;
  }> {
    try {
      if (this.provider === 'pinata') {
        const formData = new FormData();
        formData.append('file', imageBuffer, {
          filename,
          contentType: 'image/png',
        });

        const pinataMetadata = JSON.stringify({
          name: filename,
          keyvalues: {
            type: 'carbon-credit-certificate',
          },
        });
        formData.append('pinataMetadata', pinataMetadata);

        const response = await this.client.post('/pinning/pinFileToIPFS', formData, {
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
        });

        const ipfsHash = response.data.IpfsHash;
        const url = `${process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/'}${ipfsHash}`;

        logger.info('Image uploaded to IPFS', { ipfsHash, filename });

        return { ipfsHash, url };
      } else {
        // Similar implementation for other providers
        throw new Error(`Image upload not yet implemented for ${this.provider}`);
      }
    } catch (error: any) {
      logger.error('Failed to upload image to IPFS:', error);
      throw new Error(`IPFS image upload failed: ${error.message}`);
    }
  }

  /**
   * Pin existing content
   */
  static async pinContent(ipfsHash: string): Promise<void> {
    try {
      if (this.provider === 'pinata') {
        await this.client.post('/pinning/pinByHash', {
          hashToPin: ipfsHash,
          pinataMetadata: {
            name: `Pinned content ${ipfsHash}`,
          },
        });

        logger.info('Content pinned', { ipfsHash });
      }
    } catch (error: any) {
      logger.error('Failed to pin content:', error);
      throw new Error(`IPFS pinning failed: ${error.message}`);
    }
  }

  /**
   * Get metadata from IPFS
   */
  static async getMetadata(ipfsHash: string): Promise<NFTMetadata> {
    try {
      const gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/';
      const url = `${gatewayUrl}${ipfsHash}`;

      const response = await axios.get(url);
      return response.data as NFTMetadata;
    } catch (error: any) {
      logger.error('Failed to get metadata from IPFS:', error);
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }

  /**
   * Generate standardized NFT metadata
   */
  static generateMetadata(params: {
    projectId: string;
    projectName: string;
    methodology: string;
    tonsCO2: number;
    vintage: number;
    location: string;
    verificationDate: Date;
    verifier: string;
    certificateImageHash: string;
    guardianPolicyId?: string;
    emissionFactor?: number;
    energyGenerated?: number;
    hederaTxId?: string;
  }): NFTMetadata {
    return {
      name: `Carbon Credit #${params.projectId}`,
      description: `${params.tonsCO2} metric ton${params.tonsCO2 > 1 ? 's' : ''} CO2 offset from ${params.projectName}`,
      image: `ipfs://${params.certificateImageHash}`,
      attributes: [
        { trait_type: 'Methodology', value: params.methodology },
        { trait_type: 'Tons CO2', value: params.tonsCO2 },
        { trait_type: 'Vintage', value: params.vintage },
        { trait_type: 'Project', value: params.projectName },
        { trait_type: 'Location', value: params.location },
        { trait_type: 'Verification Date', value: params.verificationDate.toISOString().split('T')[0] },
        { trait_type: 'Verifier', value: params.verifier },
      ],
      properties: {
        projectId: params.projectId,
        guardianPolicyId: params.guardianPolicyId,
        emissionFactor: params.emissionFactor,
        energyGenerated: params.energyGenerated,
        hederaTxId: params.hederaTxId,
      },
    };
  }

  /**
   * Convert IPFS hash to bytes for Hedera
   */
  static hashToBytes(ipfsHash: string): Buffer {
    // Remove 'ipfs://' prefix if present
    const hash = ipfsHash.replace('ipfs://', '');
    return Buffer.from(hash, 'utf-8');
  }

  /**
   * Convert bytes to IPFS hash
   */
  static bytesToHash(bytes: Buffer): string {
    return bytes.toString('utf-8');
  }

  /**
   * Get IPFS URL from hash
   */
  static getIPFSUrl(ipfsHash: string): string {
    const gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/';
    return `${gatewayUrl}${ipfsHash.replace('ipfs://', '')}`;
  }
}

export default IPFSService;
