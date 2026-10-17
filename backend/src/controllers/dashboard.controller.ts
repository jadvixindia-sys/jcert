import type { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';

export const dashboardController = {
  stats: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await dashboardService.stats());
  }),
};
