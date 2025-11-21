import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import * as Sentry from '@sentry/node';
import config from './config/env';
import { connectDatabase } from './config/database';
import { initializeHederaClient } from './config/hedera';
import logger, { stream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import analyticsRoutes from './routes/analytics.routes';
import retirementRoutes from './routes/retirement.routes';
import methodologyRoutes from './routes/methodology.routes';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import creditRoutes from './routes/credit.routes';
import transactionRoutes from './routes/transaction.routes';
import auditRoutes from './routes/audit.routes';
import marketplaceRoutes from './routes/marketplace.routes';

const app: Application = express();
const PORT = config.port;


// Initialize Sentry (if configured)
if (config.sentryDsn) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.sentryEnvironment,
    tracesSampleRate: 1.0,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/analytics', analyticsRoutes);
app.use('/api/retirement', retirementRoutes);
app.use('/api/methodologies', methodologyRoutes);

// Logging
app.use(morgan('combined', { stream }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', apiLimiter, projectRoutes);
app.use('/api/credits', apiLimiter, creditRoutes);
app.use('/api/transactions', apiLimiter, transactionRoutes);
app.use('/api/audits', apiLimiter, auditRoutes);
app.use('/api/marketplace', apiLimiter, marketplaceRoutes);

// Sentry error handler (if configured)
if (config.sentryDsn) {
  app.use(Sentry.Handlers.errorHandler());
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('Connected to MongoDB');

    // Initialize Hedera client
    initializeHederaClient();
    logger.info('Hedera client initialized');

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Exit process in production
  if (config.nodeEnv === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // Exit process
  process.exit(1);
});

// Start the server
startServer();

export default app;
