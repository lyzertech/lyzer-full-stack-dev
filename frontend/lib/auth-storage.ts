/** Bearer token for auth_user_sessions — localStorage + cookie (for Next middleware / SSR). */

export const AUTH_TOKEN_KEY = 'laravel_token'
export const AUTH_USER_KEY = 'laravel_user'

/** Match backend session lifetime (AuthController: addDays(7)). */
const COOKIE_MAX_AGE_SEC = 7 * 24 * 60 * 60

/** Strip accidental "Bearer " prefix from stored values. */
function normalizeRawToken(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  return trimmed.replace(/^Bearer\s+/i, '')
}

/** Decode only when value looks URL-encoded (cookie path). */
function decodeToken(raw: string | null | undefined): string | null {
  const trimmed = normalizeRawToken(raw)
  if (!trimmed) return null
  if (!/%[0-9A-Fa-f]{2}/.test(trimmed)) return trimmed
  try {
    return decodeURIComponent(trimmed)
  } catch {
    return trimmed
  }
}

function writeTokenCookie(token: string): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`
}

/** Read laravel_token from document.cookie (set via setAuthToken with encodeURIComponent). */
function readTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const name = trimmed.slice(0, eq)
    if (name !== AUTH_TOKEN_KEY) continue
    return decodeToken(trimmed.slice(eq + 1))
  }
  return null
}

/**
 * Bearer token for API calls. Matches laravel-server-fetch: decode cookie values,
 * fall back cookie → localStorage when storage is empty or out of sync after login.
 */
/**
 * Bearer token for API calls.
 * localStorage (set on login) is canonical; cookie is fallback + middleware.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  const fromStorage = normalizeRawToken(localStorage.getItem(AUTH_TOKEN_KEY))
  const fromCookie = readTokenFromCookie()

  if (fromStorage) {
    if (fromCookie && fromCookie !== fromStorage) {
      writeTokenCookie(fromStorage)
    }
    return fromStorage
  }

  if (fromCookie) {
    localStorage.setItem(AUTH_TOKEN_KEY, fromCookie)
    return fromCookie
  }

  return null
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  const normalized = normalizeRawToken(token)
  if (!normalized) return
  localStorage.setItem(AUTH_TOKEN_KEY, normalized)
  writeTokenCookie(normalized)
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
  document.cookie = `${AUTH_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function isPublicAuthPath(path: string): boolean {
  const normalized = path.replace(/\?.*$/, '').replace(/\/+$/, '')
  return /\/(login|signup)$/.test(normalized)
}
