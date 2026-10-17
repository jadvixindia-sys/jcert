import type { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';
import { env, isProd } from '../config/env';

const COOKIE_MAX_AGE = 2 * 60 * 60 * 1000; // 2h, matches JWT

const COOKIE_SECURE = env.COOKIE_SECURE ?? isProd;

function setSessionCookie(res: Response, token: string) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    // 'none' requires a secure cookie; fall back to 'lax' over plain HTTP.
    sameSite: env.COOKIE_SAMESITE === 'none' && !COOKIE_SECURE ? 'lax' : env.COOKIE_SAMESITE,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { token, admin } = await authService.login(email, password);
    setSessionCookie(res, token);
    return ok(res, { admin });
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie(env.COOKIE_NAME, { path: '/' });
    return ok(res, { message: 'Logged out' });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    return ok(res, { admin: req.admin });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const admin = await authService.updateProfile(req.admin!.sub, req.body);
    return ok(res, { admin });
  }),
};
