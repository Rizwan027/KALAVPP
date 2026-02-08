import { UserRole, UserStatus } from '@prisma/client';
import prisma from '../config/database';
import ApiError from '../utils/ApiError';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokenPair } from '../utils/jwt';
import crypto from 'crypto';

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterInput) {
    const { email, password, name, firstName, lastName, role = UserRole.CUSTOMER } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Determine initial status based on role
    let status: UserStatus = UserStatus.ACTIVE;
    if (role === UserRole.VENDOR) {
      status = UserStatus.PENDING_APPROVAL;
    }

    // Use name field or construct from firstName/lastName
    const fullName = name || `${firstName || ''} ${lastName || ''}`.trim() || undefined;

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: fullName,
        firstName,
        lastName,
        role,
        status,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    // If vendor, create vendor profile
    if (role === UserRole.VENDOR) {
      await prisma.vendorProfile.create({
        data: {
          userId: user.id,
          businessName: fullName || email,
          approvalStatus: 'PENDING',
        },
      });
    }

    // Generate tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user,
      tokens,
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginInput) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Check if account is active
    if (user.status === UserStatus.SUSPENDED) {
      throw ApiError.forbidden('Your account has been suspended');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw ApiError.forbidden('Your account is inactive');
    }

    // Generate tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string) {
    // Find refresh token in database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      throw ApiError.unauthorized('Refresh token expired');
    }

    // Check if token is revoked
    if (tokenRecord.isRevoked) {
      throw ApiError.unauthorized('Refresh token revoked');
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role,
    });

    // Delete old refresh token
    await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        userId: tokenRecord.user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  /**
   * Logout user
   */
  static async logout(refreshToken: string) {
    // Delete refresh token
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if email exists or not
      return { message: 'If the email exists, a reset link will be sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    return { message: 'If the email exists, a reset link will be sent' };
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!tokenRecord) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: tokenRecord.id } });
      throw ApiError.badRequest('Reset token expired');
    }

    if (tokenRecord.used) {
      throw ApiError.badRequest('Reset token already used');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { used: true, usedAt: new Date() },
    });

    return { message: 'Password reset successfully' };
  }
}
