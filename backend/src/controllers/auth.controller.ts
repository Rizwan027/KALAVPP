import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

export class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return ApiResponse.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      return ApiResponse.success(res, tokens, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.logout(refreshToken);
      return ApiResponse.success(res, result, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }
      return ApiResponse.success(res, req.user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password
   * POST /api/v1/auth/forgot-password
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   * POST /api/v1/auth/reset-password
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      const result = await AuthService.resetPassword(token, password);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
