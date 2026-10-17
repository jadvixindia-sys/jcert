import type { Request, Response } from 'express';
import { settingsService } from '../services/settings.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';

export const settingsController = {
  // Public read — powers header/footer branding + favicon on the frontend.
  getPublic: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await settingsService.get());
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    return ok(res, await settingsService.update(req.body));
  }),
};
