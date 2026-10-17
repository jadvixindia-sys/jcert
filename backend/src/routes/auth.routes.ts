import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiters';
import { loginSchema, updateProfileSchema } from '../validators';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);
router.patch('/profile', requireAuth, validate(updateProfileSchema), authController.updateProfile);

export default router;
