import { body, param, query, ValidationChain } from 'express-validator';
import { UserRole, ProjectStatus } from '../types';

// User validation rules
export const registerValidation: ValidationChain[] = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and number'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('role').optional().isIn(Object.values(UserRole)).withMessage('Invalid role'),
];

export const loginValidation: ValidationChain[] = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidation: ValidationChain[] = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('hederaAccountId')
    .optional()
    .matches(/^0\.0\.\d+$/)
    .withMessage('Invalid Hedera account ID format'),
];

// Project validation rules
export const createProjectValidation: ValidationChain[] = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location.country').trim().notEmpty().withMessage('Country is required'),
  body('location.region').trim().notEmpty().withMessage('Region is required'),
  body('location.coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('location.coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1 metric ton'),
  body('methodology').trim().notEmpty().withMessage('Methodology is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
];

export const updateProjectValidation: ValidationChain[] = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('status')
    .optional()
    .isIn(Object.values(ProjectStatus))
    .withMessage('Invalid project status'),
];

// Credit validation rules
export const mintCreditValidation: ValidationChain[] = [
  body('projectId').isMongoId().withMessage('Invalid project ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('metadata.vintage')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Invalid vintage year'),
  body('metadata.methodology').trim().notEmpty().withMessage('Methodology is required'),
  body('metadata.verificationStandard')
    .trim()
    .notEmpty()
    .withMessage('Verification standard is required'),
];

export const retireCreditValidation: ValidationChain[] = [
  param('id').isMongoId().withMessage('Invalid credit ID'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

// Listing validation rules
export const createListingValidation: ValidationChain[] = [
  body('creditId').isMongoId().withMessage('Invalid credit ID'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Invalid currency code'),
  body('expiresAt').optional().isISO8601().withMessage('Valid expiration date is required'),
];

export const purchaseListingValidation: ValidationChain[] = [
  param('id').isMongoId().withMessage('Invalid listing ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

// Audit validation rules
export const createAuditValidation: ValidationChain[] = [
  body('projectId').isMongoId().withMessage('Invalid project ID'),
  body('findings').optional().trim(),
  body('verifiedCapacity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Verified capacity must be non-negative'),
];

export const updateAuditValidation: ValidationChain[] = [
  param('id').isMongoId().withMessage('Invalid audit ID'),
  body('findings').optional().trim(),
  body('verifiedCapacity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Verified capacity must be non-negative'),
  body('recommendations').optional().isArray().withMessage('Recommendations must be an array'),
];

// Pagination validation
export const paginationValidation: ValidationChain[] = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().trim(),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
];

// MongoDB ID validation
export const mongoIdValidation = [param('id').isMongoId().withMessage('Invalid ID format')];

// Hedera account ID validation
export const hederaAccountIdValidation = [
  body('hederaAccountId')
    .matches(/^0\.0\.\d+$/)
    .withMessage('Invalid Hedera account ID format'),
];
