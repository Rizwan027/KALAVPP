import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/profile', (req, res) => {
  res.json({ message: 'Get user profile - To be implemented' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile - To be implemented' });
});

export default router;
