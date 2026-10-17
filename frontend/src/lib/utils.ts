import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:8000';

/** Resolve a stored upload path ("/uploads/x.png") to an absolute backend URL. */
export function assetUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}
