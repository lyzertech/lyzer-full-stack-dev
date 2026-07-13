'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { apiClient } from '@/lib/api-client'
import type { DeviceNode } from '../utils/deviceTree'
import DashboardWidgetCard from './DashboardWidgetCard'

const ARC_COLORS = [
  '#ff4444', // Phase A - Red
  '#ffa500', // Phase B - Orange  
  '#4488ff', // Phase C - Blue
]

const ARC_LABELS = ['Phase A (L1)', 'Phase B (L2)', 'Phase C (L3)']

/** Speedometer rings: outer → inner (L1 → L3) */
const GAUGE_RINGS = [
  { inner: '86%', outer: '96%' }, // Outermost - L1
  { inner: '74%', outer: '84%' }, // Middle - L2
  { inner: '62%', outer: '72%' }, // Innermost - L3
]

const START_ANGLE = 180
const END_ANGLE = 0

/** Recharts-style degrees: 180 = left, 90 = top, 0 = right */
const gaugeAngleDeg = (t: number) => START_ANGLE - t * (START_ANGLE - END_ANGLE)

const gaugePoint = (
  cx: number,
  cy: number,
  radius: number,
  t: number,
) => {
  const deg = gaugeAngleDeg(t)
  const rad = (deg * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(rad),
    y: cy - radius * Math.sin(rad),
  }
}

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : null
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

const computeGaugeMax = (values: number[]): number => {
  const peak = values.length > 0 ? Math.max(...values) : 0
  if (peak <= 0) return 20
  const padded = Math.ceil(peak * 1.15)
  if (padded <= 20) return 20
  const magnitude = Math.pow(10, Math.floor(Math.log10(padded)))
  return Math.ceil(padded / magnitude) * magnitude
}

interface AcuvimLatestRow {
  Timestamp?: string
  I1?: number | string
  I2?: number | string
  I3?: number | string
}

interface CurrentGaugeWidgetProps {
  device?: DeviceNode | null
}

const CurrentGaugeWidget: React.FC<CurrentGaugeWidgetProps> = ({ device }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latestRow, setLatestRow] = useState<AcuvimLatestRow | null>(null)

  const fetchLatestCurrents = useCallback(async () => {
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
        setError('No current readings available for this device')
        return
      }
      setLatestRow(row)
    } catch (err: any) {
      setLatestRow(null)
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load current data',
      )
    } finally {
      setLoading(false)
    }
  }, [device])

  useEffect(() => {
    fetchLatestCurrents()
  }, [fetchLatestCurrents])

  const currents = useMemo(
    () => [
      toNumber(latestRow?.I1),
      toNumber(latestRow?.I2),
      toNumber(latestRow?.I3),
    ],
    [latestRow],
  )

  const gaugeMax = useMemo(
    () => computeGaugeMax(currents.filter((v): v is number => v !== null)),
    [currents],
  )

  const deviceLabel = device?.label ?? 'No device selected'
  const subtitle = latestRow?.Timestamp
    ? `${deviceLabel} | ${formatTimestamp(String(latestRow.Timestamp))}`
    : device
      ? `${deviceLabel} | No data available`
      : 'Select a device to view measurements'

  const tickCount = 11
  const cx = 150
  const cy = 155

  return (
    <DashboardWidgetCard
      title="Current Measurement"
      subtitle={subtitle}
      icon="bi-cpu"
    >
      <div className="p-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner size="sm" animation="border" className="me-2" />
            Loading currents...
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="text-danger mb-2 small">{error}</div>
            {device && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={fetchLatestCurrents}
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Simple Gauge Display */}
            <div className="text-center mb-3">
              <div className="position-relative" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {GAUGE_RINGS.map((ring) => (
                      <Pie
                        key={`track-${ring.outer}`}
                        data={[{ value: 1 }]}
                        cx="50%"
                        cy="78%"
                        startAngle={START_ANGLE}
                        endAngle={END_ANGLE}
                        innerRadius={ring.inner}
                        outerRadius={ring.outer}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={false}
                      >
                        <Cell fill="#e9ecef" />
                      </Pie>
                    ))}

                    {GAUGE_RINGS.map((ring, index) => {
                      const value = currents[index] ?? 0
                      const pct = gaugeMax > 0 ? Math.min((value / gaugeMax) * 100, 100) : 0
                      const colors = ['#dc3545', '#fd7e14', '#0d6efd'] // Standard Bootstrap colors
                      return (
                        <Pie
                          key={`value-${ring.outer}`}
                          data={[
                            { name: 'filled', value: pct },
                            { name: 'empty', value: 100 - pct },
                          ]}
                          cx="50%"
                          cy="78%"
                          startAngle={START_ANGLE}
                          endAngle={END_ANGLE}
                          innerRadius={ring.inner}
                          outerRadius={ring.outer}
                          dataKey="value"
                          stroke="none"
                          isAnimationActive={false}
                        >
                          <Cell fill={colors[index]} />
                          <Cell fill="transparent" />
                        </Pie>
                      )
                    })}
                  </PieChart>
                </ResponsiveContainer>

                <svg
                  className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
                  viewBox="0 0 300 200"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {Array.from({ length: tickCount }, (_, i) => {
                    const t = i / (tickCount - 1)
                    const tickValue = gaugeMax * t
                    const outer = gaugePoint(cx, cy, 98, t)
                    const inner = gaugePoint(cx, cy, 90, t)
                    const label = gaugePoint(cx, cy, 108, t)
                    return (
                      <g key={i}>
                        <line
                          x1={inner.x}
                          y1={inner.y}
                          x2={outer.x}
                          y2={outer.y}
                          stroke="#6c757d"
                          strokeWidth={1}
                        />
                        <text
                          x={label.x}
                          y={label.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#495057"
                          fontSize="9"
                        >
                          {Number.isInteger(tickValue) ? tickValue : tickValue.toFixed(1)}
                        </text>
                      </g>
                    )
                  })}
                  
                  <text
                    x={cx}
                    y={cy + 30}
                    textAnchor="middle"
                    fill="#6c757d"
                    fontSize="10"
                  >
                    AMPERES
                  </text>
                </svg>
              </div>
            </div>

            {/* Phase Readings */}
            <div className="row g-2">
              {ARC_LABELS.map((label, index) => {
                const colors = ['danger', 'warning', 'primary']
                return (
                  <div key={label} className="col-4">
                    <div className={`card border-${colors[index]}`}>
                      <div className="card-body p-2 text-center">
                        <div className={`text-${colors[index]} small fw-bold mb-1`}>
                          {label.split(' ')[0]}
                        </div>
                        <div className="fw-bold">
                          {currents[index] !== null ? `${currents[index]!.toFixed(1)}A` : '---'}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {label.includes('(') ? label.match(/\((.*?)\)/)?.[1] : `L${index + 1}`}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </DashboardWidgetCard>
  )
}

export default CurrentGaugeWidget
