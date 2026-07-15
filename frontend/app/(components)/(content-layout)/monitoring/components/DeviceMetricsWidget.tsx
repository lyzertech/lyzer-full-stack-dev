'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { apiClient } from '@/lib/api-client'
import type { DeviceNode } from '../utils/deviceTree'
import DashboardWidgetCard from './DashboardWidgetCard'

interface AcuvimLatestRow {
  Timestamp?: string
  Vlavg_V?: number | string
  Iavg_A?: number | string
  Psum_kW?: number | string
  Qsum_kvar?: number | string
  PF?: number | string
}

interface MetricRow {
  key: keyof Pick<AcuvimLatestRow, 'Vlavg_V' | 'Iavg_A' | 'Psum_kW' | 'Qsum_kvar' | 'PF'>
  label: string
}

const METRIC_ROWS: MetricRow[] = [
  { key: 'Vlavg_V', label: 'Voltage Line Average' },
  { key: 'Iavg_A', label: 'Current Average' },
  { key: 'Psum_kW', label: 'Active Power Total' },
  { key: 'Qsum_kvar', label: 'Reactive Power Total' },
  { key: 'PF', label: 'Power Factor' },
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
  const offsetMin = -date.getTimezoneOffset()
  const sign = offsetMin >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMin)
  const offsetHours = pad(Math.floor(abs / 60))
  const offsetMinutes = pad(abs % 60)

  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${offsetHours}:${offsetMinutes}`
}

interface DeviceMetricsWidgetProps {
  device?: DeviceNode | null
}

const DeviceMetricsWidget: React.FC<DeviceMetricsWidgetProps> = ({ device }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latestRow, setLatestRow] = useState<AcuvimLatestRow | null>(null)
  const [fontLoaded, setFontLoaded] = useState(false)

  const fetchLatest = useCallback(async () => {
    const deviceName = device?.meta?.device_name ?? device?.label
    if (!deviceName) {
      setLatestRow(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        device_name: deviceName,
        per_page: '1',
        page: '1',
      })
      if (device.meta?.device_code) {
        params.set('device_serial', device.meta.device_code)
      }

      const res = await apiClient.get(`/monitoring/acuvim/data?${params}`)
      const row = (res.data?.data ?? [])[0] as AcuvimLatestRow | undefined
      if (!row) {
        setLatestRow(null)
        setError('No readings available')
        return
      }
      setLatestRow(row)
    } catch (err: any) {
      setLatestRow(null)
      setError(err.response?.data?.message || err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [device])

  useEffect(() => {
    fetchLatest()
  }, [fetchLatest])

  useEffect(() => {
    // Check if DSEG font is available
    const checkFont = async () => {
      if (typeof document !== 'undefined' && 'fonts' in document) {
        try {
          console.log('DeviceMetricsWidget: Attempting to load DSEG7Classic font...')
          await document.fonts.load('400 16px DSEG7Classic')
          console.log('DeviceMetricsWidget: DSEG7Classic font loaded successfully')
          setFontLoaded(true)
        } catch (error) {
          console.warn('DeviceMetricsWidget: DSEG7Classic font failed to load:', error)
          // Font failed to load, but continue anyway
          setFontLoaded(true)
        }
      } else {
        console.log('DeviceMetricsWidget: Font Loading API not available, using fallback')
        // Fallback for browsers without Font Loading API
        setTimeout(() => setFontLoaded(true), 100)
      }
    }
    checkFont()
  }, [])

  const deviceLabel = device?.label ?? 'No device selected'
  const subtitle = latestRow?.Timestamp
    ? `${deviceLabel} | ${formatTimestamp(String(latestRow.Timestamp))}`
    : device
      ? `${deviceLabel} | No data available`
      : 'Select a device to view metrics'

  return (
    <DashboardWidgetCard
      title="Power Metrics"
      subtitle={subtitle}
      icon="bi-speedometer2"
    >
      <div className="p-0">
        {loading ? (
          <div className="text-center py-4">
            <Spinner size="sm" animation="border" className="me-2" />
            Loading...
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="text-danger mb-2 small">{error}</div>
            {device && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={fetchLatest}
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <div>
            {METRIC_ROWS.map((row, index) => {
              const value = toNumber(latestRow?.[row.key])
              const unit = 
                row.key === 'Vlavg_V' ? 'V' : 
                row.key === 'Iavg_A' ? 'A' : 
                row.key === 'Psum_kW' ? 'kW' :
                row.key === 'Qsum_kvar' ? 'kvar' :
                '' // PF has no unit
              const colors = ['primary', 'success', 'warning', 'info', 'danger']
              const color = colors[index % colors.length]
              
              // Determine PF position (LAGGING/LEADING) based on reactive power
              let pfPosition = ''
              if (row.key === 'PF') {
                const qValue = toNumber(latestRow?.Qsum_kvar)
                if (qValue !== null) {
                  if (qValue > 0) {
                    pfPosition = 'LAGGING'
                  } else if (qValue < 0) {
                    pfPosition = 'LEADING'
                  }
                }
              }
              
              return (
                <div key={row.key} className={`card border-${color} mb-2`}>
                  <div className="card-body p-3">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className={`text-${color} small fw-bold text-uppercase`} style={{ whiteSpace: 'pre-line' }}>
                          {row.label}
                        </div>
                      </div>
                      <div className="col-auto">
                        <div className="d-flex align-items-center">
                          <span className="fs-4 fw-bold font-monospace me-2">
                            {formatReading(value)}
                          </span>
                          <span className="text-muted small">
                            {unit}
                          </span>
                          {pfPosition && (
                            <span className={`badge bg-${pfPosition === 'LAGGING' ? 'warning' : 'info'} ms-2`}>
                              {pfPosition}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardWidgetCard>
  )
}

export default DeviceMetricsWidget
