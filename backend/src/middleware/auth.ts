import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { verifySession, type SessionPayload } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: SessionPayload;
    }
  }
}

/**
 * Verifies the session JWT from the httpOnly cookie (falling back to a Bearer
 * header). Runs on EVERY protected route — defence in depth, not just an edge guard.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.[env.COOKIE_NAME];
  const header = req.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const token = cookieToken || bearer;

  if (!token) return next(ApiError.unauthorized('Authentication required'));

  try {
    req.admin = verifySession(token);
    return next();
  } catch {
    return next(ApiError.unauthorized('Session expired or invalid'));
  }
}
