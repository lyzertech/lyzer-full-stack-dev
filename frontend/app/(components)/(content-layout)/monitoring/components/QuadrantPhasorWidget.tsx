'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { apiClient } from '@/lib/api-client'
import type { DeviceNode } from '../utils/deviceTree'
import DashboardWidgetCard from './DashboardWidgetCard'

interface AcuvimLatestRow {
  Timestamp?: string
  Psum_kW?: number | string
  Qsum_kvar?: number | string
  PF?: number | string
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

interface QuadrantDiagramProps {
  kW: number
  kVAR: number
  pf: number | null
}

const QuadrantDiagram: React.FC<QuadrantDiagramProps> = ({ kW, kVAR, pf }) => {
  const width = 240
  const height = 240
  const cx = width / 2
  const cy = height / 2
  const radius = 80

  // Calculate angle in radians (from positive X-axis, counter-clockwise)
  const angleRad = Math.atan2(kVAR, kW)
  const angleDeg = (angleRad * 180) / Math.PI

  // Determine quadrant and color
  const quadrant = 
    kW >= 0 && kVAR >= 0 ? 1 :
    kW < 0 && kVAR >= 0 ? 2 :
    kW < 0 && kVAR < 0 ? 3 : 4

  const quadrantColors: Record<number, string> = {
    1: '#2196F3', // Blue
    2: '#FF9800', // Orange
    3: '#F44336', // Red
    4: '#4CAF50', // Green
  }

  const color = quadrantColors[quadrant]

  // Create arc path for the filled sector - fill entire quadrant (90°)
  const createArcPath = () => {
    // Define start and end angles for each quadrant (in radians)
    const quadrantAngles: Record<number, { start: number; end: number }> = {
      1: { start: 0, end: Math.PI / 2 },           // 0° to 90°
      2: { start: Math.PI / 2, end: Math.PI },     // 90° to 180°
      3: { start: Math.PI, end: 3 * Math.PI / 2 }, // 180° to 270°
      4: { start: 3 * Math.PI / 2, end: 2 * Math.PI }, // 270° to 360°
    }

    const { start: startAngle, end: endAngle } = quadrantAngles[quadrant]
    
    // Calculate start and end points
    const startX = cx + radius * Math.cos(startAngle)
    const startY = cy - radius * Math.sin(startAngle)
    const endX = cx + radius * Math.cos(endAngle)
    const endY = cy - radius * Math.sin(endAngle)
    
    // Path: Move to center, Line to start, Arc to end, Line back to center
    return `M ${cx} ${cy} L ${startX} ${startY} A ${radius} ${radius} 0 0 0 ${endX} ${endY} Z`
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: 280 }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Filled arc sector */}
        <path
          d={createArcPath()}
          fill={color}
          opacity="0.6"
        />

        {/* Axes */}
        <line
          x1={20}
          y1={cy}
          x2={width - 20}
          y2={cy}
          stroke="var(--default-border)"
          strokeWidth="2"
        />
        <line
          x1={cx}
          y1={20}
          x2={cx}
          y2={height - 20}
          stroke="var(--default-border)"
          strokeWidth="2"
        />

        {/* Axis labels */}
        <text
          x={width - 15}
          y={cy - 8}
          fill="var(--text-muted)"
          fontSize="11"
          fontWeight="bold"
        >
          kW
        </text>
        <text
          x={cx + 8}
          y={25}
          fill="var(--text-muted)"
          fontSize="11"
          fontWeight="bold"
        >
          kVAR
        </text>

        {/* Origin point */}
        <circle cx={cx} cy={cy} r="3" fill="var(--text-muted)" />
      </svg>

      {/* Values display below diagram */}
      <div className="mt-2 text-center">
        <div className="d-flex gap-3 justify-content-center mb-1">
          <span className="small">
            <strong className="text-danger">kW:</strong> {kW.toFixed(2)}
          </span>
          <span className="small">
            <strong className="text-primary">kVAR:</strong> {kVAR.toFixed(2)}
          </span>
        </div>
        <div className="d-flex gap-3 justify-content-center">
          <span className="small">
            <strong className="text-success">kVA:</strong> {Math.sqrt(kW * kW + kVAR * kVAR).toFixed(2)}
          </span>
          {pf !== null && (
            <span className="small">
              <strong className="text-muted">PF:</strong> {pf.toFixed(3)}
              {kVAR > 0 && <span className="badge bg-warning ms-1" style={{ fontSize: '0.65rem' }}>LAGGING</span>}
              {kVAR < 0 && <span className="badge bg-info ms-1" style={{ fontSize: '0.65rem' }}>LEADING</span>}
            </span>
          )}
        </div>
        <div className="mt-1">
          <span className="badge" style={{ backgroundColor: color }}>
            Quadrant {quadrant}
          </span>
        </div>
      </div>
    </div>
  )
}

interface QuadrantPhasorWidgetProps {
  device?: DeviceNode | null
}

const QuadrantPhasorWidget: React.FC<QuadrantPhasorWidgetProps> = ({ device }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latestRow, setLatestRow] = useState<AcuvimLatestRow | null>(null)

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

  const kW = toNumber(latestRow?.Psum_kW) ?? 0
  const kVAR = toNumber(latestRow?.Qsum_kvar) ?? 0
  const pf = toNumber(latestRow?.PF)

  const deviceLabel = device?.label ?? 'No device selected'
  const subtitle = latestRow?.Timestamp
    ? `${deviceLabel} | ${formatTimestamp(String(latestRow.Timestamp))}`
    : device
      ? `${deviceLabel} | No data available`
      : 'Select a device to view power quadrant'

  return (
    <DashboardWidgetCard
      title="Power Quadrant"
      subtitle={subtitle}
      icon="bi-grid-3x3"
    >
      <div className="p-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner size="sm" animation="border" className="me-2" />
            Loading power data...
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
          <QuadrantDiagram kW={kW} kVAR={kVAR} pf={pf} />
        )}
      </div>
    </DashboardWidgetCard>
  )
}

export default QuadrantPhasorWidget
