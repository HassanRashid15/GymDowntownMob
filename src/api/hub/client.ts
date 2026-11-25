import { supabase } from '../client/supabase';
import { endpoints, type EndpointsConfig } from './endpoints';

export type ApiEndpoint = {
  method: string;
  path: string;
  description?: string;
};

export type { EndpointsConfig };

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL || '').trim().replace(/\/$/, '');

export const isHubApiConfigured = () => Boolean(API_BASE);

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function getAccessToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export function getEndpoint(group: keyof EndpointsConfig, action: string): ApiEndpoint {
  const groupConfig = endpoints[group] as Record<string, ApiEndpoint> | undefined;
  const endpoint = groupConfig?.[action];
  if (!endpoint?.path || !endpoint?.method) {
    throw new ApiError(`Unknown API endpoint: ${String(group)}.${action}`, 500);
  }
  return endpoint;
}

const PUBLIC_ACTIONS = new Set([
  'gyms.list',
  'gyms.detail',
  'gyms.trainers',
  'gyms.reviews',
  'promotions.public',
  'progress.exerciseCatalog',
  'progress.exerciseDemo',
  'blog.list',
  'blog.detail',
  'exercises.list',
  'platform.publicStats',
  'reviews.list',
  'contact.submit',
]);

/**
 * Call the centralized Hub API (same routes the website uses).
 */
export async function apiRequest<T>(
  group: keyof EndpointsConfig,
  action: string,
  options: {
    body?: unknown;
    query?: Record<string, string | number | boolean | null | undefined>;
    pathParams?: Record<string, string>;
    headers?: HeadersInit;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  if (!API_BASE) {
    throw new ApiError(
      'Set EXPO_PUBLIC_API_BASE_URL to your gym-journey-hub URL (e.g. http://localhost:3000)',
      503
    );
  }

  const endpoint = getEndpoint(group, action);
  const token = await getAccessToken();
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const key = `${String(group)}.${action}`;
  const requiresAuth = !PUBLIC_ACTIONS.has(key);

  if (requiresAuth && !token) {
    throw new ApiError('Unauthorized — please log in again', 401);
  }

  if (options.body !== undefined && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let path = endpoint.path;
  if (options.pathParams) {
    Object.entries(options.pathParams).forEach(([k, v]) => {
      path = path.replace(`:${k}`, encodeURIComponent(v));
    });
  }

  if (options.query) {
    const params = new URLSearchParams();
    Object.entries(options.query).forEach(([k, value]) => {
      if (value !== undefined && value !== null) {
        params.set(k, String(value));
      }
    });
    const qs = params.toString();
    if (qs) path = `${path}?${qs}`;
  }

  const url = `${API_BASE}${path}`;
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 20000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: endpoint.method,
      headers,
      body:
        options.body === undefined
          ? undefined
          : isFormData
            ? (options.body as FormData)
            : JSON.stringify(options.body),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        (payload as { error?: string; message?: string })?.error ||
          (payload as { message?: string })?.message ||
          'Request failed',
        response.status,
        payload
      );
    }

    return payload as T;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export { endpoints };
