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

interface CurrentDataPoint {
  time: string
  I1?: number | null
  I2?: number | null
  I3?: number | null
}

interface AcuvimDataRow {
  Timestamp?: string
  I1?: number | string
  I2?: number | string
  I3?: number | string
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
  I1?: number | string
  I2?: number | string
  I3?: number | string
}

interface CurrentTrendsWidgetProps {
  device?: DeviceNode | null
  chartData?: AcuvimDataRow[]
  loading?: boolean
  error?: string | null
}

const CurrentTrendsWidget: React.FC<CurrentTrendsWidgetProps> = ({
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
        I1: toNumber(row.I1),
        I2: toNumber(row.I2),
        I3: toNumber(row.I3),
      }))
      .filter((point) => point.time !== '')
  }, [rawChartData])

  // Calculate dynamic Y-axis domain based on data
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 20]

    const allValues: number[] = []
    chartData.forEach((point) => {
      if (point.I1 !== null) allValues.push(point.I1)
      if (point.I2 !== null) allValues.push(point.I2)
      if (point.I3 !== null) allValues.push(point.I3)
    })

    if (allValues.length === 0) return [0, 20]

    const maxValue = Math.max(...allValues)
    const padding = maxValue * 0.1 // 10% padding

    return [
      0, // Current cannot be negative
      Math.ceil(maxValue + padding),
    ]
  }, [chartData])

  const subtitle = device ? undefined : 'Select a device to view current trends'

  return (
    <DashboardWidgetCard
      title="Current Trends"
      subtitle={subtitle}
      icon="bi-lightning-charge"
      bodyClassName="pb-2"
    >
      <div style={{ height: 300 }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner size="sm" animation="border" className="me-2" />
            <span className="text-muted">Loading current data...</span>
          </div>
        ) : error ? (
          <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <div className="text-danger fs-13 mb-2">{error}</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center h-100 text-muted">
            {device ? 'No data to display' : 'Select a device to view current trends'}
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
                label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'var(--text-muted)' } }}
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
                    I1: 'Current Phase A (L1)',
                    I2: 'Current Phase B (L2)',
                    I3: 'Current Phase C (L3)',
                  }
                  
                  const label = labelMap[name as string] || name
                  return [`${value.toFixed(2)} A`, label]
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: 12 }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="I1"
                name="Current Phase A (L1)"
                stroke="#dc3545"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#dc3545' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="I2"
                name="Current Phase B (L2)"
                stroke="#fd7e14"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#fd7e14' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="I3"
                name="Current Phase C (L3)"
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

export default CurrentTrendsWidget
