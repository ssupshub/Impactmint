import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { create as createIPFSClient } from 'ipfs-http-client';
import crypto from 'crypto';
import path from 'path';
import logger from '../utils/logger';
import config from '../config/env';

export class StorageService {
  private static s3Client: S3Client;
  private static ipfsClient: any;

  // Initialize S3 Client
  static initializeS3() {
    this.s3Client = new S3Client({
      region: config.aws.region || 'us-east-1',
      credentials: {
        accessKeyId: config.aws.accessKeyId || '',
        secretAccessKey: config.aws.secretAccessKey || '',
      },
    });
  }

  // Initialize IPFS Client
  static initializeIPFS() {
    try {
      this.ipfsClient = createIPFSClient({
        host: config.ipfs.host || 'ipfs.infura.io',
        port: config.ipfs.port || 5001,
        protocol: config.ipfs.protocol || 'https',
      });
    } catch (error) {
      logger.warn('IPFS client initialization failed. IPFS features will be unavailable.');
    }
  }

  /**
   * Upload file to S3
   * @param file Buffer or stream
   * @param filename Original filename
   * @param folder Folder/prefix in S3
   * @returns S3 URL
   */
  static async uploadToS3(
    file: Buffer,
    filename: string,
    folder: string = 'uploads'
  ): Promise<string> {
    try {
      if (!this.s3Client) {
        this.initializeS3();
      }

      // Generate unique filename
      const fileExt = path.extname(filename);
      const uniqueName = `${crypto.randomBytes(16).toString('hex')}${fileExt}`;
      const key = `${folder}/${uniqueName}`;

      const command = new PutObjectCommand({
        Bucket: config.aws.s3Bucket,
        Key: key,
        Body: file,
        ContentType: this.getContentType(filename),
      });

      await this.s3Client.send(command);

      const url = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
      
      logger.info('File uploaded to S3', { filename, key });
      return url;
    } catch (error: any) {
      logger.error('Failed to upload to S3:', error);
      throw new Error('File upload failed');
    }
  }

  /**
   * Get signed URL for private S3 objects
   * @param key S3 object key
   * @param expiresIn Expiration time in seconds
   * @returns Signed URL
   */
  static async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      if (!this.s3Client) {
        this.initializeS3();
      }

      const command = new GetObjectCommand({
        Bucket: config.aws.s3Bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error: any) {
      logger.error('Failed to generate signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Delete file from S3
   * @param key S3 object key
   */
  static async deleteFromS3(key: string): Promise<void> {
    try {
      if (!this.s3Client) {
        this.initializeS3();
      }

      const command = new DeleteObjectCommand({
        Bucket: config.aws.s3Bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      logger.info('File deleted from S3', { key });
    } catch (error: any) {
      logger.error('Failed to delete from S3:', error);
      throw new Error('File deletion failed');
    }
  }

  /**
   * Upload JSON metadata to IPFS
   * @param metadata Metadata object
   * @returns IPFS hash
   */
  static async uploadToIPFS(metadata: Record<string, any>): Promise<string> {
    try {
      if (!this.ipfsClient) {
        this.initializeIPFS();
      }

      const metadataString = JSON.stringify(metadata);
      const result = await this.ipfsClient.add(metadataString);
      
      const ipfsHash = result.path;
      logger.info('Metadata uploaded to IPFS', { ipfsHash });
      
      return ipfsHash;
    } catch (error: any) {
      logger.error('Failed to upload to IPFS:', error);
      throw new Error('IPFS upload failed');
    }
  }

  /**
   * Retrieve data from IPFS
   * @param ipfsHash IPFS hash
   * @returns Metadata object
   */
  static async getFromIPFS(ipfsHash: string): Promise<Record<string, any>> {
    try {
      if (!this.ipfsClient) {
        this.initializeIPFS();
      }

      const stream = this.ipfsClient.cat(ipfsHash);
      let data = '';

      for await (const chunk of stream) {
        data += chunk.toString();
      }

      return JSON.parse(data);
    } catch (error: any) {
      logger.error('Failed to retrieve from IPFS:', error);
      throw new Error('IPFS retrieval failed');
    }
  }

  /**
   * Validate file before upload
   * @param file File buffer
   * @param filename Filename
   * @param maxSize Max file size in bytes
   * @param allowedTypes Allowed MIME types
   */
  static validateFile(
    file: Buffer,
    filename: string,
    maxSize: number = 10 * 1024 * 1024, // 10MB default
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']
  ): { valid: boolean; error?: string } {
    // Check file size
    if (file.length > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
      };
    }

    // Check file type
    const contentType = this.getContentType(filename);
    if (!allowedTypes.includes(contentType)) {
      return {
        valid: false,
        error: `File type ${contentType} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Get content type from filename
   * @param filename Filename
   * @returns MIME type
   */
  private static getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const types: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.csv': 'text/csv',
      '.json': 'application/json',
    };

    return types[ext] || 'application/octet-stream';
  }
}

export default StorageService;
