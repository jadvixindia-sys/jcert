import type { Response } from 'express';

/** Uniform success envelope: { success: true, data }. */
export function ok<T>(res: Response, data: T, status = 200): Response {
  return res.status(status).json({ success: true, data });
}
