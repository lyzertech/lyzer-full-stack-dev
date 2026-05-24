/**
 * Central API environment config (local ↔ production).
 *
 * Switch (pick one):
 *   1. Set NEXT_PUBLIC_API_MODE=local | production in .env.local / .env.production
 *   2. Omit it: development → local, `next build` (NODE_ENV=production) → production
 *
 * URL templates: see env.example (local) and env.production.example (production).
 * Production builds must not use localhost — set *_PRODUCTION or rely on defaults below.
 */

/** @type {{ laravel: string, apiV1: string }} */
const PRODUCTION_DEFAULTS = {
  laravel: 'https://api.lyzer.my.id',
  apiV1: 'https://api.lyzer.my.id/api/v1',
}

const LOCALHOST_PATTERN = /localhost|127\.0\.0\.1/i

function stripTrailingSlash(url) {
  return url ? String(url).replace(/\/$/, '') : ''
}

function rejectLocalhostInProduction(url, label) {
  if (LOCALHOST_PATTERN.test(url)) {
    throw new Error(
      `[api-config] ${label} must not use localhost/127.0.0.1 when API mode is production. ` +
        'Set LARAVEL_API_URL_PRODUCTION and NEXT_PUBLIC_API_URL_PRODUCTION (see env.production.example).'
    )
  }
}

/**
 * @returns {'local' | 'production'}
 */
function getApiMode() {
  const explicit = (process.env.NEXT_PUBLIC_API_MODE || '').toLowerCase()
  if (explicit === 'production') return 'production'
  if (explicit === 'local') return 'local'
  return process.env.NODE_ENV === 'production' ? 'production' : 'local'
}

function isProductionMode() {
  return getApiMode() === 'production'
}

function readProductionLaravelUrl() {
  const url = stripTrailingSlash(
    process.env.LARAVEL_API_URL_PRODUCTION ||
      process.env.LARAVEL_API_URL ||
      process.env.NEXT_PUBLIC_LARAVEL_API_URL_PRODUCTION ||
      PRODUCTION_DEFAULTS.laravel
  )
  rejectLocalhostInProduction(url, 'LARAVEL_API_URL_PRODUCTION')
  return url
}

function readProductionApiBaseUrl() {
  const url = stripTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL_PRODUCTION ||
      process.env.NEXT_PUBLIC_API_URL ||
      PRODUCTION_DEFAULTS.apiV1
  )
  rejectLocalhostInProduction(url, 'NEXT_PUBLIC_API_URL_PRODUCTION')
  return url
}

function readLocalLaravelUrl() {
  const url = stripTrailingSlash(
    process.env.LARAVEL_API_URL_LOCAL || process.env.LARAVEL_API_URL || ''
  )
  if (!url) {
    throw new Error(
      '[api-config] Local mode requires LARAVEL_API_URL_LOCAL. Copy env.example → .env.local and set NEXT_PUBLIC_API_MODE=local.'
    )
  }
  return url
}

function readLocalApiBaseUrl() {
  const direct = stripTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL_LOCAL || process.env.NEXT_PUBLIC_API_URL || ''
  )
  if (direct) return direct
  return `${readLocalLaravelUrl()}/api/v1`
}

function getLaravelApiUrl() {
  return isProductionMode() ? readProductionLaravelUrl() : readLocalLaravelUrl()
}

function getApiBaseUrl() {
  return isProductionMode() ? readProductionApiBaseUrl() : readLocalApiBaseUrl()
}

/** Relative path for same-origin requests (works with Next/nginx rewrites). */
function getApiV1Path(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const apiPath = normalized.startsWith('/api/v1') ? normalized : `/api/v1${normalized}`
  return apiPath.replace(/\/+$/, '') || '/api/v1'
}

function withoutTrailingSlash(url) {
  return url.replace(/\/+$/, '') || url
}

/**
 * Relative /api/v1 (same-origin Next/nginx proxy). Off by default.
 * When true, browser uses /api/v1/* and Next rewrites to Laravel (see next.config.js).
 */
function shouldUseRelativeApi() {
  if (process.env.NEXT_PUBLIC_USE_RELATIVE_API === 'true') return true
  if (process.env.NEXT_PUBLIC_USE_RELATIVE_API === 'false') return false
  // Dev: same-origin /api/v1 → app/api/v1 proxy (live or local Laravel)
  return process.env.NODE_ENV !== 'production'
}

/** True when local `next dev` targets production Laravel (api.lyzer.my.id). */
function isDevAgainstProductionApi() {
  return process.env.NODE_ENV !== 'production' && isProductionMode()
}

/**
 * Client fetch URL: relative when same-origin proxy is used, absolute otherwise.
 */
function resolveClientApiUrl(path) {
  const apiPath = getApiV1Path(path)

  if (shouldUseRelativeApi()) return apiPath

  const base = withoutTrailingSlash(getApiBaseUrl())
  const suffix = apiPath.replace(/^\/api\/v1/, '') || ''
  return `${base}${suffix}`
}

/**
 * Called from next.config.js during `next build` to fail fast on misconfiguration.
 */
function assertProductionBuildConfig() {
  if (process.env.NODE_ENV !== 'production') return
  const mode = getApiMode()
  if (mode !== 'production') {
    throw new Error(
      '[api-config] Production build requires NEXT_PUBLIC_API_MODE=production (see env.production.example).'
    )
  }
  const laravel = getLaravelApiUrl()
  const api = getApiBaseUrl()
  if (LOCALHOST_PATTERN.test(laravel) || LOCALHOST_PATTERN.test(api)) {
    throw new Error('[api-config] Production build cannot target localhost.')
  }
}

module.exports = {
  PRODUCTION_DEFAULTS,
  getApiMode,
  getLaravelApiUrl,
  getApiBaseUrl,
  getApiV1Path,
  shouldUseRelativeApi,
  isDevAgainstProductionApi,
  resolveClientApiUrl,
  assertProductionBuildConfig,
}
