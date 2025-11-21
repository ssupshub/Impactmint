import TreasuryAccount from '../models/TreasuryAccount.model';
import HederaTokenService from '../services/hedera-token.service';
import logger from '../utils/logger';

export class TreasuryMonitorWorker {
    private static isRunning = false;
    private static intervalId: NodeJS.Timeout | null = null;
    private static readonly CHECK_INTERVAL = parseInt(process.env.TREASURY_MONITOR_INTERVAL || '3600000'); // 1 hour

    /**
     * Start the treasury monitor worker
     */
    static start(): void {
        if (this.isRunning) {
            logger.warn('Treasury monitor worker is already running');
            return;
        }

        this.isRunning = true;
        logger.info('Starting treasury monitor worker', { interval: this.CHECK_INTERVAL });

        // Run immediately on start
        this.checkBalances();

        // Then run on interval
        this.intervalId = setInterval(() => {
            this.checkBalances();
        }, this.CHECK_INTERVAL);
    }

    /**
     * Stop the treasury monitor worker
     */
    static stop(): void {
        if (!this.isRunning) {
            return;
        }

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isRunning = false;
        logger.info('Treasury monitor worker stopped');
    }

    /**
     * Check all treasury account balances
     */
    private static async checkBalances(): Promise<void> {
        try {
            const treasuries = await TreasuryAccount.find();

            for (const treasury of treasuries) {
                try {
                    await this.checkTreasuryBalance(treasury);
                } catch (error: any) {
                    logger.error('Failed to check treasury balance:', {
                        accountId: treasury.accountId,
                        error: error.message,
                    });
                }
            }
        } catch (error: any) {
            logger.error('Treasury monitor worker error:', error);
        }
    }

    /**
     * Check individual treasury balance
     */
    private static async checkTreasuryBalance(treasury: any): Promise<void> {
        const balanceInfo = await HederaTokenService.getTreasuryBalance(treasury.accountId);

        // Update balance in database
        treasury.balance = balanceInfo.hbar;
        treasury.lastBalanceCheck = new Date();
        await treasury.save();

        logger.info('Treasury balance checked', {
            accountId: treasury.accountId,
            balance: balanceInfo.hbar,
        });

        // Check if balance is below threshold
        if (balanceInfo.hbar < treasury.alertThreshold) {
            logger.warn('Treasury balance below threshold', {
                accountId: treasury.accountId,
                balance: balanceInfo.hbar,
                threshold: treasury.alertThreshold,
            });

            // Send alert (implement notification)
            await this.sendLowBalanceAlert(treasury, balanceInfo.hbar);
        }
    }

    /**
     * Send low balance alert
     */
    private static async sendLowBalanceAlert(treasury: any, currentBalance: number): Promise<void> {
        logger.warn('LOW BALANCE ALERT', {
            accountId: treasury.accountId,
            currentBalance,
            threshold: treasury.alertThreshold,
            methodology: treasury.methodology,
        });

        // TODO: Send email notification to admins
        // TODO: Send Slack/Discord notification
        // TODO: Trigger auto-refill if enabled
    }

    /**
     * Get treasury statistics
     */
    static async getStatistics(): Promise<{
        totalTreasuries: number;
        totalBalance: number;
        lowBalanceCount: number;
        totalNFTsMinted: number;
    }> {
        const treasuries = await TreasuryAccount.find();

        const stats = {
            totalTreasuries: treasuries.length,
            totalBalance: treasuries.reduce((sum, t) => sum + t.balance, 0),
            lowBalanceCount: treasuries.filter((t) => t.balance < t.alertThreshold).length,
            totalNFTsMinted: treasuries.reduce((sum, t) => {
                return sum + t.tokenCollections.reduce((colSum: number, col: any) => colSum + col.totalMinted, 0);
            }, 0),
        };

        return stats;
    }
}

export default TreasuryMonitorWorker;
