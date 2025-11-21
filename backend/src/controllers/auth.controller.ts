import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model';
import AuthService from '../services/auth.service';
import ApiResponseUtil from '../utils/response';
import { BadRequestError, ConflictError } from '../utils/errors';

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Create user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      // Generate tokens
      const { accessToken, refreshToken } = await AuthService.generateTokens(user);

      ApiResponseUtil.created(res, {
        user,
        accessToken,
        refreshToken,
      }, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  // Login user
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user and verify password
      const user = await (User as any).findByCredentials(email, password);

      // Generate tokens
      const { accessToken, refreshToken } = await AuthService.generateTokens(user);

      ApiResponseUtil.success(res, {
        user,
        accessToken,
        refreshToken,
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new BadRequestError('Refresh token is required');
      }

      const { accessToken } = await AuthService.refreshAccessToken(refreshToken);

      ApiResponseUtil.success(res, { accessToken }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  // Logout user
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken && req.user) {
        await AuthService.revokeRefreshToken(req.user._id, refreshToken);
      }

      ApiResponseUtil.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  // Forgot password
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      const resetToken = await AuthService.generatePasswordResetToken(email);

      // In production, send email with reset token
      // For now, return it in response (ONLY FOR DEVELOPMENT)
      ApiResponseUtil.success(res, { resetToken }, 'Password reset token sent to email');
    } catch (error) {
      next(error);
    }
  }

  // Reset password
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new BadRequestError('Token and new password are required');
      }

      await AuthService.resetPassword(token, newPassword);

      ApiResponseUtil.success(res, null, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user?._id);

      if (!user) {
        throw new BadRequestError('User not found');
      }

      ApiResponseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
