import mongoose from 'mongoose';
import User from '../models/User.model';
import Project from '../models/Project.model';
import Credit from '../models/Credit.model';
import Transaction from '../models/Transaction.model';
import Audit from '../models/Audit.model';
import Listing from '../models/Listing.model';
import { connectDatabase } from '../config/database';
import { UserRole, ProjectStatus, CreditStatus, TransactionStatus, TransactionType, AuditStatus, ListingStatus, KYCStatus } from '../types';
import logger from '../utils/logger';

/**
 * Seed database with sample data
 */
async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    logger.info('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Credit.deleteMany({}),
      Transaction.deleteMany({}),
      Audit.deleteMany({}),
      Listing.deleteMany({}),
    ]);

    // Create Users
    logger.info('Creating users...');
    const users = await User.insertMany([
      {
        email: 'admin@impactmint.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        hederaAccountId: '0.0.1001',
        isEmailVerified: true,
        isActive: true,
        kyc: { status: KYCStatus.APPROVED, documents: [] },
        permissions: ['all'],
      },
      {
        email: 'developer@example.com',
        password: 'Developer123!',
        firstName: 'John',
        lastName: 'Developer',
        role: UserRole.PROJECT_DEVELOPER,
        hederaAccountId: '0.0.1002',
        organization: {
          name: 'GreenTech Solutions',
          type: 'company' as any,
          website: 'https://greentech.example.com',
        },
        isEmailVerified: true,
        isActive: true,
        kyc: { status: KYCStatus.APPROVED, documents: [] },
        permissions: ['create_project', 'mint_credits'],
      },
      {
        email: 'auditor@example.com',
        password: 'Auditor123!',
        firstName: 'Jane',
        lastName: 'Auditor',
        role: UserRole.AUDITOR,
        hederaAccountId: '0.0.1003',
        organization: {
          name: 'Carbon Verification Services',
          type: 'company' as any,
        },
        isEmailVerified: true,
        isActive: true,
        kyc: { status: KYCStatus.APPROVED, documents: [] },
        permissions: ['audit_projects'],
      },
      {
        email: 'buyer@example.com',
        password: 'Buyer123!',
        firstName: 'Alice',
        lastName: 'Buyer',
        role: UserRole.BUYER,
        hederaAccountId: '0.0.1004',
        isEmailVerified: true,
        isActive: true,
        kyc: { status: KYCStatus.APPROVED, documents: [] },
        permissions: ['purchase_credits'],
      },
      {
        email: 'buyer2@example.com',
        password: 'Buyer123!',
        firstName: 'Bob',
        lastName: 'Corporate',
        role: UserRole.BUYER,
        hederaAccountId: '0.0.1005',
        organization: {
          name: 'Eco Corporation',
          type: 'company' as any,
          taxId: 'US-123456789',
        },
        isEmailVerified: true,
        isActive: true,
        kyc: { status: KYCStatus.PENDING, documents: [] },
        permissions: ['purchase_credits'],
      },
    ]);

    logger.info(`Created ${users.length} users`);

    // Create Projects
    logger.info('Creating projects...');
    const projects = await Project.insertMany([
      {
        name: 'Amazon Rainforest Conservation',
        description: 'Protecting 10,000 hectares of Amazon rainforest from deforestation through community-based conservation.',
        owner: users[1]._id, // Project Developer
        location: {
          country: 'Brazil',
          region: 'Amazonas',
          address: 'Manaus, Amazonas, Brazil',
          geometry: {
            type: 'Point',
            coordinates: [-60.0217, -3.1190], // [longitude, latitude]
          },
        },
        capacity: 50000,
        verifiedCapacity: 45000,
        methodology: 'REDD+ (Avoided Deforestation)',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2028-12-31'),
        status: ProjectStatus.ACTIVE,
        documents: [
          {
            name: 'Project Design Document',
            url: 'https://example.com/docs/project1-pdd.pdf',
            uploadedAt: new Date(),
          },
        ],
        images: ['https://example.com/images/amazon1.jpg'],
        metadata: {
          sdgGoals: [13, 15],
          biodiversityImpact: 'High',
          communityBenefit: '500+ families',
        },
      },
      {
        name: 'Solar Farm Development - India',
        description: 'Large-scale solar energy installation replacing coal-powered electricity generation.',
        owner: users[1]._id,
        location: {
          country: 'India',
          region: 'Rajasthan',
          address: 'Jodhpur, Rajasthan, India',
          geometry: {
            type: 'Point',
            coordinates: [73.0243, 26.2389],
          },
        },
        capacity: 30000,
        verifiedCapacity: 28000,
        methodology: 'REC-v1 (Renewable Energy)',
        startDate: new Date('2022-06-01'),
        endDate: new Date('2032-05-31'),
        status: ProjectStatus.ACTIVE,
        documents: [],
        images: [],
        metadata: {
          installedCapacity: '100 MW',
          annualGeneration: '150,000 MWh',
        },
      },
      {
        name: 'Mangrove Restoration - Philippines',
        description: 'Restoring coastal mangrove ecosystems for carbon sequestration and coastal protection.',
        owner: users[1]._id,
        location: {
          country: 'Philippines',
          region: 'Palawan',
          address: 'Puerto Princesa, Palawan, Philippines',
          geometry: {
            type: 'Point',
            coordinates: [118.7384, 9.7392],
          },
        },
        capacity: 15000,
        verifiedCapacity: null,
        methodology: 'ARR (Afforestation/Reforestation)',
        startDate: new Date('2024-01-01'),
        status: ProjectStatus.APPROVED,
        documents: [],
        images: [],
        metadata: {
          areaRestored: '500 hectares',
          speciesPlanted: 'Rhizophora, Avicennia',
        },
      },
      {
        name: 'Wind Energy Project - Texas',
        description: 'Wind turbine installation for clean energy generation.',
        owner: users[1]._id,
        location: {
          country: 'United States',
          region: 'Texas',
          address: 'Sweetwater, Texas, USA',
          geometry: {
            type: 'Point',
            coordinates: [-100.4065, 32.4707],
          },
        },
        capacity: 25000,
        methodology: 'REC-v1 (Renewable Energy)',
        startDate: new Date('2024-03-01'),
        status: ProjectStatus.PENDING_AUDIT,
        documents: [],
        images: [],
        metadata: {},
      },
      {
        name: 'Community Cookstove Program - Kenya',
        description: 'Distribution of efficient cookstoves to reduce firewood consumption and emissions.',
        owner: users[1]._id,
        location: {
          country: 'Kenya',
          region: 'Nairobi',
          geometry: {
            type: 'Point',
            coordinates: [36.8219, -1.2921],
          },
        },
        capacity: 8000,
        methodology: 'OPR-v1 (Other Emission Reductions)',
        startDate: new Date('2024-02-01'),
        status: ProjectStatus.DRAFT,
        documents: [],
        images: [],
        metadata: {
          householdsImpacted: '2000',
        },
      },
    ]);

    logger.info(`Created ${projects.length} projects`);

    // Create Audits
    logger.info('Creating audits...');
    const audits = await Audit.insertMany([
      {
        projectId: projects[0]._id,
        auditorId: users[2]._id, // Auditor
        status: AuditStatus.APPROVED,
        assignedAt: new Date('2023-02-01'),
        completedAt: new Date('2023-03-15'),
        findings: 'Project meets all requirements. Verified capacity: 45,000 tons CO2e.',
        verifiedCapacity: 45000,
        documents: [],
        recommendations: ['Maintain monitoring program', 'Annual reporting required'],
        approvalSignature: 'digital-signature-hash',
      },
      {
        projectId: projects[1]._id,
        auditorId: users[2]._id,
        status: AuditStatus.APPROVED,
        assignedAt: new Date('2022-08-01'),
        completedAt: new Date('2022-09-20'),
        findings: 'Solar installation verified. Capacity confirmed at 28,000 tons CO2e annually.',
        verifiedCapacity: 28000,
        documents: [],
        recommendations: [],
      },
      {
        projectId: projects[2]._id,
        auditorId: users[2]._id,
        status: AuditStatus.IN_PROGRESS,
        assignedAt: new Date('2024-02-01'),
        findings: 'Initial site visit completed. Documentation under review.',
        documents: [],
        recommendations: [],
      },
      {
        projectId: projects[3]._id,
        auditorId: users[2]._id,
        status: AuditStatus.PENDING,
        assignedAt: new Date('2024-03-15'),
        findings: '',
        documents: [],
        recommendations: [],
      },
    ]);

    logger.info(`Created ${audits.length} audits`);

    // Create Credits (NFTs)
    logger.info('Creating credits...');
    const credits = await Credit.insertMany([
      {
        projectId: projects[0]._id,
        tokenId: '0.0.5001',
        serialNumber: 1,
        owner: users[1]._id.toString(), // Project Developer
        quantity: 1,
        status: CreditStatus.ACTIVE,
        mintTransactionId: '0.0.1234@1234567890.123456789',
        metadata: {
          vintage: 2023,
          methodology: 'REDD+',
          verificationStandard: 'Verra VCS',
          additionalData: {
            projectName: 'Amazon Rainforest Conservation',
            country: 'Brazil',
          },
        },
        ipfsMetadataUrl: 'ipfs://QmExample1234567890',
      },
      {
        projectId: projects[0]._id,
        tokenId: '0.0.5001',
        serialNumber: 2,
        owner: users[3]._id.toString(), // Buyer
        quantity: 1,
        status: CreditStatus.ACTIVE,
        mintTransactionId: '0.0.1234@1234567890.123456790',
        metadata: {
          vintage: 2023,
          methodology: 'REDD+',
          verificationStandard: 'Verra VCS',
          additionalData: {},
        },
      },
      {
        projectId: projects[1]._id,
        tokenId: '0.0.5002',
        serialNumber: 1,
        owner: users[1]._id.toString(),
        quantity: 1,
        status: CreditStatus.ACTIVE,
        mintTransactionId: '0.0.1234@1234567890.123456791',
        metadata: {
          vintage: 2024,
          methodology: 'REC-v1',
          verificationStandard: 'Gold Standard',
          additionalData: {},
        },
      },
      {
        projectId: projects[1]._id,
        tokenId: '0.0.5002',
        serialNumber: 2,
        owner: users[4]._id.toString(), // Buyer 2
        quantity: 1,
        status: CreditStatus.RETIRED,
        mintTransactionId: '0.0.1234@1234567890.123456792',
        retireTransactionId: '0.0.1234@1234567890.999999999',
        metadata: {
          vintage: 2024,
          methodology: 'REC-v1',
          verificationStandard: 'Gold Standard',
          additionalData: {
            retiredBy: 'Eco Corporation',
            retirementReason: 'Corporate carbon neutrality',
          },
        },
      },
    ]);

    logger.info(`Created ${credits.length} credits`);

    // Create Transactions
    logger.info('Creating transactions...');
    const transactions = await Transaction.insertMany([
      {
        userId: users[1]._id.toString(),
        hederaTransactionId: '0.0.1234@1234567890.123456789',
        type: TransactionType.MINT,
        status: TransactionStatus.SUCCESS,
        projectId: projects[0]._id.toString(),
        to: users[1]._id.toString(),
        amount: 0,
        fee: 0.05,
      },
      {
        userId: users[1]._id.toString(),
        hederaTransactionId: '0.0.1234@1234567890.123456790',
        type: TransactionType.MINT,
        status: TransactionStatus.SUCCESS,
        projectId: projects[0]._id.toString(),
        to: users[1]._id.toString(),
        amount: 0,
        fee: 0.05,
      },
      {
        userId: users[3]._id.toString(),
        hederaTransactionId: '0.0.1234@1234567890.888888888',
        type: TransactionType.PURCHASE,
        status: TransactionStatus.SUCCESS,
        creditId: credits[1]._id.toString(),
        from: users[1]._id.toString(),
        to: users[3]._id.toString(),
        amount: 50,
        fee: 0.1,
      },
      {
        userId: users[4]._id.toString(),
        hederaTransactionId: '0.0.1234@1234567890.999999999',
        type: TransactionType.RETIRE,
        status: TransactionStatus.SUCCESS,
        creditId: credits[3]._id.toString(),
        from: users[4]._id.toString(),
        amount: 0,
        fee: 0.02,
      },
    ]);

    logger.info(`Created ${transactions.length} transactions`);

    // Create Marketplace Listings
    logger.info('Creating marketplace listings...');
    const listings = await Listing.insertMany([
      {
        creditId: credits[0]._id.toString(),
        sellerId: users[1]._id.toString(),
        price: 50,
        quantity: 1,
        remainingQuantity: 1,
        currency: 'USD',
        status: ListingStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        metadata: {},
      },
      {
        creditId: credits[2]._id.toString(),
        sellerId: users[1]._id.toString(),
        price: 60,
        quantity: 1,
        remainingQuantity: 1,
        currency: 'USD',
        status: ListingStatus.ACTIVE,
        metadata: {},
      },
      {
        creditId: credits[1]._id.toString(),
        sellerId: users[1]._id.toString(),
        buyerId: users[3]._id.toString(),
        price: 50,
        quantity: 1,
        remainingQuantity: 0,
        currency: 'USD',
        status: ListingStatus.SOLD,
        purchasedAt: new Date(),
        transactionId: transactions[2]._id.toString(),
        metadata: {},
      },
    ]);

    logger.info(`Created ${listings.length} listings`);

    logger.info('Database seeding completed successfully!');
    logger.info('\n--- Seeded Data Summary ---');
    logger.info(`Users: ${users.length}`);
    logger.info(`Projects: ${projects.length}`);
    logger.info(`Audits: ${audits.length}`);
    logger.info(`Credits: ${credits.length}`);
    logger.info(`Transactions: ${transactions.length}`);
    logger.info(`Listings: ${listings.length}`);
    logger.info('\n--- Test Credentials ---');
    logger.info('Admin: admin@impactmint.com / Admin123!');
    logger.info('Developer: developer@example.com / Developer123!');
    logger.info('Auditor: auditor@example.com / Auditor123!');
    logger.info('Buyer 1: buyer@example.com / Buyer123!');
    logger.info('Buyer 2: buyer2@example.com / Buyer123!');

    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
