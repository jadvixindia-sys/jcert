import type { Request, Response } from 'express';
import { galleryService } from '../services/gallery.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';
import { ApiError } from '../utils/ApiError';

export const galleryController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await galleryService.list());
  }),

  upload: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest('No file provided');
    return ok(res, await galleryService.create(req.file), 201);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await galleryService.remove(req.params.id);
    return ok(res, { message: 'Image deleted' });
  }),
};
