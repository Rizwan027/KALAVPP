import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

export class ReviewController {
  /**
   * Create review
   * POST /api/v1/reviews
   */
  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const review = await ReviewService.createReview(req.user.id, req.body);
      return ApiResponse.created(res, review, 'Review created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get reviews
   * GET /api/v1/reviews
   */
  static async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReviewService.getReviews(req.query);
      return ApiResponse.success(res, result, 'Reviews retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get review by ID
   * GET /api/v1/reviews/:id
   */
  static async getReview(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await ReviewService.getReviewById(req.params.id);
      return ApiResponse.success(res, review, 'Review retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update review
   * PUT /api/v1/reviews/:id
   */
  static async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const review = await ReviewService.updateReview(
        req.params.id,
        req.user.id,
        req.body
      );
      return ApiResponse.success(res, review, 'Review updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete review
   * DELETE /api/v1/reviews/:id
   */
  static async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const isAdmin = req.user.role === 'ADMIN';
      const result = await ReviewService.deleteReview(req.params.id, req.user.id, isAdmin);
      return ApiResponse.success(res, result, 'Review deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's reviews
   * GET /api/v1/reviews/my-reviews
   */
  static async getMyReviews(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const reviews = await ReviewService.getUserReviews(req.user.id);
      return ApiResponse.success(res, reviews, 'User reviews retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
