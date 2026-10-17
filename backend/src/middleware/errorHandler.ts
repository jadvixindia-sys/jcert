import type { Request, Response, NextFunction } from 'express';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import multer from 'multer';
import { ApiError } from '../utils/ApiError';
import { isProd } from '../config/env';
import { logger } from '../utils/logger';

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound('Route not found'));
}

/** Central error translator — never leaks stack traces or internals to clients. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof ApiError) {
    status = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5 MB)' : 'Upload failed';
  } else if (err instanceof MongooseError.ValidationError) {
    status = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } else if (err instanceof MongooseError.CastError) {
    status = 400;
    message = 'Invalid identifier';
  } else if (err instanceof MongoServerError && err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern ?? {})[0] ?? 'field';
    message = `A record with this ${field} already exists`;
  }

  if (status >= 500) logger.error('Unhandled error', err);

  res.status(status).json({
    success: false,
    error: {
      message,
      ...(details ? { details } : {}),
      ...(!isProd && status >= 500 && err instanceof Error ? { stack: err.stack } : {}),
    },
  });
}
