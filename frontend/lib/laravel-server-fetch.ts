import { cookies, headers } from 'next/headers'
import { getApiMode, getLaravelApiUrl } from './api-config'

function extractApiErrorMessage(
  parsed: unknown,
  text: string,
  statusText: string
): string {
  if (parsed && typeof parsed === 'object' && parsed !== null) {
    const body = parsed as Record<string, unknown>
    if (typeof body.error === 'string' && body.error) return body.error
    if (typeof body.message === 'string' && body.message) return body.message
  }
  return text || statusText
}

/**
 * Laravel origin for server-side fetch (Server Actions / RSC).
 * Uses api-config; optional same-origin fallback when behind a reverse proxy.
 */
async function resolveLaravelBaseUrl(): Promise<string> {
  const configured = getLaravelApiUrl()
  if (configured) return configured

  if (getApiMode() === 'production') {
    throw new Error(
      '[laravel-server-fetch] LARAVEL_API_URL_PRODUCTION is not configured for production mode.'
    )
  }

  try {
    const h = await headers()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    const proto = h.get('x-forwarded-proto') ?? 'https'
    if (host) return `${proto}://${host}`
  } catch {
    // headers() unavailable outside request context
  }

  throw new Error(
    '[laravel-server-fetch] Set LARAVEL_API_URL_LOCAL in .env.local (see env.example).'
  )
}

async function getBearerToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('laravel_token')?.value
  if (!raw) return null
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export function createLaravelModuleFetch(module: string) {
  return async function laravelFetch(path: string, init?: RequestInit) {
    const token = await getBearerToken()
    if (!token) {
      throw new Error(
        'Unauthorized: cookie laravel_token tidak ada. Login ulang setelah deploy auth-storage (token disimpan ke cookie + localStorage).'
      )
    }

    const base = await resolveLaravelBaseUrl()
    const res = await fetch(`${base}/api/v1/${module}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Authorization': `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    })

    const text = await res.text()
    let parsed: unknown = null
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      parsed = null
    }

    if (!res.ok) {
      throw new Error(extractApiErrorMessage(parsed, text, res.statusText))
    }

    return parsed
  }
}
