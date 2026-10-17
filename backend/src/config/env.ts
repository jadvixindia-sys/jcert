import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Central, validated configuration. The process refuses to boot if a required
 * variable is missing or malformed — no silent fallbacks to insecure defaults.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('2h'),
  COOKIE_NAME: z.string().default('jadvix_session'),
  // Cookie security. Leave unset to follow NODE_ENV (secure in production).
  // Set COOKIE_SECURE=false when serving over plain HTTP (e.g. an Elastic IP
  // before SSL is configured), otherwise the browser will not send the cookie.
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),

  CLIENT_ORIGIN: z.string().url().default('http://localhost:3000'),

  BCRYPT_COST: z.coerce.number().int().min(10).max(15).default(12),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  LOGIN_LOCK_MINUTES: z.coerce.number().int().positive().default(15),

  PUBLIC_API_URL: z.string().url().default('http://localhost:8000'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
