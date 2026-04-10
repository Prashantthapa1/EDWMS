import { Router } from "express";
import { Validate } from "src/middlewares/validation.middleware.js";
import { categoryController } from "./category.controller.js";
import { authenticate } from "@auth/auth.middleware.js";
import { 
    createCategorySchema, 
    updateCategorySchema, 
    categoryIdSchema 
} from "src/validations/category.validation.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all active categories (for dropdowns)
router.get('/active', categoryController.getAllActive);

// Get category stats
router.get('/stats', categoryController.getStats);

// Get all categories with filters/pagination
router.get('/', categoryController.getAll);

// Get category by ID
router.get('/:id', 
    Validate(categoryIdSchema),
    categoryController.getById
);

// Create new category
router.post('/', 
    Validate(createCategorySchema),
    categoryController.create
);

// Update category
router.put('/:id', 
    Validate(updateCategorySchema),
    categoryController.update
);

// Toggle category active status
router.patch('/:id/toggle-active',
    Validate(categoryIdSchema),
    categoryController.toggleActive
);

// Delete category
router.delete('/:id',
    Validate(categoryIdSchema),
    categoryController.delete
);

export default router;
