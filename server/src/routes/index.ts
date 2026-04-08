import { Router } from "express";
import authRoutes from '@auth/auth.routes.js'
import userRoutes from '@users/user.routes.js'
import categoryRoutes from 'src/modules/categories/category.routes.js'
import documentRoutes from 'src/modules/documents/document.routes.js'

const router = Router();

// Auth related routes
router.use('/auth', authRoutes);

// User management routes
router.use('/users', userRoutes);

// Category routes
router.use('/categories', categoryRoutes);

// Document routes
router.use('/documents', documentRoutes);

export default router;