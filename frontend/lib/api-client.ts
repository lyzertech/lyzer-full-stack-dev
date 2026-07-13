import { resolveClientApiUrl, shouldUseRelativeApi } from './api-config';
import {
  clearAuthToken,
  getAuthToken,
  isPublicAuthPath,
} from './auth-storage';

async function request(path: string, options: RequestInit = {}) {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
          'X-Authorization': `Bearer ${token}`,
        }
      : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(resolveClientApiUrl(path), {
    ...options,
    headers,
    credentials: shouldUseRelativeApi() ? 'include' : 'same-origin',
  });

  const text = await response.text();
  let data: Record<string, unknown> | string | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  // Handle license errors (403 with license_required)
  if (response.status === 403) {
    const errorCode =
      typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error: unknown }).error)
        : '';

    // If it's a license error, clear license cache
    // LicenseGuard will handle showing NoLicensePage on next render
    if (errorCode === 'license_required' && typeof window !== 'undefined') {
      localStorage.removeItem('system_license_status');
      // Don't reload - let LicenseGuard handle the UI transition
    }

    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message: unknown }).message)
        : 'Forbidden';

    const error = new Error(message);
    (error as Error & { response?: { status: number; data: unknown } }).response = {
      status: 403,
      data,
    };
    throw error;
  }

  if (response.status === 401) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message: unknown }).message)
        : 'Unauthorized';

    const isMe = /\/me$/.test(path.replace(/\?.*$/, ''));
    const isPublic = isPublicAuthPath(path);

    const isSessionInvalid =
      /unauthenticated|session expired|token missing/i.test(message);

    if (
      !isPublic &&
      typeof window !== 'undefined' &&
      isSessionInvalid
    ) {
      clearAuthToken();
      // /me: AuthContext handles redirect; avoid hard reload loop after login
      if (!isMe) {
        window.location.href =
          '/?callbackUrl=' + encodeURIComponent(window.location.pathname);
      }
    }

    const error = new Error(message);
    (error as Error & { response?: { status: number; data: unknown } }).response = {
      status: 401,
      data,
    };
    throw error;
  }

  if (!response.ok) {
    const errData = typeof data === 'object' && data !== null ? data : null;
    const error = new Error(
      (errData && ('error' in errData ? String(errData.error) : 'message' in errData ? String(errData.message) : null)) ||
        response.statusText ||
        'Request failed'
    );
    (error as Error & { response?: { status: number; data: unknown } }).response = {
      status: response.status,
      data,
    };
    throw error;
  }

  return { data, status: response.status, headers: response.headers };
}

export const apiClient = {
  get: (path: string, options?: RequestInit) =>
    request(path, { ...options, method: 'GET' }),

  post: (path: string, body?: unknown, options?: RequestInit) =>
    request(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: (path: string, body?: unknown, options?: RequestInit) =>
    request(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (path: string, options?: RequestInit) =>
    request(path, { ...options, method: 'DELETE' }),
};
