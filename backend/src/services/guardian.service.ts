import axios, { AxiosInstance, AxiosError } from 'axios';
import config from '../config/env';
import logger from '../utils/logger';
import {
    GuardianAccountResponse,
    GuardianProjectResponse,
    GuardianStatusResponse,
    GuardianMintResponse,
    IGuardianPolicy,
} from '../types';

export class GuardianService {
    private static client: AxiosInstance;
    private static readonly MAX_RETRIES = 3;
    private static readonly RETRY_DELAY = 5000; // 5 seconds

    /**
     * Initialize Guardian API client
     */
    static initialize(): void {
        this.client = axios.create({
            baseURL: config.guardianApiUrl || 'http://localhost:3002',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor for authentication
        this.client.interceptors.request.use(
            (config) => {
                // Add authentication token if needed
                const token = this.getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                logger.error('Guardian API request error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest: any = error.config;

                // Retry logic for network errors
                if (!originalRequest._retry && this.isRetryableError(error)) {
                    originalRequest._retry = true;
                    originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

                    if (originalRequest._retryCount <= this.MAX_RETRIES) {
                        logger.warn(`Retrying Guardian API request (${originalRequest._retryCount}/${this.MAX_RETRIES})`);
                        await this.delay(this.RETRY_DELAY * originalRequest._retryCount);
                        return this.client(originalRequest);
                    }
                }

                logger.error('Guardian API response error:', {
                    url: error.config?.url,
                    status: error.response?.status,
                    data: error.response?.data,
                });

                return Promise.reject(error);
            }
        );

        logger.info('Guardian service initialized');
    }

    /**
     * Get authentication token for Guardian API
     */
    private static getAuthToken(): string | null {
        // Implement token retrieval logic
        // This could be from environment variables or a token management service
        return process.env.GUARDIAN_ACCESS_TOKEN || null;
    }

    /**
     * Check if error is retryable
     */
    private static isRetryableError(error: AxiosError): boolean {
        if (!error.response) return true; // Network error
        const status = error.response.status;
        return status === 429 || status === 502 || status === 503 || status === 504;
    }

    /**
     * Delay helper for retry logic
     */
    private static delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Create Guardian account for user
     */
    static async createGuardianAccount(
        role: 'Project Developer' | 'Auditor' | 'Verifier',
        hederaAccountId?: string
    ): Promise<GuardianAccountResponse> {
        try {
            const response = await this.client.post('/api/v1/accounts', {
                role,
                hederaAccountId,
            });

            logger.info('Guardian account created', { role, did: response.data.did });
            return response.data;
        } catch (error: any) {
            logger.error('Failed to create Guardian account:', error);
            throw new Error(`Guardian account creation failed: ${error.message}`);
        }
    }

    /**
     * Get list of available Guardian policies
     */
    static async getPolicies(): Promise<IGuardianPolicy[]> {
        try {
            const response = await this.client.get('/api/v1/policies');
            return response.data;
        } catch (error: any) {
            logger.error('Failed to get Guardian policies:', error);
            throw new Error(`Failed to retrieve policies: ${error.message}`);
        }
    }

    /**
     * Get specific policy by ID
     */
    static async getPolicyById(policyId: string): Promise<IGuardianPolicy> {
        try {
            const response = await this.client.get(`/api/v1/policies/${policyId}`);
            return response.data;
        } catch (error: any) {
            logger.error('Failed to get Guardian policy:', error);
            throw new Error(`Failed to retrieve policy: ${error.message}`);
        }
    }

    /**
     * Submit project to Guardian policy
     */
    static async submitProject(
        policyId: string,
        projectData: Record<string, any>,
        userDID: string
    ): Promise<GuardianProjectResponse> {
        try {
            const response = await this.client.post(`/api/v1/policies/${policyId}/projects`, {
                data: projectData,
                did: userDID,
            });

            logger.info('Project submitted to Guardian', { policyId, projectId: response.data.id });
            return response.data;
        } catch (error: any) {
            logger.error('Failed to submit project to Guardian:', error);
            throw new Error(`Project submission failed: ${error.message}`);
        }
    }

    /**
     * Upload MRV data to Guardian
     */
    static async uploadMRVData(
        policyId: string,
        projectId: string,
        mrvData: Record<string, any>,
        schemaName: string
    ): Promise<{ vcId: string; ipfsHash: string }> {
        try {
            const response = await this.client.post(
                `/api/v1/policies/${policyId}/projects/${projectId}/documents`,
                {
                    schema: schemaName,
                    data: mrvData,
                }
            );

            logger.info('MRV data uploaded to Guardian', { projectId, vcId: response.data.vcId });
            return response.data;
        } catch (error: any) {
            logger.error('Failed to upload MRV data to Guardian:', error);
            throw new Error(`MRV data upload failed: ${error.message}`);
        }
    }

    /**
     * Get project status from Guardian
     */
    static async getProjectStatus(policyId: string, projectId: string): Promise<GuardianStatusResponse> {
        try {
            const response = await this.client.get(`/api/v1/policies/${policyId}/projects/${projectId}/status`);
            return response.data;
        } catch (error: any) {
            logger.error('Failed to get project status from Guardian:', error);
            throw new Error(`Failed to retrieve project status: ${error.message}`);
        }
    }

    /**
     * Get verification results from Guardian
     */
    static async getVerificationResults(policyId: string, projectId: string): Promise<any> {
        try {
            const response = await this.client.get(`/api/v1/policies/${policyId}/projects/${projectId}/verification`);
            return response.data;
        } catch (error: any) {
            logger.error('Failed to get verification results from Guardian:', error);
            throw new Error(`Failed to retrieve verification results: ${error.message}`);
        }
    }

    /**
     * Trigger NFT minting in Guardian
     */
    static async triggerMinting(
        policyId: string,
        projectId: string,
        amount: number
    ): Promise<GuardianMintResponse> {
        try {
            const response = await this.client.post(`/api/v1/policies/${policyId}/projects/${projectId}/mint`, {
                amount,
            });

            logger.info('NFT minting triggered in Guardian', {
                projectId,
                tokenId: response.data.tokenId,
                amount,
            });
            return response.data;
        } catch (error: any) {
            logger.error('Failed to trigger minting in Guardian:', error);
            throw new Error(`Minting failed: ${error.message}`);
        }
    }

    /**
     * Upload document to IPFS via Guardian
     */
    static async uploadDocument(file: Buffer, filename: string): Promise<{ ipfsHash: string; url: string }> {
        try {
            const formData = new FormData();
            formData.append('file', new Blob([file]), filename);

            const response = await this.client.post('/api/v1/ipfs/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            logger.info('Document uploaded to IPFS via Guardian', { filename, ipfsHash: response.data.ipfsHash });
            return response.data;
        } catch (error: any) {
            logger.error('Failed to upload document to IPFS:', error);
            throw new Error(`Document upload failed: ${error.message}`);
        }
    }

    /**
     * Get document from IPFS by hash
     */
    static async getDocumentByHash(ipfsHash: string): Promise<Buffer> {
        try {
            const response = await this.client.get(`/api/v1/ipfs/${ipfsHash}`, {
                responseType: 'arraybuffer',
            });

            return Buffer.from(response.data);
        } catch (error: any) {
            logger.error('Failed to retrieve document from IPFS:', error);
            throw new Error(`Document retrieval failed: ${error.message}`);
        }
    }

    /**
     * Submit auditor approval to Guardian
     */
    static async submitAuditorApproval(
        policyId: string,
        projectId: string,
        auditorDID: string,
        approvalData: Record<string, any>
    ): Promise<void> {
        try {
            await this.client.post(`/api/v1/policies/${policyId}/projects/${projectId}/approve`, {
                auditorDID,
                data: approvalData,
            });

            logger.info('Auditor approval submitted to Guardian', { projectId, auditorDID });
        } catch (error: any) {
            logger.error('Failed to submit auditor approval:', error);
            throw new Error(`Auditor approval submission failed: ${error.message}`);
        }
    }

    /**
     * Get all documents for a project
     */
    static async getProjectDocuments(policyId: string, projectId: string): Promise<any[]> {
        try {
            const response = await this.client.get(`/api/v1/policies/${policyId}/projects/${projectId}/documents`);
            return response.data;
        } catch (error: any) {
            logger.error('Failed to get project documents:', error);
            throw new Error(`Failed to retrieve project documents: ${error.message}`);
        }
    }

    /**
     * Verify webhook signature
     */
    static verifyWebhookSignature(payload: string, signature: string): boolean {
        const crypto = require('crypto');
        const secret = process.env.GUARDIAN_WEBHOOK_SECRET || '';
        const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }

    /**
     * Import Guardian policy
     */
    static async importPolicy(policyJson: any): Promise<{ policyId: string }> {
        try {
            const response = await this.client.post('/api/v1/policies/import', policyJson);
            logger.info('Guardian policy imported', { policyId: response.data.policyId });
            return response.data;
        } catch (error: any) {
            logger.error('Failed to import Guardian policy:', error);
            throw new Error(`Policy import failed: ${error.message}`);
        }
    }

    /**
     * Publish Guardian policy
     */
    static async publishPolicy(policyId: string): Promise<void> {
        try {
            await this.client.post(`/api/v1/policies/${policyId}/publish`);
            logger.info('Guardian policy published', { policyId });
        } catch (error: any) {
            logger.error('Failed to publish Guardian policy:', error);
            throw new Error(`Policy publish failed: ${error.message}`);
        }
    }
}

export default GuardianService;
