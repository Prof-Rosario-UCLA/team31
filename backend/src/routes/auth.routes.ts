import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { loginSchema, registerSchema, updateProfileSchema } from '../validators/auth.validators';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);

// Protected routes - need to be authenticated to access
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), AuthController.updateProfile);

export default router;