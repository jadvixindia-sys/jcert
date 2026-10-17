import type { Request, Response } from 'express';
import { instituteService } from '../services/institute.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';

export const instituteController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await instituteService.list());
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    return ok(res, await instituteService.create(req.body), 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    return ok(res, await instituteService.update(req.params.id, req.body));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await instituteService.remove(req.params.id);
    return ok(res, { message: 'Institute deleted' });
  }),
};
