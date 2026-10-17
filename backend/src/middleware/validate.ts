import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Validates and COERCES req.body/params/query against a zod schema. On success
 * the parsed (sanitized) values replace the originals so handlers get clean data.
 */
export const validate =
  (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        path: i.path.slice(1).join('.') || i.path.join('.'),
        message: i.message,
      }));
      return next(ApiError.badRequest('Validation failed', details));
    }

    const data = result.data as { body?: unknown; params?: unknown; query?: unknown };
    if (data.body !== undefined) req.body = data.body;
    if (data.params !== undefined) req.params = data.params as Request['params'];
    // Note: req.query is read-only in some Express versions; we attach parsed copy.
    if (data.query !== undefined) (req as unknown as { validatedQuery: unknown }).validatedQuery = data.query;
    return next();
  };
