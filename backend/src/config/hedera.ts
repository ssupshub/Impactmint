import { Client, AccountId, PrivateKey, Hbar } from '@hashgraph/sdk';
import config from './env';
import logger from '../utils/logger';

let client: Client | null = null;

export const initializeHederaClient = (): Client => {
  try {
    if (client) {
      return client;
    }

    const operatorId = AccountId.fromString(config.hederaOperatorId);
    const operatorKey = PrivateKey.fromString(config.hederaOperatorKey);

    // Create client based on network
    if (config.hederaNetwork === 'mainnet') {
      client = Client.forMainnet();
    } else {
      client = Client.forTestnet();
    }

    // Set operator
    client.setOperator(operatorId, operatorKey);

    // Set default transaction parameters
    client.setDefaultMaxTransactionFee(new Hbar(1)); // 1 HBAR
    client.setDefaultMaxQueryPayment(new Hbar(0.5)); // 0.5 HBAR
    client.setMaxAttempts(3);

    logger.info('Hedera client initialized successfully', {
      network: config.hederaNetwork,
      operatorId: operatorId.toString(),
    });

    return client;
  } catch (error) {
    logger.error('Failed to initialize Hedera client:', error);
    throw error;
  }
};

export const getHederaClient = (): Client => {
  if (!client) {
    return initializeHederaClient();
  }
  return client;
};

export const closeHederaClient = (): void => {
  if (client) {
    client.close();
    client = null;
    logger.info('Hedera client closed');
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  closeHederaClient();
});

process.on('SIGTERM', () => {
  closeHederaClient();
});

export default { initializeHederaClient, getHederaClient, closeHederaClient };
