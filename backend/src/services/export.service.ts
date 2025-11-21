import { Parser } from 'json2csv';
import Project from '../models/Project.model';
import Credit from '../models/Credit.model';
import Transaction from '../models/Transaction.model';
import Listing from '../models/Listing.model';
import logger from '../utils/logger';

export class ExportService {
  /**
   * Export projects to CSV
   * @param filter MongoDB filter
   * @returns CSV string
   */
  static async exportProjectsToCSV(filter: any = {}): Promise<string> {
    try {
      const projects = await Project.find(filter)
        .populate('owner', 'firstName lastName email')
        .lean();

      const fields = [
        { label: 'ID', value: '_id' },
        { label: 'Name', value: 'name' },
        { label: 'Description', value: 'description' },
        { label: 'Owner', value: 'owner.email' },
        { label: 'Country', value: 'location.country' },
        { label: 'Region', value: 'location.region' },
        { label: 'Methodology', value: 'methodology' },
        { label: 'Capacity (tons)', value: 'capacity' },
        { label: 'Verified Capacity (tons)', value: 'verifiedCapacity' },
        { label: 'Status', value: 'status' },
        { label: 'Start Date', value: 'startDate' },
        { label: 'Created At', value: 'createdAt' },
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(projects);

      logger.info('Projects exported to CSV', { count: projects.length });
      return csv;
    } catch (error: any) {
      logger.error('Failed to export projects to CSV:', error);
      throw new Error('Export failed');
    }
  }

  /**
   * Export credits to CSV
   * @param filter MongoDB filter
   * @returns CSV string
   */
  static async exportCreditsToCSV(filter: any = {}): Promise<string> {
    try {
      const credits = await Credit.find(filter)
        .populate('owner', 'firstName lastName email')
        .populate('projectId', 'name methodology')
        .lean();

      const fields = [
        { label: 'ID', value: '_id' },
        { label: 'Token ID', value: 'tokenId' },
        { label: 'Serial Number', value: 'serialNumber' },
        { label: 'Project', value: 'projectId.name' },
        { label: 'Owner', value: 'owner.email' },
        { label: 'Quantity (tons)', value: 'quantity' },
        { label: 'Status', value: 'status' },
        { label: 'Vintage', value: 'metadata.vintage' },
        { label: 'Methodology', value: 'metadata.methodology' },
        { label: 'Verification Standard', value: 'metadata.verificationStandard' },
        { label: 'Mint Transaction', value: 'mintTransactionId' },
        { label: 'Created At', value: 'createdAt' },
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(credits);

      logger.info('Credits exported to CSV', { count: credits.length });
      return csv;
    } catch (error: any) {
      logger.error('Failed to export credits to CSV:', error);
      throw new Error('Export failed');
    }
  }

  /**
   * Export transactions to CSV
   * @param filter MongoDB filter
   * @returns CSV string
   */
  static async exportTransactionsToCSV(filter: any = {}): Promise<string> {
    try {
      const transactions = await Transaction.find(filter)
        .populate('userId', 'firstName lastName email')
        .populate('creditId', 'tokenId serialNumber')
        .populate('projectId', 'name')
        .lean();

      const fields = [
        { label: 'ID', value: '_id' },
        { label: 'Hedera Transaction ID', value: 'hederaTransactionId' },
        { label: 'Type', value: 'type' },
        { label: 'Status', value: 'status' },
        { label: 'User', value: 'userId.email' },
        { label: 'Credit Token ID', value: 'creditId.tokenId' },
        { label: 'Project', value: 'projectId.name' },
        { label: 'From', value: 'from' },
        { label: 'To', value: 'to' },
        { label: 'Amount', value: 'amount' },
        { label: 'Fee', value: 'fee' },
        { label: 'Created At', value: 'createdAt' },
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(transactions);

      logger.info('Transactions exported to CSV', { count: transactions.length });
      return csv;
    } catch (error: any) {
      logger.error('Failed to export transactions to CSV:', error);
      throw new Error('Export failed');
    }
  }

  /**
   * Export marketplace listings to CSV
   * @param filter MongoDB filter
   * @returns CSV string
   */
  static async exportListingsToCSV(filter: any = {}): Promise<string> {
    try {
      const listings = await Listing.find(filter)
        .populate('sellerId', 'firstName lastName email')
        .populate('buyerId', 'firstName lastName email')
        .populate('creditId', 'tokenId serialNumber')
        .lean();

      const fields = [
        { label: 'ID', value: '_id' },
        { label: 'Credit Token ID', value: 'creditId.tokenId' },
        { label: 'Seller', value: 'sellerId.email' },
        { label: 'Buyer', value: 'buyerId.email' },
        { label: 'Price', value: 'price' },
        { label: 'Currency', value: 'currency' },
        { label: 'Quantity', value: 'quantity' },
        { label: 'Remaining Quantity', value: 'remainingQuantity' },
        { label: 'Status', value: 'status' },
        { label: 'Created At', value: 'createdAt' },
        { label: 'Purchased At', value: 'purchasedAt' },
        { label: 'Expires At', value: 'expiresAt' },
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(listings);

      logger.info('Listings exported to CSV', { count: listings.length });
      return csv;
    } catch (error: any) {
      logger.error('Failed to export listings to CSV:', error);
      throw new Error('Export failed');
    }
  }

  /**
   * Export data to JSON
   * @param model Model name
   * @param filter MongoDB filter
   * @returns JSON string
   */
  static async exportToJSON(model: string, filter: any = {}): Promise<string> {
    try {
      let data;

      switch (model) {
        case 'projects':
          data = await Project.find(filter).populate('owner', 'firstName lastName email').lean();
          break;
        case 'credits':
          data = await Credit.find(filter)
            .populate('owner', 'firstName lastName email')
            .populate('projectId', 'name')
            .lean();
          break;
        case 'transactions':
          data = await Transaction.find(filter)
            .populate('userId', 'firstName lastName email')
            .lean();
          break;
        case 'listings':
          data = await Listing.find(filter)
            .populate('sellerId', 'firstName lastName email')
            .populate('creditId', 'tokenId')
            .lean();
          break;
        default:
          throw new Error(`Unknown model: ${model}`);
      }

      const json = JSON.stringify(data, null, 2);
      logger.info('Data exported to JSON', { model, count: data.length });
      
      return json;
    } catch (error: any) {
      logger.error('Failed to export to JSON:', error);
      throw new Error('Export failed');
    }
  }

  /**
   * Generate analytics report
   * @returns Analytics data
   */
  static async generateAnalyticsReport(): Promise<any> {
    try {
      const [
        totalProjects,
        activeProjects,
        totalCredits,
        activeCredits,
        retiredCredits,
        totalTransactions,
        activeListings,
      ] = await Promise.all([
        Project.countDocuments(),
        Project.countDocuments({ status: 'active' }),
        Credit.countDocuments(),
        Credit.countDocuments({ status: 'active' }),
        Credit.countDocuments({ status: 'retired' }),
        Transaction.countDocuments(),
        Listing.countDocuments({ status: 'active' }),
      ]);

      // Aggregate carbon offset by methodology
      const carbonByMethodology = await Project.aggregate([
        {
          $group: {
            _id: '$methodology',
            totalCapacity: { $sum: '$capacity' },
            verifiedCapacity: { $sum: '$verifiedCapacity' },
            projectCount: { $sum: 1 },
          },
        },
        {
          $sort: { totalCapacity: -1 },
        },
      ]);

      // Aggregate credits by vintage
      const creditsByVintage = await Credit.aggregate([
        {
          $group: {
            _id: '$metadata.vintage',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
          },
        },
        {
          $sort: { _id: -1 },
        },
      ]);

      // Transaction volume by type
      const transactionsByType = await Transaction.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
      ]);

      const report = {
        summary: {
          totalProjects,
          activeProjects,
          totalCredits,
          activeCredits,
          retiredCredits,
          totalTransactions,
          activeListings,
        },
        carbonByMethodology,
        creditsByVintage,
        transactionsByType,
        generatedAt: new Date(),
      };

      logger.info('Analytics report generated');
      return report;
    } catch (error: any) {
      logger.error('Failed to generate analytics report:', error);
      throw new Error('Analytics generation failed');
    }
  }
}

export default ExportService;
