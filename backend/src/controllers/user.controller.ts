import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model';
import ApiResponseUtil from '../utils/response';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class UserController {
  // Get current user profile
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user?._id);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      ApiResponseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  // Update current user profile
  static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firstName, lastName, hederaAccountId, hederaPublicKey } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          firstName,
          lastName,
          hederaAccountId,
          hederaPublicKey,
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new NotFoundError('User not found');
      }

      ApiResponseUtil.success(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID (admin only)
  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      ApiResponseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  // List all users (admin only)
  static async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(),
      ]);

      ApiResponseUtil.paginated(res, users, page, total, limit);
    } catch (error) {
      next(error);
    }
  }

  // Update user role (admin only)
  static async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.body;
      const userId = req.params.id;

      // Prevent admin from changing their own role
      if (userId === req.user?._id) {
        throw new ForbiddenError('Cannot change your own role');
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new NotFoundError('User not found');
      }

      ApiResponseUtil.success(res, user, 'User role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Deactivate user (admin only)
  static async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;

      // Prevent admin from deactivating themselves
      if (userId === req.user?._id) {
        throw new ForbiddenError('Cannot deactivate your own account');
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      );

      if (!user) {
        throw new NotFoundError('User not found');
      }

      ApiResponseUtil.success(res, user, 'User deactivated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
