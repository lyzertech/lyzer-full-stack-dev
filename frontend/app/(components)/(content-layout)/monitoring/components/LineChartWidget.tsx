'use client'

import React, { useMemo } from 'react'
import { Spinner } from 'react-bootstrap'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import type { DeviceNode } from '../utils/deviceTree'
import DashboardWidgetCard from './DashboardWidgetCard'

interface VoltageDataPoint {
  time: string
  V12?: number | null
  V23?: number | null
  V31?: number | null
}

interface AcuvimDataRow {
  Timestamp?: string
  V12?: number | string
  V23?: number | string
  V31?: number | string
}

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : null
}

const formatTimeOnly = (timestamp: string): string => {
  const iso = timestamp.includes('T') ? timestamp : timestamp.replace(' ', 'T')
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return timestamp

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface AcuvimDataRow {
  Timestamp?: string
  V12?: number | string
  V23?: number | string
  V31?: number | string
}

interface LineChartWidgetProps {
  device?: DeviceNode | null
  chartData?: AcuvimDataRow[]
  loading?: boolean
  error?: string | null
}

const LineChartWidget: React.FC<LineChartWidgetProps> = ({
  device,
  chartData: rawChartData = [],
  loading = false,
  error = null
}) => {
  // Transform data to chart format
  const chartData = useMemo(() => {
    return rawChartData
      .map((row) => ({
        time: row.Timestamp ? formatTimeOnly(String(row.Timestamp)) : '',
        V12: toNumber(row.V12),
        V23: toNumber(row.V23),
        V31: toNumber(row.V31),
      }))
      .filter((point) => point.time !== '')
  }, [rawChartData])

  // Calculate dynamic Y-axis domain based on data
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 250]

    const allValues: number[] = []
    chartData.forEach((point) => {
      if (point.V12 !== null) allValues.push(point.V12)
      if (point.V23 !== null) allValues.push(point.V23)
      if (point.V31 !== null) allValues.push(point.V31)
    })

    if (allValues.length === 0) return [0, 250]

    const minValue = Math.min(...allValues)
    const maxValue = Math.max(...allValues)
    const range = maxValue - minValue
    const padding = range * 0.1 // 10% padding

    return [
      Math.floor(minValue - padding),
      Math.ceil(maxValue + padding),
    ]
  }, [chartData])

  const subtitle = device ? undefined : 'Select a device to view voltage trends'

  return (
    <DashboardWidgetCard
      title="Voltage Trends"
      subtitle={subtitle}
      icon="bi-graph-up"
      bodyClassName="pb-2"
    >
      <div style={{ height: 300 }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner size="sm" animation="border" className="me-2" />
            <span className="text-muted">Loading voltage data...</span>
          </div>
        ) : error ? (
          <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <div className="text-danger fs-13 mb-2">{error}</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center h-100 text-muted">
            {device ? 'No data to display' : 'Select a device to view voltage trends'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--default-border)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--default-border)' }}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                domain={yAxisDomain}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={45}
                label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'var(--text-muted)' } }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--custom-white)',
                  border: '1px solid var(--default-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: any, name: any) => {
                  if (value === null || value === undefined || typeof value !== 'number') {
                    return ['N/A', '']
                  }
                  
                  // Map dataKey to descriptive label
                  const labelMap: Record<string, string> = {
                    V12: 'Voltage Line 1-2',
                    V23: 'Voltage Line 2-3',
                    V31: 'Voltage Line 3-1',
                  }
                  
                  const label = labelMap[name as string] || name
                  return [`${value.toFixed(2)} V`, label]
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: 12 }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="V12"
                name="V12"
                stroke="#dc3545"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#dc3545' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="V23"
                name="V23"
                stroke="#fd7e14"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#fd7e14' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="V31"
                name="V31"
                stroke="#0d6efd"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#0d6efd' }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardWidgetCard>
  )
}

export default LineChartWidget

