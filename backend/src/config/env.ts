import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  // Application
  nodeEnv: string;
  port: number;
  
  // Database
  mongodbUri: string;
  
  // JWT
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpire: string;
  jwtRefreshExpire: string;
  
  // Hedera
  hederaNetwork: 'testnet' | 'mainnet';
  hederaOperatorId: string;
  hederaOperatorKey: string;
  hederaMirrorNodeUrl: string;
  
  // IPFS
  ipfsApiUrl?: string;
  ipfsApiKey?: string;
  ipfsProjectSecret?: string;
  ipfs: {
    host: string;
    port: number;
    protocol: string;
  };
  
  // AWS S3
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3Bucket: string;
  };
  
  // CORS
  corsOrigin: string;
  
  // Redis
  redisUrl?: string;
  redisPassword?: string;
  redisDb?: number;
  
  // Logging
  logLevel: string;
  logFilePath: string;
  
  // Sentry
  sentryDsn?: string;
  sentryEnvironment: string;
  
  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  
  // Email
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  emailFrom?: string;
  
  // Frontend URL
  frontendUrl: string;
}

const config: Config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  
  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/impactmint',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
  jwtExpire: process.env.JWT_EXPIRE || '15m',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  
  // Hedera
  hederaNetwork: (process.env.HEDERA_NETWORK as 'testnet' | 'mainnet') || 'testnet',
  hederaOperatorId: process.env.HEDERA_OPERATOR_ID || '',
  hederaOperatorKey: process.env.HEDERA_OPERATOR_KEY || '',
  hederaMirrorNodeUrl: process.env.HEDERA_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com',
  
  // IPFS
  ipfsApiUrl: process.env.IPFS_API_URL,
  ipfsApiKey: process.env.IPFS_API_KEY,
  ipfsProjectSecret: process.env.IPFS_PROJECT_SECRET,
  ipfs: {
    host: process.env.IPFS_HOST || 'ipfs.infura.io',
    port: parseInt(process.env.IPFS_PORT || '5001', 10),
    protocol: process.env.IPFS_PROTOCOL || 'https',
  },
  
  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
  },
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Redis
  redisUrl: process.env.REDIS_URL,
  redisPassword: process.env.REDIS_PASSWORD,
  redisDb: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFilePath: process.env.LOG_FILE_PATH || './logs',
  
  // Sentry
  sentryDsn: process.env.SENTRY_DSN,
  sentryEnvironment: process.env.SENTRY_ENVIRONMENT || 'development',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Email
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  emailFrom: process.env.EMAIL_FROM,
  
  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Validation
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'HEDERA_OPERATOR_ID',
  'HEDERA_OPERATOR_KEY',
];

if (config.nodeEnv === 'production') {
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

export default config;
