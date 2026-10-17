import type { Certificate, SiteSettings } from './types';

const rawInternal = process.env.API_INTERNAL_URL || 'http://localhost:8000/api';
const INTERNAL = rawInternal.replace(/\/+$/, '').endsWith('/api')
  ? rawInternal.replace(/\/+$/, '')
  : `${rawInternal.replace(/\/+$/, '')}/api`;

/** Server-side fetch used by SSR verify pages + sitemap. Never sends cookies. */
async function serverGet<T>(path: string, revalidate = 0): Promise<T | null> {
  try {
    const res = await fetch(`${INTERNAL}${path}`, {
      next: { revalidate },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data: T };
    return json.data;
  } catch {
    return null;
  }
}

export function getCertificateByOrderId(orderId: string) {
  return serverGet<Certificate>(`/verify/${encodeURIComponent(orderId)}`);
}

export function getSiteSettings() {
  return serverGet<SiteSettings>(`/site-settings`, 300);
}
