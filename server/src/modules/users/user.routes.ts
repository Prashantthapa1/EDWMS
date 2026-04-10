import { Router } from "express";
import { Validate } from "src/middlewares/validation.middleware.js";
import { userController } from "./user.controller.js";
import { authenticate } from "@auth/auth.middleware.js";
import { 
    createUserSchema, 
    updateUserSchema, 
    userIdSchema,
    toggleActiveSchema 
} from "src/validations/user.validation.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all roles (for dropdowns)
router.get('/roles', userController.getRoles);

// Get all departments (for dropdowns)
router.get('/departments', userController.getDepartments);

// Get user stats
router.get('/stats', userController.getStats);

// Get all users with filters/pagination
router.get('/', userController.getAll);

// Get user by ID
router.get('/:id', 
    Validate(userIdSchema),
    userController.getById
);

// Create new user
router.post('/', 
    Validate(createUserSchema),
    userController.create
);

// Update user
router.put('/:id', 
    Validate(updateUserSchema),
    userController.update
);

// Toggle user active status
router.patch('/:id/toggle-active',
    Validate(toggleActiveSchema),
    userController.toggleActive
);

// Delete user
router.delete('/:id',
    Validate(userIdSchema),
    userController.delete
);

export default router;
