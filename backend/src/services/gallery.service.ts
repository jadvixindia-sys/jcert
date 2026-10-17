import fs from 'fs/promises';
import path from 'path';
import { Gallery } from '../models/Gallery';
import { UPLOAD_DIR } from '../middleware/upload';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export const galleryService = {
  list() {
    return Gallery.find().sort({ createdAt: -1 }).lean();
  },

  create(file: Express.Multer.File) {
    return Gallery.create({
      fileName: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
    });
  },

  async remove(id: string) {
    const item = await Gallery.findById(id);
    if (!item) throw ApiError.notFound('Image not found');

    // Best-effort disk cleanup; the DB record removal is authoritative.
    const filePath = path.join(UPLOAD_DIR, path.basename(item.url));
    try {
      await fs.unlink(filePath);
    } catch (err) {
      logger.warn('Gallery file already missing on disk', { filePath, err: String(err) });
    }

    await item.deleteOne();
  },
};
