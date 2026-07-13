'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
import { apiClient } from '@/lib/api-client'
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

const formatTimeOnly = (timestamp: string): string => {
  const iso = timestamp.includes('T') ? timestamp : timestamp.replace(' ', 'T')
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return timestamp

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface CurrentTrendsWidgetProps {
  device?: DeviceNode | null
}

const CurrentTrendsWidget: React.FC<CurrentTrendsWidgetProps> = ({ device }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<CurrentDataPoint[]>([])
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const fetchCurrentData = useCallback(async () => {
    const deviceName = device?.meta?.device_name ?? device?.label
    if (!deviceName) {
      setChartData([])
      setError(null)
      setLastUpdate(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Calculate time range: today from 00:00 to 23:55
      const now = new Date()
      const startTime = new Date(now)
      startTime.setHours(0, 0, 0, 0) // Start at 00:00 today
      
      const endTime = new Date(now)
      endTime.setHours(23, 55, 0, 0) // End at 23:55 today

      // Format dates for API (ISO format without timezone)
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      }

      // Fetch data with 5-minute intervals (288 points: 00:00 to 23:55)
      const params = new URLSearchParams({
        device_name: deviceName,
        per_page: '288', // 24 hours * 60 minutes / 5 minutes = 288 intervals
        page: '1',
        start_date: formatDateForAPI(startTime),
        end_date: formatDateForAPI(endTime),
      })
      
      if (device?.meta?.device_code) {
        params.set('device_serial', device.meta.device_code)
      }

      const res = await apiClient.get(`/monitoring/acuvim/data?${params}`)
      const responseData = typeof res.data === 'object' && res.data !== null ? res.data : {}
      const rows = (responseData.data ?? []) as AcuvimDataRow[]

      if (rows.length === 0) {
        setChartData([])
        setError('No current data available')
        setLastUpdate(null)
        return
      }

      // Transform data to chart format
      const transformedData: CurrentDataPoint[] = rows
        .map((row) => ({
          time: row.Timestamp ? formatTimeOnly(String(row.Timestamp)) : '',
          I1: toNumber(row.I1),
          I2: toNumber(row.I2),
          I3: toNumber(row.I3),
        }))
        .filter((point) => point.time !== '')
        .reverse() // Most recent last

      setChartData(transformedData)
      setLastUpdate(rows[0]?.Timestamp ? formatTimestamp(String(rows[0].Timestamp)) : null)
    } catch (err: any) {
      setChartData([])
      setError(err.response?.data?.message || err.message || 'Failed to load current data')
      setLastUpdate(null)
    } finally {
      setLoading(false)
    }
  }, [device])

  useEffect(() => {
    fetchCurrentData()
  }, [fetchCurrentData])

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

  const deviceLabel = device?.label ?? 'No device selected'
  const subtitle = lastUpdate
    ? `${deviceLabel} | ${lastUpdate}`
    : device
      ? `${deviceLabel} | No data available`
      : 'Select a device to view current trends'

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
            {device && (
              <button
                type="button"
                className="btn btn-sm btn-light border"
                onClick={fetchCurrentData}
              >
                Retry
              </button>
            )}
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
