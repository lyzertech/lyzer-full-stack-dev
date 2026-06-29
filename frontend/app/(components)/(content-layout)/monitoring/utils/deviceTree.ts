export interface DeviceNode {
  id: string
  label: string
  type: 'org' | 'facility' | 'device'
  icon?: string
  status?: 'online' | 'offline' | 'warning' | 'idle' | string
  children?: DeviceNode[]
  meta?: {
    model?: string
    device_type?: string
    ip?: string
    port?: number
    protocol?: string
    connection_type?: string
    brand?: string
    device_code?: string
    device_name?: string
    facility_name?: string
    org_name?: string
  }
}

const STATUS_COLOR: Record<string, string> = {
  Online: '#22c55e',
  Offline: '#6b7280',
  Warning: '#f59e0b',
  Inactive: '#60a5fa',
  online: '#22c55e',
  offline: '#6b7280',
  warning: '#f59e0b',
  idle: '#60a5fa',
}

export function getDeviceStatusColor(status?: string): string {
  if (!status) return '#6b7280'
  return STATUS_COLOR[status] ?? '#6b7280'
}

function normalizeStatus(raw: string | undefined | null): string {
  if (!raw) return 'offline'
  return raw.toLowerCase()
}

function mapDeviceIcon(deviceType: string | undefined): string {
  switch ((deviceType ?? '').toLowerCase()) {
    case 'gateway':
      return 'bi-router'
    case 'sensor':
      return 'bi-broadcast'
    case 'camera':
      return 'bi-camera-video'
    default:
      return 'bi-cpu'
  }
}

function sortByDeviceCode<T extends { device_code?: string | null }>(
  devices: T[],
): T[] {
  return [...devices].sort((a, b) =>
    String(a.device_code ?? '').localeCompare(
      String(b.device_code ?? ''),
      undefined,
      { numeric: true, sensitivity: 'base' },
    ),
  )
}

export function buildDeviceTree(orgs: any[]): DeviceNode[] {
  return orgs.map((org) => ({
    id: `org-${org.id}`,
    label: org.name,
    type: 'org' as const,
    icon: 'bi-building',
    children: (org.facilities ?? []).map((fac: any) => ({
      id: `fac-${fac.id}`,
      label: fac.name,
      type: 'facility' as const,
      icon: 'bi-geo-alt',
      children: sortByDeviceCode(fac.devices ?? []).map(
        (dev: any): DeviceNode => ({
          id: `dev-${dev.id}`,
          label: dev.name,
          type: 'device' as const,
          icon: mapDeviceIcon(dev.device_type),
          status: normalizeStatus(dev.status),
          meta: {
            model: dev.model,
            device_type: dev.device_type,
            ip: dev.ip_address,
            port: dev.port ? Number(dev.port) : undefined,
            protocol: dev.protocol,
            connection_type: dev.connection_type,
            brand: dev.brand,
            device_code: dev.device_code,
            device_name: dev.name,
            facility_name: fac.name,
            org_name: org.name,
          },
        }),
      ),
    })),
  }))
}

export function collectDevices(nodes: DeviceNode[]): DeviceNode[] {
  const result: DeviceNode[] = []
  for (const n of nodes) {
    if (n.type === 'device') result.push(n)
    if (n.children) result.push(...collectDevices(n.children))
  }
  return result
}

export function filterDevices(
  devices: DeviceNode[],
  search: string,
): DeviceNode[] {
  const q = search.trim().toLowerCase()
  if (!q) return devices
  return devices.filter(
    (d) =>
      d.label.toLowerCase().includes(q) ||
      d.meta?.ip?.toLowerCase().includes(q) ||
      d.meta?.model?.toLowerCase().includes(q) ||
      d.meta?.device_code?.toLowerCase().includes(q),
  )
}
