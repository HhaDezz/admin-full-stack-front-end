import axios, { AxiosError } from 'axios';
import { config } from './config';
import type { ApiResponse } from './types';

export const SESSION_KEY = 'atelier.session';
export const UNAUTHORIZED_EVENT = 'atelier:unauthorized';

export const api = axios.create({ baseURL: config.apiBaseUrl, timeout: 20000 });

// Demo mode swaps the network for built-in sample data. The literal env check lets the
// production build drop the sample data entirely when demo mode is off.
if (import.meta.env.VITE_DEMO_MODE === 'true') {
  api.defaults.adapter = async (cfg) => (await import('./mock')).mockAdapter(cfg);
}

api.interceptors.request.use((req) => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const token = (JSON.parse(raw) as { token?: string }).token;
      if (token) req.headers.set('Authorization', `Bearer ${token}`);
    }
  } catch {
    /* storage unavailable – continue without a token */
  }
  return req;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const isLogin = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLogin) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(err);
  },
);

/** Unwraps the `{ success, message, data }` envelope used by the Spring Boot API. */
export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise;
  return res.data.data;
}

/** Best-effort human readable message from any thrown error. */
export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: string; errors?: Record<string, string> | string[] } | undefined;
    if (body?.errors && typeof body.errors === 'object' && !Array.isArray(body.errors)) {
      const first = Object.values(body.errors)[0];
      if (first) return String(first);
    }
    if (body?.message) return body.message;
    if (err.code === 'ERR_NETWORK') return 'Cannot reach the server. Check the API address and that the back end is running.';
    if (err.response?.status === 403) return 'You do not have permission to do that.';
    return err.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

/** Field errors from a failed request, e.g. { email: 'That email is already in use.' }. */
export function errorFields(err: unknown): Record<string, string> {
  if (!axios.isAxiosError(err)) return {};
  const data = (err.response?.data as { data?: unknown } | undefined)?.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) if (k !== 'code' && typeof v === 'string') out[k] = v;
  return out;
}

/** Machine-readable reason from the API, e.g. 'EMAIL_NOT_VERIFIED' or 'LINK_INVALID'. */
export function errorCode(err: unknown): string | undefined {
  if (!axios.isAxiosError(err)) return undefined;
  const code = ((err.response?.data as { data?: { code?: unknown } } | undefined)?.data as { code?: unknown } | undefined)?.code;
  return typeof code === 'string' ? code : undefined;
}
