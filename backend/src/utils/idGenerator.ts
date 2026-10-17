import { randomBytes } from 'crypto';

/** Base32-ish alphabet without ambiguous chars (no 0/O/1/I). */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSegment(len: number): string {
  const bytes = randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/**
 * Public verification code, e.g. JX-AB12-CD34 — the single identifier for a
 * certificate (non-sequential, unguessable).
 */
export function generateOrderId(): string {
  return `JX-${randomSegment(4)}-${randomSegment(4)}`;
}
