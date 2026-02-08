import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate';
import { ReviewController } from '../controllers/review.controller';
import { validateZod } from '../middlewares/validate';
import {
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
  getReviewsSchema,
} from '../validators/review.validator';

const router = Router();

/**
 * Get reviews (with filters)
 * GET /api/v1/reviews
 */
router.get(
  '/',
  validateZod(getReviewsSchema),
  ReviewController.getReviews
);

/**
 * Get user's reviews
 * GET /api/v1/reviews/my-reviews
 */
router.get(
  '/my-reviews',
  authenticate,
  ReviewController.getMyReviews
);

/**
 * Get review by ID
 * GET /api/v1/reviews/:id
 */
router.get(
  '/:id',
  ReviewController.getReview
);

/**
 * Create review
 * POST /api/v1/reviews
 */
router.post(
  '/',
  authenticate,
  validateZod(createReviewSchema),
  ReviewController.createReview
);

/**
 * Update review
 * PUT /api/v1/reviews/:id
 */
router.put(
  '/:id',
  authenticate,
  validateZod(updateReviewSchema),
  ReviewController.updateReview
);

/**
 * Delete review
 * DELETE /api/v1/reviews/:id
 */
router.delete(
  '/:id',
  authenticate,
  validateZod(deleteReviewSchema),
  ReviewController.deleteReview
);

export default router;
