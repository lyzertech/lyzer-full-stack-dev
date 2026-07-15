'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { apiClient } from '@/lib/api-client'
import type { DeviceNode } from '../utils/deviceTree'

interface AcuvimEnergyRow {
  Timestamp?: string
  EP_IMP_kWh?: number | string
  EP_EXP_kWh?: number | string
  EQ_IMP_kvarh?: number | string
  EQ_EXP_kvarh?: number | string
  ES_kVAh?: number | string
}

interface EnergyMetricRow {
  key: keyof Pick<AcuvimEnergyRow, 'EP_IMP_kWh' | 'EP_EXP_kWh' | 'EQ_IMP_kvarh' | 'EQ_EXP_kvarh' | 'ES_kVAh'>
  label: string
  unit: string
}

const ENERGY_METRIC_ROWS: EnergyMetricRow[] = [
  { key: 'EP_IMP_kWh', label: 'Active Energy Import', unit: 'kWh' },
  { key: 'EP_EXP_kWh', label: 'Active Energy Export', unit: 'kWh' },
  { key: 'EQ_IMP_kvarh', label: 'Reactive Energy Import', unit: 'kvarh' },
  { key: 'EQ_EXP_kvarh', label: 'Reactive Energy Export', unit: 'kvarh' },
  { key: 'ES_kVAh', label: 'Apparent Energy', unit: 'kVAh' },
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

interface EnergyMetricsWidgetProps {
  device?: DeviceNode | null
}

const EnergyMetricsWidget: React.FC<EnergyMetricsWidgetProps> = ({ device }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latestRow, setLatestRow] = useState<AcuvimEnergyRow | null>(null)

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
      const row = (res.data?.data ?? [])[0] as AcuvimEnergyRow | undefined
      if (!row) {
        setLatestRow(null)
        setError('No energy data available')
        return
      }
      setLatestRow(row)
    } catch (err: any) {
      setLatestRow(null)
      setError(err.response?.data?.message || err.message || 'Failed to load energy data')
    } finally {
      setLoading(false)
    }
  }, [device])

  useEffect(() => {
    fetchLatest()
  }, [fetchLatest])

  const deviceLabel = device?.label ?? 'No device selected'
  const subtitle = latestRow?.Timestamp
    ? `${deviceLabel} | ${formatTimestamp(String(latestRow.Timestamp))}`
    : device
      ? `${deviceLabel} | No data available`
      : 'Select a device to view energy metrics'

  return (
    <div>
      {loading ? (
        <div className="text-center py-2">
          <Spinner size="sm" animation="border" className="me-2" />
          Loading...
        </div>
      ) : error ? (
        <div className="text-center py-2">
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
        <div className="row g-2">
          {ENERGY_METRIC_ROWS.map((row, index) => {
            const value = toNumber(latestRow?.[row.key])
            const colors = ['primary', 'success', 'warning', 'info', 'danger']
            const color = colors[index % colors.length]
            
            return (
              <div key={row.key} className="col">
                <div className={`card border-${color}`}>
                  <div className="card-body p-2">
                    <div className={`text-${color} fw-bold text-uppercase mb-1`} style={{ fontSize: '0.80rem', lineHeight: '1.2' }}>
                      {row.label}
                    </div>
                    <div className="d-flex align-items-baseline">
                      <span className="fs-5 fw-bold font-monospace me-1">
                        {formatReading(value)}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {row.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default EnergyMetricsWidget
