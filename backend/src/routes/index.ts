import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './auth.routes';
import certificateRoutes from './certificate.routes';
import instituteRoutes from './institute.routes';
import galleryRoutes from './gallery.routes';
import { verifyController } from '../controllers/verify.controller';
import { settingsController } from '../controllers/settings.controller';
import { dashboardController } from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { verifyLimiter } from '../middleware/rateLimiters';
import { siteSettingsSchema, verifySchema } from '../validators';
import { ok } from '../utils/response';

const router = Router();

// ── Health ──────────────────────────────────────────────────────────────────
router.get('/health', (_req, res) =>
  ok(res, {
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  })
);

// ── Public ──────────────────────────────────────────────────────────────────
router.get('/verify/:orderId', verifyLimiter, validate(verifySchema), verifyController.byOrderId);
router.get('/site-settings', settingsController.getPublic);

// ── Admin (auth-gated) ──────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/admin/certificates', certificateRoutes);
router.use('/admin/institutes', instituteRoutes);
router.use('/admin/gallery', galleryRoutes);
router.get('/admin/dashboard/stats', requireAuth, dashboardController.stats);
router.put('/admin/settings/site', requireAuth, validate(siteSettingsSchema), settingsController.update);

export default router;
