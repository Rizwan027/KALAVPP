import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { strictRateLimiter } from '../middlewares/rateLimiter';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/register', validate(registerValidator), AuthController.register);
router.post('/login', strictRateLimiter, validate(loginValidator), AuthController.login);
router.post('/refresh-token', validate(refreshTokenValidator), AuthController.refreshToken);
router.post('/forgot-password', strictRateLimiter, validate(forgotPasswordValidator), AuthController.forgotPassword);
router.post('/reset-password', validate(resetPasswordValidator), AuthController.resetPassword);

// Protected routes
router.get('/me', authenticate, AuthController.getCurrentUser);
router.post('/logout', authenticate, AuthController.logout);

export default router;
