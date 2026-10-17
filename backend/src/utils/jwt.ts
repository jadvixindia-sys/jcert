import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface SessionPayload {
  sub: string; // admin id
  email: string;
  name: string;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  } as SignOptions);
}

export function verifySession(token: string): SessionPayload {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as SessionPayload;
}
