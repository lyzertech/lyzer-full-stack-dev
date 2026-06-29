'use client'

import React, { useCallback, useEffect, useState } from 'react'
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

interface VoltageDataPoint {
  time: string
  V12?: number | null
  V23?: number | null
  V31?: number | null
}

interface AcuvimDataRow {
  Timestamp?: string
  V12_V?: number | string
  V23_V?: number | string
  V31_V?: number | string
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

interface LineChartWidgetProps {
  device?: DeviceNode | null
}

const LineChartWidget: React.FC<LineChartWidgetProps> = ({ device }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<VoltageDataPoint[]>([])
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const fetchVoltageData = useCallback(async () => {
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
        setError('No voltage data available')
        setLastUpdate(null)
        return
      }

      // Transform data to chart format
      const transformedData: VoltageDataPoint[] = rows
        .map((row) => ({
          time: row.Timestamp ? formatTimeOnly(String(row.Timestamp)) : '',
          V12: toNumber(row.V12_V),
          V23: toNumber(row.V23_V),
          V31: toNumber(row.V31_V),
        }))
        .filter((point) => point.time !== '')
        .reverse() // Most recent last

      setChartData(transformedData)
      setLastUpdate(rows[0]?.Timestamp ? formatTimestamp(String(rows[0].Timestamp)) : null)
    } catch (err: any) {
      setChartData([])
      setError(err.response?.data?.message || err.message || 'Failed to load voltage data')
      setLastUpdate(null)
    } finally {
      setLoading(false)
    }
  }, [device])

  useEffect(() => {
    fetchVoltageData()
  }, [fetchVoltageData])

  const subtitle = lastUpdate || (device ? 'No data available' : 'Select a device')

  return (
    <DashboardWidgetCard
      title={device?.label ?? 'Select device'}
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
            {device && (
              <button
                type="button"
                className="btn btn-sm btn-light border"
                onClick={fetchVoltageData}
              >
                Retry
              </button>
            )}
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
                domain={[0, 250]}
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
                formatter={(value: any) => {
                  if (value === null || value === undefined || typeof value !== 'number') {
                    return ['N/A', '']
                  }
                  return [`${value.toFixed(2)} V`, '']
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
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="V23"
                name="V23"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#10b981' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="V31"
                name="V31"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#f59e0b' }}
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

