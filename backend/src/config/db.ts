import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

mongoose.set('strictQuery', true);

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Establish a single shared connection. In serverless environments (Vercel),
 * connections are cached globally across function invocations.
 */
export async function connectDatabase(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
    mongoose.connection.on('error', (err) => logger.error('MongoDB error', err));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10_000,
        maxPoolSize: 10,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function disconnectDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
