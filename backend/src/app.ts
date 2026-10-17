import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgan from 'morgan';
import path from 'path';

import { env, isProd } from './config/env';
import apiRoutes from './routes';
import { globalLimiter } from './middleware/rateLimiters';
import { errorHandler, notFound } from './middleware/errorHandler';
import { UPLOAD_DIR } from './middleware/upload';

export function createApp() {
  const app = express();

  // Behind Nginx/Cloud proxy in production — needed for correct client IPs.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Security headers. Allow images to be embedded cross-origin by the frontend.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS locked to the known frontend origin, with credentials for the cookie.
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );

  app.use(compression());
  // Generous body limit so large CSV bulk imports aren't rejected.
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());

  // Injection / pollution defence.
  app.use(mongoSanitize());
  app.use(hpp());

  if (!isProd) app.use(morgan('dev'));

  app.use(globalLimiter);

  // Static uploads (gallery + branding assets).
  app.use(
    '/uploads',
    express.static(UPLOAD_DIR, {
      maxAge: '7d',
      immutable: true,
      fallthrough: true,
    })
  );

  // Serve favicon convenience path.
  app.get('/', (_req, res) => {
    res.json({ success: true, data: { service: 'Jadvix Certificate API', docs: '/api/health' } });
  });

  app.use('/api', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

// Silence unused import in some toolchains.
export const _uploadRoot = path.resolve(UPLOAD_DIR);
