import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { JWTPayload, IUser } from '../types';
import config from '../config/env';
import User from '../models/User.model';
import { UnauthorizedError, BadRequestError } from '../utils/errors';

export class AuthService {
  // Generate access token
  static generateAccessToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const options: SignOptions = {
      expiresIn: config.jwtExpire as any,
    };
    return jwt.sign(payload, config.jwtSecret, options);
  }

  // Generate refresh token
  static generateRefreshToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const options: SignOptions = {
      expiresIn: config.jwtRefreshExpire as any,
    };
    return jwt.sign(payload, config.jwtRefreshSecret, options);
  }

  // Generate both tokens
  static async generateTokens(user: IUser): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in database
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: refreshToken },
    });

    return { accessToken, refreshToken };
  }

  // Verify refresh token and generate new access token
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as JWTPayload;

      // Find user and verify refresh token exists
      const user = await User.findById(decoded.userId).select('+refreshTokens');

      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      if (!user.refreshTokens.includes(refreshToken)) {
        throw new UnauthorizedError('Refresh token not found or expired');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token expired');
      }
      throw error;
    }
  }

  // Revoke refresh token (logout)
  static async revokeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  }

  // Revoke all refresh tokens (logout from all devices)
  static async revokeAllRefreshTokens(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] },
    });
  }

  // Generate password reset token
  static async generatePasswordResetToken(email: string): Promise<string> {
    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new BadRequestError('No user found with that email');
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and save to database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    return resetToken;
  }

  // Verify password reset token and reset password
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Revoke all refresh tokens for security
    await this.revokeAllRefreshTokens(user._id.toString());
  }

  // Change password
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new BadRequestError('User not found');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Revoke all refresh tokens for security
    await this.revokeAllRefreshTokens(userId);
  }
}

export default AuthService;
