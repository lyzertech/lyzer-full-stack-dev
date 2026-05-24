import {
  getApiMode as getApiModeJs,
  getLaravelApiUrl as getLaravelApiUrlJs,
  getApiBaseUrl as getApiBaseUrlJs,
  getApiV1Path as getApiV1PathJs,
  shouldUseRelativeApi as shouldUseRelativeApiJs,
  isDevAgainstProductionApi as isDevAgainstProductionApiJs,
  resolveClientApiUrl as resolveClientApiUrlJs,
  PRODUCTION_DEFAULTS as PRODUCTION_DEFAULTS_JS,
} from './api-config.js'

export type ApiMode = 'local' | 'production'

export const PRODUCTION_DEFAULTS = PRODUCTION_DEFAULTS_JS

export function getApiMode(): ApiMode {
  return getApiModeJs() as ApiMode
}

export function getLaravelApiUrl(): string {
  return getLaravelApiUrlJs()
}

export function getApiBaseUrl(): string {
  return getApiBaseUrlJs()
}

export function getApiV1Path(path: string): string {
  return getApiV1PathJs(path)
}

export function shouldUseRelativeApi(): boolean {
  return shouldUseRelativeApiJs()
}

export function isDevAgainstProductionApi(): boolean {
  return isDevAgainstProductionApiJs()
}

export function resolveClientApiUrl(path: string): string {
  return resolveClientApiUrlJs(path)
}
