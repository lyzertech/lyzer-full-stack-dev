/**
 * Browser fetch helper — respects API_MODE and sends auth_user_sessions Bearer token.
 */
import { resolveClientApiUrl, shouldUseRelativeApi } from './api-config'
import { getAuthToken } from './auth-storage'

export async function fetchApi(path: string, init?: RequestInit) {
  const url = resolveClientApiUrl(path)
  const token = getAuthToken()

  return fetch(url, {
    ...init,
    credentials: shouldUseRelativeApi() ? 'include' : 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
            'X-Authorization': `Bearer ${token}`,
          }
        : {}),
      ...(init?.headers ?? {}),
    },
  })
}
