import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import serviceRoutes from './service.routes';
import orderRoutes from './order.routes';
import vendorRoutes from './vendor.routes';
import adminRoutes from './admin.routes';
import categoryRoutes from './category.routes';
import cartRoutes from './cart.routes';
import uploadRoutes from './upload.routes';
import paymentRoutes from './payment.routes';
import reviewRoutes from './review.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/orders', orderRoutes);
router.use('/vendors', vendorRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/upload', uploadRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);

export default router;
