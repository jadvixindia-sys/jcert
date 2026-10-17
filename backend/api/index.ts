import type { Request, Response } from 'express';
import { createApp } from '../src/app';
import { connectDatabase } from '../src/config/db';

let appInstance: ReturnType<typeof createApp> | null = null;

export default async function handler(req: Request, res: Response) {
  await connectDatabase();
  if (!appInstance) {
    appInstance = createApp();
  }
  return appInstance(req, res);
}
