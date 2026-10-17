import axios, { AxiosError } from 'axios';

/**
 * Browser-side API client. Sends the httpOnly session cookie with every request
 * (withCredentials) so admin calls are authenticated without exposing tokens to JS.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  timeout: 20_000,
});

/** Extract a human-readable message from an API error envelope. */
export function apiError(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as
      | { error?: { message?: string; details?: { path: string; message: string }[] } }
      | undefined;
    if (data?.error?.details?.length) {
      return data.error.details.map((d) => d.message).join(', ');
    }
    return data?.error?.message || err.message || fallback;
  }
  return fallback;
}

/** Unwrap the { success, data } envelope. */
export function unwrap<T>(payload: { success: boolean; data: T }): T {
  return payload.data;
}
