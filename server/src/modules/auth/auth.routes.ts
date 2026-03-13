import { Router } from "express";
import { Validate } from "src/middlewares/validation.middleware.js";
import { loginSchema, registerSchema } from "src/validations/auth.validation.js";
import { authController } from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";

const router = Router();

router.post('/register', 
    Validate(registerSchema),
    authController.register
);

router.post('/login', 
    Validate(loginSchema),
    authController.login
);

router.post('/refresh',
    authController.refresh
);

router.use(authenticate);

router.post('/logout',
    authController.logout
);

export default router;