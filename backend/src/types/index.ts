import { Document } from 'mongoose';

// User Roles
export enum UserRole {
  ADMIN = 'admin',
  PROJECT_DEVELOPER = 'project_developer',
  AUDITOR = 'auditor',
  BUYER = 'buyer',
}

// Project Status
export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING_AUDIT = 'pending_audit',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

// Credit Status
export enum CreditStatus {
  ACTIVE = 'active',
  RETIRED = 'retired',
  TRANSFERRED = 'transferred',
}

// Transaction Status
export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

// Transaction Type
export enum TransactionType {
  MINT = 'mint',
  TRANSFER = 'transfer',
  RETIRE = 'retire',
  PURCHASE = 'purchase',
}

// Audit Status
export enum AuditStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Listing Status
export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

// KYC Status
export enum KYCStatus {
  NOT_SUBMITTED = 'not_submitted',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Organization Type
export enum OrganizationType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  NGO = 'ngo',
  GOVERNMENT = 'government',
}

// User Interface
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  hederaAccountId?: string;
  hederaPublicKey?: string;
  organization?: {
    name?: string;
    type?: OrganizationType;
    taxId?: string;
    website?: string;
  };
  kyc: {
    status: KYCStatus;
    submittedAt?: Date;
    verifiedAt?: Date;
    documents: {
      type: 'id' | 'proof_of_address' | 'business_registration' | 'tax_document';
      url: string;
      uploadedAt: Date;
    }[];
    rejectionReason?: string;
  };
  permissions: string[];
  isEmailVerified: boolean;
  isActive: boolean;
  refreshTokens: string[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Project Interface
export interface IProject extends Document {
  name: string;
  description: string;
  owner: string;
  location: {
    country: string;
    region: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  capacity: number;
  verifiedCapacity?: number;
  methodology: string;
  startDate: Date;
  endDate?: Date;
  status: ProjectStatus;
  documents: {
    name: string;
    url: string;
    uploadedAt: Date;
  }[];
  images: string[];
  // Guardian Integration Fields
  guardianPolicyId?: string;
  guardianProjectId?: string;
  guardianDID?: string;
  guardianWorkflowStatus?: string;
  assignedAuditors?: any[];
  requiredApprovals?: number;
  currentApprovals?: number;
  auditorAssignments?: any[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Credit Interface
export interface ICredit extends Document {
  projectId: string;
  tokenId: string;
  serialNumber: number;
  owner: string;
  quantity: number;
  status: CreditStatus;
  mintTransactionId: string;
  retireTransactionId?: string;
  metadata: {
    vintage: number;
    methodology: string;
    verificationStandard: string;
    additionalData: Record<string, any>;
  };
  ipfsMetadataUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Interface
export interface ITransaction extends Document {
  userId: string;
  hederaTransactionId: string;
  type: TransactionType;
  status: TransactionStatus;
  creditId?: string;
  projectId?: string;
  from?: string;
  to?: string;
  amount?: number;
  fee?: number;
  memo?: string;
  receipt?: Record<string, any>;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Interface
export interface IAudit extends Document {
  projectId: string;
  auditorId: string;
  status: AuditStatus;
  assignedAt: Date;
  completedAt?: Date;
  findings: string;
  verifiedCapacity?: number;
  documents: {
    name: string;
    url: string;
    uploadedAt: Date;
  }[];
  recommendations: string[];
  approvalSignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Listing Interface
export interface IListing extends Document {
  creditId: string;
  sellerId: string;
  buyerId?: string;
  price: number;
  quantity: number;
  remainingQuantity: number;
  currency: string;
  status: ListingStatus;
  expiresAt?: Date;
  purchasedAt?: Date;
  transactionId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Guardian Workflow Status
export enum GuardianWorkflowStatus {
  SUBMITTED = 'submitted',
  VALIDATING = 'validating',
  PENDING_AUDITOR = 'pending_auditor',
  AUDITOR_REVIEWING = 'auditor_reviewing',
  AUDITOR_APPROVED = 'auditor_approved',
  MINTING = 'minting',
  COMPLETE = 'complete',
  FAILED = 'failed',
  REJECTED = 'rejected',
}

// MRV Data Type
export enum MRVDataType {
  REC = 'rec',
  REDD = 'redd',
  OPR = 'opr',
}

// MRV Data Status
export enum MRVDataStatus {
  DRAFT = 'draft',
  VALIDATED = 'validated',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

// Guardian Workflow Interface
export interface IGuardianWorkflow extends Document {
  projectId: string;
  policyId: string;
  policyTag: string;
  currentStatus: GuardianWorkflowStatus;
  guardianProjectId?: string;
  guardianDID?: string;
  guardianVPId?: string;
  guardianVCIds: string[];
  stateHistory: {
    status: GuardianWorkflowStatus;
    timestamp: Date;
    message?: string;
    metadata?: Record<string, any>;
  }[];
  errorLogs: {
    timestamp: Date;
    error: string;
    stackTrace?: string;
  }[];
  retryCount: number;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// MRV Data Interface
export interface IMRVData extends Document {
  projectId: string;
  dataType: MRVDataType;
  monitoringPeriodStart: Date;
  monitoringPeriodEnd: Date;
  data: Record<string, any>;
  validationStatus: MRVDataStatus;
  validationErrors?: string[];
  guardianSubmissionStatus?: 'pending' | 'submitted' | 'failed';
  guardianVCId?: string;
  ipfsHash?: string;
  calculatedCredits?: number;
  submittedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Auditor Assignment Interface
export interface IAuditorAssignment extends Document {
  projectId: string;
  auditorId: string;
  assignedAt: Date;
  assignedBy: string;
  status: 'pending' | 'in_progress' | 'completed' | 'declined';
  reviewNotes?: string;
  approvalDecision?: 'approved' | 'rejected' | 'conditional';
  approvalSignature?: string;
  completedAt?: Date;
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Guardian Policy Interface
export interface IGuardianPolicy {
  id: string;
  name: string;
  description: string;
  version: string;
  policyTag: string;
  methodology: MRVDataType;
  isActive: boolean;
}

// Guardian API Response Types
export interface GuardianAccountResponse {
  did: string;
  hederaAccountId: string;
  role: string;
}

export interface GuardianProjectResponse {
  id: string;
  policyId: string;
  status: string;
  did: string;
  vpDocument?: any;
  vcDocuments?: any[];
}

export interface GuardianStatusResponse {
  projectId: string;
  status: GuardianWorkflowStatus;
  currentStep: string;
  pendingActions: string[];
  lastUpdated: Date;
}

export interface GuardianMintResponse {
  tokenId: string;
  amount: number;
  transactionId: string;
  serialNumbers?: number[];
}
