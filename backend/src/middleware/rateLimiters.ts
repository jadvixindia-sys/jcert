import rateLimit from 'express-rate-limit';

const message = (msg: string) => ({ success: false, error: { message: msg } });

/** Broad safety net for the whole API. */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Too many requests. Please slow down.'),
});

/** Strict limiter for public certificate verification. */
export const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Too many verification attempts. Please wait a minute.'),
});

/** Very strict limiter for authentication to blunt credential stuffing. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: message('Too many login attempts. Please try again later.'),
});
