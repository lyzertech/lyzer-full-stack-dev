/**
 * Centralized API service for Lyzer
 *
 * Automatically detects the current subdomain and routes every call
 * to the correct Laravel module endpoint:
 *   finance.lyzer.test → /api/finance/...
 *   labs.lyzer.test    → /api/labs/...
 *   school.lyzer.test  → /api/school/...
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://lyzer.test';

// ─── Subdomain Detection ──────────────────────────────────────────────────

function getCurrentModule(): string | null {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname; // e.g. "finance.lyzer.test"
  const parts = hostname.split('.');

  // Expect at least 3 parts: subdomain.domain.tld
  if (parts.length >= 3) {
    const subdomain = parts[0];
    const MODULES = ['finance', 'labs', 'school'];
    if (MODULES.includes(subdomain)) return subdomain;
  }

  return null;
}

// ─── Token Management ─────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lyzer_token');
}

export function setToken(token: string): void {
  localStorage.setItem('lyzer_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('lyzer_token');
}

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  module?: string; // override auto-detected module
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { module: moduleOverride, ...fetchOptions } = options;
  const module = moduleOverride || getCurrentModule();

  if (!module) {
    throw new Error('Unable to detect module from current subdomain.');
  }

  const url = `${API_BASE}/api/${module}/${path.replace(/^\//, '')}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Unauthenticated');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // 204 No Content
  if (response.status === 204) return {} as T;

  return response.json();
}

// ─── HTTP Convenience Methods ─────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),

  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    }),

  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'DELETE', ...options }),
};

// ─── Auth API (no module prefix) ─────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }

    const data = await res.json();
    setToken(data.token);
    return data;
  },

  logout: async () => {
    await request('/logout', { method: 'POST', module: 'auth' }).catch(() => {});
    removeToken();
    window.location.href = '/login';
  },

  me: () =>
    fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: 'application/json',
      },
      credentials: 'include',
    }).then((r) => r.json()),
};

export default api;
