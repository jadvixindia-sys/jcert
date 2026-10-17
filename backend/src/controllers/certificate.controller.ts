import type { Request, Response } from 'express';
import { certificateService } from '../services/certificate.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';

export const certificateController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await certificateService.list());
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    return ok(res, await certificateService.create(req.body), 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    return ok(res, await certificateService.update(req.params.id, req.body));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await certificateService.remove(req.params.id);
    return ok(res, { message: 'Certificate deleted' });
  }),

  bulk: asyncHandler(async (req: Request, res: Response) => {
    const count = await certificateService.bulkCreate(req.body.certificates);
    return ok(res, { count }, 201);
  }),
};
