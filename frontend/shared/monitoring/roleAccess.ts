/**
 * Read-only monitoring installation access (e.g. role slug "monitoring-view").
 */
export function isMonitoringViewOnly(role: string | undefined | null): boolean {
  const normalized = String(role || '').toLowerCase()

  return (
    normalized === 'monitoring-view' ||
    normalized === 'monitoring_view' ||
    normalized.includes('monitoring-view')
  )
}

export function canCreateMonitoringInstallation(
  role: string | undefined | null,
): boolean {
  return !isMonitoringViewOnly(role)
}
