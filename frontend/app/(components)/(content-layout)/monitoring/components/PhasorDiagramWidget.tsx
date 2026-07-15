'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { apiClient } from '@/lib/api-client'
import type { DeviceNode } from '../utils/deviceTree'
import DashboardWidgetCard from './DashboardWidgetCard'

interface AcuvimLatestRow {
  Timestamp?: string
  I1?: number | string
  I2?: number | string
  I3?: number | string
  V1?: number | string
  V2?: number | string
  V3?: number | string
  Ang_Vb?: number | string
  Ang_Vc?: number | string
  Ang_Ia?: number | string
  Ang_Ib?: number | string
  Ang_Ic?: number | string
}

interface PhasorData {
  magnitude: number
  angle: number // in degrees (for positioning)
  angleValue: number // actual angle value to display
  label: string
  color: string
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

interface PhasorDiagramProps {
  voltagePhasors: PhasorData[]
  currentPhasors: PhasorData[]
  angVa: number | null
  angVb: number | null
  angVc: number | null
  angIa: number | null
  angIb: number | null
  angIc: number | null
}

const PhasorDiagram: React.FC<PhasorDiagramProps> = ({ 
  voltagePhasors, 
  currentPhasors,
  angVa,
  angVb,
  angVc,
  angIa,
  angIb,
  angIc
}) => {
  const width = 300
  const height = 300
  const cx = width / 2
  const cy = height / 2
  const maxRadius = 120

  // Find max voltage magnitude for scaling (both voltage and current use same scale)
  const voltageMagnitudes = voltagePhasors.map(p => p.magnitude)
  const maxMagnitude = Math.max(...voltageMagnitudes, 1)

  const drawPhasor = (phasor: PhasorData, isVoltage: boolean) => {
    const scale = (maxRadius * 0.9) / maxMagnitude
    const length = isVoltage ? phasor.magnitude * scale : maxMagnitude * scale * 0.85 // Current same length as max voltage
    
    // Convert angle to radians (counter-clockwise from right/east)
    const angleRad = (phasor.angle * Math.PI) / 180
    
    // Both voltage and current start from center
    const startX = cx
    const startY = cy
    
    const x = cx + length * Math.cos(angleRad)
    const y = cy - length * Math.sin(angleRad) // Subtract because SVG y increases downward

    const strokeWidth = isVoltage ? 3 : 2
    const arrowSize = isVoltage ? 8 : 6

    // Calculate arrowhead points
    const arrowAngle1 = angleRad + Math.PI * 0.85
    const arrowAngle2 = angleRad - Math.PI * 0.85
    const ax1 = x + arrowSize * Math.cos(arrowAngle1)
    const ay1 = y - arrowSize * Math.sin(arrowAngle1)
    const ax2 = x + arrowSize * Math.cos(arrowAngle2)
    const ay2 = y - arrowSize * Math.sin(arrowAngle2)

    // Label position (slightly beyond the arrow)
    const labelDist = length + 15
    const labelX = cx + labelDist * Math.cos(angleRad)
    const labelY = cy - labelDist * Math.sin(angleRad)

    return (
      <g key={`${phasor.label}-${isVoltage ? 'v' : 'i'}`}>
        {/* Phasor line */}
        <line
          x1={startX}
          y1={startY}
          x2={x}
          y2={y}
          stroke={phasor.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={isVoltage ? undefined : "4,3"} // Dashed for current
        />
        {/* Arrowhead */}
        <polygon
          points={`${x},${y} ${ax1},${ay1} ${ax2},${ay2}`}
          fill={phasor.color}
        />
        {/* Label */}
        <text
          x={labelX}
          y={labelY}
          fill={phasor.color}
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {phasor.label}
        </text>
        {/* Angle value label */}
        <text
          x={labelX}
          y={labelY + 12}
          fill={phasor.color}
          fontSize="9"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {phasor.angleValue.toFixed(1)}°
        </text>
      </g>
    )
  }

  return (
    <div className="d-flex flex-column align-items-center" style={{ minHeight: 320 }}>
      {/* Small compact legend - organized by phase */}
      <div className="d-flex gap-3 mb-2 justify-content-center" style={{ fontSize: '0.7rem' }}>
        {/* Phase A */}
        <div className="d-flex flex-column gap-1" style={{ minWidth: '70px' }}>
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-muted">∠Va:</span>
            <span className="fw-bold font-monospace text-end" style={{ color: '#dc3545', minWidth: '45px' }}>
              {angVa !== null ? `${angVa.toFixed(1)}°` : '---'}
            </span>
          </div>
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-muted">∠Ia:</span>
            <span className="fw-bold font-monospace text-end" style={{ color: '#dc3545', minWidth: '45px' }}>
              {angIa !== null ? `${angIa.toFixed(1)}°` : '---'}
            </span>
          </div>
        </div>
        
        {/* Phase B */}
        <div className="d-flex flex-column gap-1" style={{ minWidth: '70px' }}>
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-muted">∠Vb:</span>
            <span className="fw-bold font-monospace text-end" style={{ color: '#fd7e14', minWidth: '45px' }}>
              {angVb !== null ? `${angVb.toFixed(1)}°` : '---'}
            </span>
          </div>
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-muted">∠Ib:</span>
            <span className="fw-bold font-monospace text-end" style={{ color: '#fd7e14', minWidth: '45px' }}>
              {angIb !== null ? `${angIb.toFixed(1)}°` : '---'}
            </span>
          </div>
        </div>
        
        {/* Phase C */}
        <div className="d-flex flex-column gap-1" style={{ minWidth: '70px' }}>
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-muted">∠Vc:</span>
            <span className="fw-bold font-monospace text-end" style={{ color: '#0d6efd', minWidth: '45px' }}>
              {angVc !== null ? `${angVc.toFixed(1)}°` : '---'}
            </span>
          </div>
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-muted">∠Ic:</span>
            <span className="fw-bold font-monospace text-end" style={{ color: '#0d6efd', minWidth: '45px' }}>
              {angIc !== null ? `${angIc.toFixed(1)}°` : '---'}
            </span>
          </div>
        </div>
      </div>

      {/* Phasor diagram SVG */}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background circle */}
        <circle
          cx={cx}
          cy={cy}
          r={maxRadius}
          fill="none"
          stroke="var(--default-border)"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* Axis lines */}
        <line
          x1={cx - maxRadius}
          y1={cy}
          x2={cx + maxRadius}
          y2={cy}
          stroke="var(--default-border)"
          strokeWidth="1"
          opacity="0.3"
        />
        <line
          x1={cx}
          y1={cy - maxRadius}
          x2={cx}
          y2={cy + maxRadius}
          stroke="var(--default-border)"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Origin point */}
        <circle cx={cx} cy={cy} r="3" fill="var(--text-muted)" />

        {/* Draw voltage phasors */}
        {voltagePhasors.map(phasor => drawPhasor(phasor, true))}

        {/* Draw current phasors */}
        {currentPhasors.map(phasor => drawPhasor(phasor, false))}
      </svg>
    </div>
  )
}

interface PhasorDiagramWidgetProps {
  device?: DeviceNode | null
}

const PhasorDiagramWidget: React.FC<PhasorDiagramWidgetProps> = ({ device }) => {
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

  // Prepare phasor data
  const voltagePhasors: PhasorData[] = []
  const currentPhasors: PhasorData[] = []
  
  // Angle values for legend
  let ang_va: number | null = null
  let ang_vb: number | null = null
  let ang_vc: number | null = null
  let ang_ia: number | null = null
  let ang_ib: number | null = null
  let ang_ic: number | null = null

  if (latestRow) {
    const v1 = toNumber(latestRow.V1)
    const v2 = toNumber(latestRow.V2)
    const v3 = toNumber(latestRow.V3)
    const i1 = toNumber(latestRow.I1)
    const i2 = toNumber(latestRow.I2)
    const i3 = toNumber(latestRow.I3)
    
    // Get phase angles from API
    ang_va = 0 // Va is always reference at 0°
    ang_vb = toNumber(latestRow.Ang_Vb) ?? -120 // Default to -120° if not available
    ang_vc = toNumber(latestRow.Ang_Vc) ?? -240 // Default to -240° if not available
    ang_ia = toNumber(latestRow.Ang_Ia) ?? -30  // Default lag if not available
    ang_ib = toNumber(latestRow.Ang_Ib) ?? -150
    ang_ic = toNumber(latestRow.Ang_Ic) ?? -270

    // Voltage phasors (Va is reference at 0°)
    if (v1 !== null) {
      voltagePhasors.push({
        magnitude: v1,
        angle: 0, // Va is reference
        angleValue: 0,
        label: 'Va',
        color: '#dc3545', // Red
      })
    }
    if (v2 !== null) {
      voltagePhasors.push({
        magnitude: v2,
        angle: ang_vb,
        angleValue: ang_vb,
        label: 'Vb',
        color: '#fd7e14', // Orange
      })
    }
    if (v3 !== null) {
      voltagePhasors.push({
        magnitude: v3,
        angle: ang_vc,
        angleValue: ang_vc,
        label: 'Vc',
        color: '#0d6efd', // Blue
      })
    }

    // Current phasors using actual phase angles from API
    if (i1 !== null) {
      currentPhasors.push({
        magnitude: i1,
        angle: ang_ia,
        angleValue: ang_ia,
        label: 'Ia',
        color: '#dc3545',
      })
    }
    if (i2 !== null) {
      currentPhasors.push({
        magnitude: i2,
        angle: ang_ib,
        angleValue: ang_ib,
        label: 'Ib',
        color: '#fd7e14',
      })
    }
    if (i3 !== null) {
      currentPhasors.push({
        magnitude: i3,
        angle: ang_ic,
        angleValue: ang_ic,
        label: 'Ic',
        color: '#0d6efd',
      })
    }
  }

  const deviceLabel = device?.label ?? 'No device selected'
  const subtitle = latestRow?.Timestamp
    ? `${deviceLabel} | ${formatTimestamp(String(latestRow.Timestamp))}`
    : device
      ? `${deviceLabel} | No data available`
      : 'Select a device to view phasor diagram'

  return (
    <DashboardWidgetCard
      title="Phasor Diagram"
      subtitle={subtitle}
      icon="bi-diagram-3"
    >
      <div className="p-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner size="sm" animation="border" className="me-2" />
            Loading phasor data...
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
        ) : voltagePhasors.length === 0 && currentPhasors.length === 0 ? (
          <div className="text-center py-5 text-muted">
            {device ? 'No phasor data available' : 'Select a device to view phasor diagram'}
          </div>
        ) : (
          <PhasorDiagram 
            voltagePhasors={voltagePhasors} 
            currentPhasors={currentPhasors}
            angVa={ang_va}
            angVb={ang_vb}
            angVc={ang_vc}
            angIa={ang_ia}
            angIb={ang_ib}
            angIc={ang_ic}
          />
        )}
      </div>
    </DashboardWidgetCard>
  )
}

export default PhasorDiagramWidget
