'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { useAnalysisTheme, type AnalysisTheme } from './useAnalysisTheme'

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface DeviceTreeProps {
  selectedId: string | null
  onSelect: (node: DeviceNode) => void
}

// ─── Status colours ───────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  Online:  '#22c55e',
  Offline: '#6b7280',
  Warning: '#f59e0b',
  Inactive:'#60a5fa',
  online:  '#22c55e',
  offline: '#6b7280',
  warning: '#f59e0b',
  idle:    '#60a5fa',
}

// ─── Raw-data → DeviceNode converter ─────────────────────────────────────────

function normalizeStatus(raw: string | undefined | null): string {
  if (!raw) return 'offline'
  return raw.toLowerCase()
}

function mapDeviceIcon(deviceType: string | undefined): string {
  switch ((deviceType ?? '').toLowerCase()) {
    case 'gateway':  return 'ri-router-line'
    case 'sensor':   return 'ri-broadcast-line'
    case 'camera':   return 'ri-camera-line'
    default:         return 'ri-cpu-line'
  }
}

function sortByDeviceCode<T extends { device_code?: string | null }>(devices: T[]): T[] {
  return [...devices].sort((a, b) =>
    String(a.device_code ?? '').localeCompare(
      String(b.device_code ?? ''),
      undefined,
      { numeric: true, sensitivity: 'base' },
    ),
  )
}

function buildTree(orgs: any[]): DeviceNode[] {
  return orgs.map((org) => ({
    id:    `org-${org.id}`,
    label: org.name,
    type:  'org' as const,
    icon:  'ri-building-2-line',
    children: (org.facilities ?? []).map((fac: any) => ({
      id:    `fac-${fac.id}`,
      label: fac.name,
      type:  'facility' as const,
      icon:  'ri-community-line',
      children: sortByDeviceCode(fac.devices ?? []).map((dev: any): DeviceNode => ({
        id:     `dev-${dev.id}`,
        label:  dev.name,
        type:   'device' as const,
        icon:   mapDeviceIcon(dev.device_type),
        status: normalizeStatus(dev.status),
        meta: {
          model:           dev.model,
          device_type:     dev.device_type,
          ip:              dev.ip_address,
          port:            dev.port ? Number(dev.port) : undefined,
          protocol:        dev.protocol,
          connection_type: dev.connection_type,
          brand:           dev.brand,
          device_code:     dev.device_code,
          device_name:     dev.name,
          facility_name:   fac.name,
          org_name:        org.name,
        },
      })),
    })),
  }))
}

function collectDevices(nodes: DeviceNode[]): DeviceNode[] {
  const result: DeviceNode[] = []
  for (const n of nodes) {
    if (n.type === 'device') result.push(n)
    if (n.children) result.push(...collectDevices(n.children))
  }
  return result
}

// ─── Status dot ───────────────────────────────────────────────────────────────

const StatusDot = ({ status }: { status?: string }) => {
  if (!status) return null
  const color = STATUS_COLOR[status] ?? '#6b7280'
  const isOnline = status === 'online' || status === 'Online'
  return (
    <span style={{
      display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
      background: color,
      boxShadow: isOnline ? `0 0 8px ${color}` : 'none',
      flexShrink: 0, marginLeft: 4,
    }} />
  )
}

// ─── Tree Node ────────────────────────────────────────────────────────────────

interface TreeNodeProps {
  node: DeviceNode
  depth: number
  selectedId: string | null
  onSelect: (n: DeviceNode) => void
  theme: AnalysisTheme
  defaultOpen?: boolean
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node, depth, selectedId, onSelect, theme: t, defaultOpen = false,
}) => {
  const hasChildren = !!(node.children && node.children.length > 0)
  const [open, setOpen] = useState(defaultOpen)
  const isSelected = selectedId === node.id
  const isDevice = node.type === 'device'

  const indent = depth * 14

  const toggleOrSelect = () => {
    if (isDevice) onSelect(node)
    else setOpen((v) => !v)
  }

  return (
    <div>
      <div
        onClick={toggleOrSelect}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          paddingLeft: 8 + indent, paddingRight: 8,
          paddingTop: 5, paddingBottom: 5,
          cursor: 'pointer', borderRadius: 4,
          background: isSelected ? t.selectedBg : 'transparent',
          border: isSelected ? `1px solid ${t.selectedBorder}` : '1px solid transparent',
          marginBottom: 1, transition: 'background 0.15s', userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = t.hoverBg
        }}
        onMouseLeave={(e) => {
          if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'
        }}
      >
        {/* Expand/collapse arrow */}
        <span style={{ width: 12, flexShrink: 0, color: t.textDim, fontSize: 12 }}>
          {hasChildren ? (open ? '▾' : '▸') : ''}
        </span>

        {/* Icon */}
        {node.icon && (
          <i className={node.icon} style={{
            fontSize: isDevice ? 12 : 13,
            color: isSelected ? '#22c55e'
              : node.type === 'org' ? '#60a5fa'
              : node.type === 'facility' ? '#a78bfa'
              : '#9ca3af',
            flexShrink: 0,
          }} />
        )}

        {/* Label */}
        <span style={{
          fontSize: 14,
          color: isSelected
            ? t.text
            : node.type === 'org'
              ? t.text
              : node.type === 'facility'
                ? t.textSecondary
                : t.textMuted,
          fontWeight: node.type === 'org' ? 700 : node.type === 'facility' ? 600 : 400,
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {node.label}
        </span>

        {/* Device count badge for orgs/facilities */}
        {!isDevice && hasChildren && (
          <span style={{
            background: t.badgeBg, borderRadius: 8, padding: '4px 8px',
            fontSize: 12, color: t.textDim, flexShrink: 0,
          }}>
            {collectDevices(node.children!).length}
          </span>
        )}

        {/* Status dot for devices */}
        {isDevice && <StatusDot status={node.status} />}
      </div>

      {/* Children */}
      {hasChildren && open && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              theme={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main DeviceTree ──────────────────────────────────────────────────────────

const DeviceTree: React.FC<DeviceTreeProps> = ({ selectedId, onSelect }) => {
  const t = useAnalysisTheme()
  const [tree, setTree]       = useState<DeviceNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [search, setSearch]   = useState('')
  const searchParams          = useSearchParams()

  const fetchTree = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/monitoring/device-tree')
      const data = response.data
      const built = buildTree(Array.isArray(data) ? data : [])
      setTree(built)
      // Auto-select from URL param or default to first device
      if (!selectedId) {
        const allDevices = collectDevices(built)
        const urlDeviceName = searchParams.get('device_name')
        const target = urlDeviceName 
          ? allDevices.find(d => d.meta?.device_name === urlDeviceName) || allDevices[0]
          : allDevices[0]
        if (target) onSelect(target)
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load devices')
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchTree() }, [fetchTree])

  const allDevices = collectDevices(tree)
  const counts = {
    online:  allDevices.filter((d) => ['online','Online'].includes(d.status ?? '')).length,
    offline: allDevices.filter((d) => ['offline','Offline'].includes(d.status ?? '')).length,
    warning: allDevices.filter((d) => ['warning','Warning'].includes(d.status ?? '')).length,
    idle:    allDevices.filter((d) => ['idle','Inactive'].includes(d.status ?? '')).length,
  }

  // Filtered flat list when searching
  const filteredDevices = search.trim()
    ? allDevices.filter((d) =>
        d.label.toLowerCase().includes(search.toLowerCase()) ||
        d.meta?.ip?.toLowerCase().includes(search.toLowerCase()) ||
        d.meta?.model?.toLowerCase().includes(search.toLowerCase())
      )
    : null

  return (
    <div style={{
      background: t.panelBg, border: `1px solid ${t.border}`, borderRadius: 8,
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{ padding: '13px 15px 11px', borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ri-sitemap-line" style={{ color: '#60a5fa', fontSize: 17 }} />
            <span style={{ color: t.text, fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}>
              DEVICE TREE
            </span>
          </div>
          <button
            onClick={fetchTree}
            title="Refresh"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: t.textDim, fontSize: 16, padding: 2, lineHeight: 1,
            }}
          >
            <i className="ri-refresh-line" />
          </button>
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {[
            { label: 'Online',  count: counts.online,  color: '#22c55e' },
            { label: 'Offline', count: counts.offline, color: '#6b7280' },
            { label: 'Warn',    count: counts.warning, color: '#f59e0b' },
            { label: 'Idle',    count: counts.idle,    color: '#60a5fa' },
          ].map(({ label, count, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 3,
              background: 'transparent', border: `1px solid ${color}33`,
              borderRadius: 10, padding: '5px 9px',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block' }} />
              <span style={{ color: t.textMuted, fontSize: 12 }}>{label}</span>
              <span style={{ color, fontSize: 12, fontWeight: 700 }}>{count}</span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <i className="ri-search-line" style={{
            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
            color: t.textDim, fontSize: 15,
          }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, IP, model…"
            style={{
              width: '100%', background: 'transparent', border: `1px solid ${t.border}`,
              borderRadius: 4, color: t.inputText, fontSize: 14,
              padding: '8px 11px 8px 29px', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="tree-scroll" style={{ flex: 1, overflowY: 'auto', padding: '9px 7px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 30, color: t.textDim }}>
            <i className="ri-loader-4-line" style={{ fontSize: 23, display: 'block', marginBottom: 6 }} />
            <span style={{ fontSize: 14 }}>Loading devices…</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', paddingTop: 20, color: '#f87171', fontSize: 14 }}>
            <i className="ri-error-warning-line" style={{ fontSize: 21, display: 'block', marginBottom: 4 }} />
            {error}
            <br />
            <button
              onClick={fetchTree}
              style={{
                marginTop: 8, background: t.badgeBg, border: `1px solid ${t.border}`,
                color: t.textMuted, borderRadius: 4, padding: '6px 13px', cursor: 'pointer', fontSize: 13,
              }}
            >
              Retry
            </button>
          </div>
        ) : filteredDevices ? (
          filteredDevices.length === 0 ? (
            <div style={{ color: t.textDim, fontSize: 14, textAlign: 'center', paddingTop: 20 }}>
              No devices found
            </div>
          ) : (
            filteredDevices.map((d) => (
              <TreeNode key={d.id} node={d} depth={0} selectedId={selectedId} onSelect={onSelect} theme={t} />
            ))
          )
        ) : tree.length === 0 ? (
          <div style={{ color: t.textDim, fontSize: 14, textAlign: 'center', paddingTop: 20 }}>
            No organizations found
          </div>
        ) : (
          tree.map((root) => (
            <TreeNode key={root.id} node={root} depth={0} selectedId={selectedId} onSelect={onSelect} theme={t} />
          ))
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '9px 15px', borderTop: `1px solid ${t.border}`, flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ color: t.textDim, fontSize: 12 }}>Total devices</span>
        <span style={{ color: t.textMuted, fontSize: 13, fontWeight: 700 }}>
          {loading ? '…' : allDevices.length}
        </span>
      </div>
    </div>
  )
}

export default DeviceTree
