import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomBytes } from 'crypto';
import { ApiError } from '../utils/ApiError';

// In serverless environments (Vercel / Lambda), local disk is read-only except /tmp
export const UPLOAD_DIR =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join('/tmp', 'uploads')
    : path.join(process.cwd(), 'uploads');

try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch {
  // Gracefully ignore directory creation failure in restricted read-only environments
}

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-z0-9_-]/gi, '-')
      .slice(0, 40);
    cb(null, `${Date.now()}-${randomBytes(4).toString('hex')}-${safeBase}${ext}`);
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(ApiError.badRequest('Only PNG, JPG, WEBP or SVG images are allowed'));
  },
}).single('file');
