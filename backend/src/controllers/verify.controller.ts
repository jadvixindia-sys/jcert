import type { Request, Response } from 'express';
import { verifyService } from '../services/verify.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';

export const verifyController = {
  byOrderId: asyncHandler(async (req: Request, res: Response) => {
    return ok(res, await verifyService.byOrderId(req.params.orderId));
  }),
};
