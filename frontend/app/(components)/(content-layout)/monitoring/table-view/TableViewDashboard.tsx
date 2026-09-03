'use client'

import React, { useState, useEffect, useCallback } from 'react'
import DeviceTree, { DeviceNode } from '../analysis/DeviceTree'
import { useAnalysisTheme, statusBadge, type AnalysisTheme } from '../analysis/useAnalysisTheme'
import { apiClient } from '@/lib/api-client'

interface AcuvimLatestRow {
  Timestamp?: string
  Vlavg_V?: number | string
  Vnavg_V?: number | string
  Iavg_A?: number | string
  Psum_kW?: number | string
  Qsum_kvar?: number | string
  Ssum_kVA?: number | string
  PF?: number | string
  PF1?: number | string
  PF2?: number | string
  PF3?: number | string
  V1?: number | string
  V2?: number | string
  V3?: number | string
  V12?: number | string
  V23?: number | string
  V31?: number | string
  I1?: number | string
  I2?: number | string
  I3?: number | string
  In?: number | string
  Freq_Hz?: number | string
}

interface Parameter {
  key: keyof AcuvimLatestRow
  label: string
  unit: string
}

const AVAILABLE_PARAMETERS: Parameter[] = [
  { key: 'Vlavg_V', label: 'Voltage Line Average', unit: 'V' },
  { key: 'Vnavg_V', label: 'Voltage Neutral Average', unit: 'V' },
  { key: 'V1', label: 'Voltage L1-N', unit: 'V' },
  { key: 'V2', label: 'Voltage L2-N', unit: 'V' },
  { key: 'V3', label: 'Voltage L3-N', unit: 'V' },
  { key: 'V12', label: 'Voltage L1-L2', unit: 'V' },
  { key: 'V23', label: 'Voltage L2-L3', unit: 'V' },
  { key: 'V31', label: 'Voltage L3-L1', unit: 'V' },
  { key: 'Iavg_A', label: 'Current Average', unit: 'A' },
  { key: 'I1', label: 'Current L1', unit: 'A' },
  { key: 'I2', label: 'Current L2', unit: 'A' },
  { key: 'I3', label: 'Current L3', unit: 'A' },
  { key: 'In', label: 'Current Neutral', unit: 'A' },
  { key: 'Freq_Hz', label: 'Frequency', unit: 'Hz' },
  { key: 'Psum_kW', label: 'Active Power Sum', unit: 'kW' },
  { key: 'Qsum_kvar', label: 'Reactive Power Sum', unit: 'kvar' },
  { key: 'Ssum_kVA', label: 'Apparent Power Sum', unit: 'kVA' },
  { key: 'PF', label: 'Power Factor Average', unit: '' },
  { key: 'PF1', label: 'Power Factor L1', unit: '' },
  { key: 'PF2', label: 'Power Factor L2', unit: '' },
  { key: 'PF3', label: 'Power Factor L3', unit: '' },
]

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : null
}

const formatReading = (value: number | null): string => {
  if (value === null) return '---'
  return value.toFixed(2)
}

const formatTimestamp = (timestamp: string): string => {
  const iso = timestamp.includes('T') ? timestamp : timestamp.replace(' ', 'T')
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return timestamp

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const TableViewDashboard: React.FC = () => {
  const theme = useAnalysisTheme()
  const [selectedDevices, setSelectedDevices] = useState<DeviceNode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceData, setDeviceData] = useState<Map<string, AcuvimLatestRow>>(new Map())
  const [selectedParameters, setSelectedParameters] = useState<string[]>(['Vlavg_V', 'Iavg_A', 'Psum_kW'])
  const [showParameterSelector, setShowParameterSelector] = useState(false)
  const fetchedDeviceIdsRef = React.useRef<Set<string>>(new Set())

  const handleDeviceSelect = (device: DeviceNode) => {
    setSelectedDevices(prev => {
      const exists = prev.find(d => d.id === device.id)
      if (exists) return prev
      return [...prev, device]
    })
  }

  const handleRemoveDevice = (deviceId: string) => {
    setSelectedDevices(prev => prev.filter(d => d.id !== deviceId))
    setDeviceData(prev => {
      const newMap = new Map(prev)
      newMap.delete(deviceId)
      return newMap
    })
    fetchedDeviceIdsRef.current.delete(deviceId)
  }

  const handleToggleParameter = (paramKey: string) => {
    setSelectedParameters(prev => {
      if (prev.includes(paramKey)) {
        return prev.filter(k => k !== paramKey)
      } else {
        return [...prev, paramKey]
      }
    })
  }

  const fetchLatest = useCallback(async () => {
    if (selectedDevices.length === 0) {
      setDeviceData(new Map())
      fetchedDeviceIdsRef.current.clear()
      setError(null)
      return
    }

    const devicesToFetch = selectedDevices.filter(device => !fetchedDeviceIdsRef.current.has(device.id))

    if (devicesToFetch.length === 0) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const fetchedData = await Promise.all(
        devicesToFetch.map(async (device) => {
          const deviceName = device.meta?.device_name ?? device.label
          const params = new URLSearchParams({
            device_name: deviceName,
            per_page: '1',
            page: '1',
          })
          if (device.meta?.device_code) {
            params.set('device_serial', device.meta.device_code)
          }

          try {
            const res = await apiClient.get(`/monitoring/acuvim/data?${params}`)
            const row = (res.data?.data ?? [])[0] as AcuvimLatestRow | undefined
            return row ? { deviceId: device.id, data: row } : null
          } catch (err) {
            console.error(`Failed to fetch data for ${deviceName}:`, err)
            return null
          }
        })
      )

      setDeviceData(prev => {
        const updated = new Map(prev)
        fetchedData.forEach(item => {
          if (item) {
            updated.set(item.deviceId, item.data)
            fetchedDeviceIdsRef.current.add(item.deviceId)
          }
        })
        return updated
      })

      const hasAnyData = fetchedData.some(item => item !== null)
      if (!hasAnyData && fetchedDeviceIdsRef.current.size === devicesToFetch.length) {
        setError('No readings available for selected devices')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [selectedDevices])

  useEffect(() => {
    fetchLatest()
  }, [fetchLatest])

  return (
    <div style={dash}>
      <style>{`
        .tv-main-layout { display: grid; grid-template-columns: 263px 1fr; gap: 11px; flex: 1; min-height: 0; }
        .tv-sidebar { height: 100%; position: relative; min-height: 0; z-index: 10; }
        @media(max-width: 803px) {
          .tv-main-layout { grid-template-columns: 1fr; }
          .tv-sidebar { height: 353px; position: relative; }
        }
        .tree-scroll::-webkit-scrollbar{width:6px}
        .tree-scroll::-webkit-scrollbar-thumb{background:${theme.isDark ? '#2d3748' : '#cbd5e1'};border-radius:5px}
        .table-scroll::-webkit-scrollbar{height:10px;width:10px}
        .table-scroll::-webkit-scrollbar-track{background:${theme.isDark ? '#1e293b' : '#f1f5f9'};border-radius:5px}
        .table-scroll::-webkit-scrollbar-thumb{background:${theme.isDark ? '#475569' : '#cbd5e1'};border-radius:5px}
        .table-scroll::-webkit-scrollbar-thumb:hover{background:${theme.isDark ? '#64748b' : '#94a3b8'}}
      `}</style>

      {/* Header */}
      <div style={headerStyle(theme)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ri-table-line" style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <div style={{ color: theme.text, fontWeight: 700, fontSize: 17, letterSpacing: 0.8 }}>TABLE VIEW</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {selectedDevices.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '8px 13px' }}>
              <i className="ri-list-check" style={{ color: '#60a5fa', fontSize: 15 }} />
              <div style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>
                {selectedDevices.length} device{selectedDevices.length > 1 ? 's' : ''} selected
              </div>
            </div>
          )}
          <button
            onClick={() => setShowParameterSelector(!showParameterSelector)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: theme.isDark ? '#3b82f6' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 13px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Select parameters to display"
          >
            <i className="ri-settings-3-line" style={{ fontSize: 14 }} />
            <span>Parameters ({selectedParameters.length})</span>
          </button>
        </div>
      </div>

      {/* Selected Devices Pills */}
      {selectedDevices.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '10px 13px' }}>
          {selectedDevices.map((device) => {
            const statusInfo = statusBadge(device.status, theme.isDark)
            return (
              <div key={device.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.isDark ? '#1e293b' : '#f1f5f9', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px' }}>
                <i className="ri-cpu-line" style={{ color: '#60a5fa', fontSize: 13 }} />
                <div style={{ color: theme.text, fontSize: 13, fontWeight: 600 }}>{device.label}</div>
                {statusInfo && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color }} />
                )}
                <button
                  onClick={() => handleRemoveDevice(device.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.textDim,
                    padding: 0,
                    lineHeight: 1,
                    fontSize: 14,
                  }}
                  title="Remove device"
                >
                  <i className="ri-close-line" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Parameter Selector */}
      {showParameterSelector && (
        <div style={{ background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '13px 15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ color: theme.text, fontSize: 14, fontWeight: 700 }}>Select Parameters to Display</div>
            <button
              onClick={() => {
                if (selectedParameters.length === AVAILABLE_PARAMETERS.length) {
                  setSelectedParameters([])
                } else {
                  setSelectedParameters(AVAILABLE_PARAMETERS.map(p => p.key))
                }
              }}
              style={{
                background: 'none',
                border: `1px solid ${theme.border}`,
                borderRadius: 4,
                padding: '4px 10px',
                color: theme.text,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {selectedParameters.length === AVAILABLE_PARAMETERS.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {AVAILABLE_PARAMETERS.map((param) => (
              <label
                key={param.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  background: theme.isDark ? '#1e293b' : '#f1f5f9',
                  border: `1px solid ${selectedParameters.includes(param.key) ? '#3b82f6' : theme.border}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: theme.text,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedParameters.includes(param.key)}
                  onChange={() => handleToggleParameter(param.key)}
                  style={{ cursor: 'pointer' }}
                />
                <span>{param.label}</span>
                {param.unit && <span style={{ color: theme.textDim, fontSize: 11 }}>({param.unit})</span>}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="tv-main-layout">
        {/* Left: Device Tree */}
        <div className="tv-sidebar">
          <DeviceTree selectedId={null} onSelect={handleDeviceSelect} />
        </div>

        {/* Right: Data Table */}
        <div style={{ ...panelStyle(theme), flex: 1, minHeight: 400, minWidth: 0, overflow: 'hidden' }}>
          {selectedDevices.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: theme.textMuted }}>
              <div>
                <i className="ri-table-2" style={{ fontSize: 48, color: theme.textDim, marginBottom: 16, display: 'block' }} />
                <div style={{ fontSize: 16, fontWeight: 600 }}>Select devices</div>
                <div style={{ fontSize: 14, color: theme.textDim, marginTop: 8 }}>Choose devices from the tree to view readings</div>
              </div>
            </div>
          ) : (
            <div className="table-scroll" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 350px)' }}>
              {/* Data Table */}
              <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      background: theme.panelBg,
                      textAlign: 'left',
                      padding: '12px 16px',
                      color: theme.textDim,
                      fontSize: 13,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      minWidth: 180
                    }}>
                      Parameter
                    </th>
                    {selectedDevices.map((device) => (
                      <th key={device.id} style={{
                        textAlign: 'center',
                        padding: '12px 16px',
                        color: theme.text,
                        fontSize: 13,
                        fontWeight: 700,
                        minWidth: 180
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{device.label}</div>
                          {deviceData.get(device.id)?.Timestamp && (
                            <div style={{ fontSize: 11, color: theme.textDim, fontWeight: 400, fontFamily: 'monospace' }}>
                              {formatTimestamp(String(deviceData.get(device.id)!.Timestamp))}
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedParameters.map((paramKey) => {
                    const param = AVAILABLE_PARAMETERS.find(p => p.key === paramKey)
                    if (!param) return null

                    return (
                      <tr key={param.key} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 1,
                          background: theme.panelBg,
                          padding: '16px',
                          color: theme.text,
                          fontSize: 14,
                          fontWeight: 600
                        }}>
                          {param.label}
                        </td>
                        {selectedDevices.map((device) => {
                          const data = deviceData.get(device.id)
                          const value = data ? toNumber(data[param.key]) : null
                          return (
                            <td key={device.id} style={{
                              padding: '16px',
                              textAlign: 'center',
                              background: data ? 'transparent' : theme.isDark ? '#1e293b22' : '#f1f5f922'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <span style={{
                                  color: data ? theme.text : theme.textDim,
                                  fontSize: 18,
                                  fontWeight: 700,
                                  fontFamily: 'monospace'
                                }}>
                                  {data ? formatReading(value) : '---'}
                                </span>
                                {data && param.unit && <span style={{ color: theme.textDim, fontSize: 14 }}>{param.unit}</span>}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const dash: React.CSSProperties = {
  background: 'transparent', height: '100vh', overflow: 'hidden',
  fontFamily: '"JetBrains Mono","Fira Code",monospace',
  display: 'flex', flexDirection: 'column', gap: 8,
}

const headerStyle = (theme: AnalysisTheme): React.CSSProperties => ({
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '13px',
  background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '13px 17px', flexShrink: 0,
})

const panelStyle = (theme: AnalysisTheme): React.CSSProperties => ({
  background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '13px 15px',
})

export default TableViewDashboard
