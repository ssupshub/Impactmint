import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { UserRole } from '../types';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Specific role checkers
export const isAdmin = authorize(UserRole.ADMIN);
export const isProjectDeveloper = authorize(UserRole.PROJECT_DEVELOPER, UserRole.ADMIN);
export const isAuditor = authorize(UserRole.AUDITOR, UserRole.ADMIN);
export const isBuyer = authorize(UserRole.BUYER, UserRole.ADMIN);

// Check if user is owner or admin
export const isOwnerOrAdmin = (ownerField: string = 'owner') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Admins can access everything
      if (req.user.role === UserRole.ADMIN) {
        return next();
      }

      // Check if user is the owner
      const resourceOwnerId = (req.body as any)[ownerField] || (req.params as any)[ownerField];

      if (resourceOwnerId && resourceOwnerId !== req.user._id) {
        throw new ForbiddenError('You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
