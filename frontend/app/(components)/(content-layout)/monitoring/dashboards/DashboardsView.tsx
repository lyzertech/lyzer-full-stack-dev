'use client'

import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { Badge, Col, Row, Spinner } from 'react-bootstrap'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import { apiClient } from '@/lib/api-client'
import DeviceSelector from '../components/DeviceSelector'
import CurrentGaugeWidget from '../components/CurrentGaugeWidget'
import LineChartWidget from '../components/LineChartWidget'
import CurrentTrendsWidget from '../components/CurrentTrendsWidget'
import PhasorDiagramWidget from '../components/PhasorDiagramWidget'
import QuadrantPhasorWidget from '../components/QuadrantPhasorWidget'
import DeviceMetricsWidget from '../components/DeviceMetricsWidget'
import EnergyMetricsWidget from '../components/EnergyMetricsWidget'
import type { DeviceNode } from '../utils/deviceTree'

interface AcuvimDataRow {
  Timestamp?: string
  [key: string]: any
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

const DashboardsView: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceNode | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latestRow, setLatestRow] = useState<AcuvimDataRow | null>(null)
  const [chartData, setChartData] = useState<AcuvimDataRow[]>([])

  const fetchData = useCallback(async () => {
    const deviceName = selectedDevice?.meta?.device_name ?? selectedDevice?.label
    if (!deviceName) {
      setLatestRow(null)
      setChartData([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const now = new Date()
      const startTime = new Date(now)
      startTime.setHours(0, 0, 0, 0)

      const endTime = new Date(now)
      endTime.setHours(23, 55, 0, 0)

      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      }

      const params = new URLSearchParams({
        device_name: deviceName,
        per_page: '288',
        page: '1',
        start_date: formatDateForAPI(startTime),
        end_date: formatDateForAPI(endTime),
        interval_min: '5',
      })

      if (selectedDevice?.meta?.device_code) {
        params.set('device_serial', selectedDevice.meta.device_code)
      }

      const res = await apiClient.get(`/monitoring/acuvim/data?${params}`)
      const rows = (res.data?.data ?? []) as AcuvimDataRow[]

      if (rows.length === 0) {
        setLatestRow(null)
        setChartData([])
        setError('No data available for this device')
        return
      }

      setLatestRow(rows[0])
      setChartData(rows)
    } catch (err: any) {
      setLatestRow(null)
      setChartData([])
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load device data',
      )
    } finally {
      setLoading(false)
    }
  }, [selectedDevice])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const deviceName = selectedDevice?.label ?? 'ND20_Test'

  return (
    <Fragment>
      <Pageheader
        title="Monitoring"
        subtitle="Dashboards"
        currentpage={selectedDevice?.label ?? 'Select device'}
        activepage="Dashboards"
      />
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <DeviceSelector
              selected={selectedDevice}
              onSelect={setSelectedDevice}
            />
            <Badge bg="light" className="text-muted border">
              Public
            </Badge>
          </div>
          {selectedDevice?.meta && (
            <div className="text-muted fs-12 mt-1">
              {selectedDevice.meta.facility_name}
              {selectedDevice.meta.model
                ? ` · ${selectedDevice.meta.model}`
                : ''}
              {selectedDevice.meta.ip ? ` · ${selectedDevice.meta.ip}` : ''}
            </div>
          )}
          {latestRow?.Timestamp && (
            <div className="d-flex align-items-center gap-2 text-muted fs-12 mt-1">
              <i className="bi bi-clock" />
              <span>Last update: {formatTimestamp(String(latestRow.Timestamp))}</span>
            </div>
          )}
        </div>
      </div>

      {loading && !latestRow && (
        <div className="text-center py-5">
          <Spinner animation="border" className="me-2" />
          <span className="text-muted">Loading device data...</span>
        </div>
      )}

      {error && !latestRow && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between">
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={fetchData}
          >
            Retry
          </button>
        </div>
      )}

      <Row className="g-3">
        <Col xl={9} lg={6} md={6}>
          <Row className="g-3">
            <Col xl={4} lg={6} md={6}>
              <CurrentGaugeWidget
                device={selectedDevice}
                latestRow={latestRow}
                loading={loading}
                error={error}
              />
            </Col>
            <Col xl={4} lg={6} md={6}>
              <PhasorDiagramWidget
                device={selectedDevice}
                latestRow={latestRow}
                loading={loading}
                error={error}
              />
            </Col>
            <Col xl={4} lg={6} md={6}>
              <QuadrantPhasorWidget
                device={selectedDevice}
                latestRow={latestRow}
                loading={loading}
                error={error}
              />
            </Col>
            <Col xl={12} lg={12} md={12}>
              <EnergyMetricsWidget
                device={selectedDevice}
                latestRow={latestRow}
                loading={loading}
                error={error}
              />
            </Col>
          </Row>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <DeviceMetricsWidget
            device={selectedDevice}
            latestRow={latestRow}
            loading={loading}
            error={error}
          />
        </Col>

        <Col xl={6} lg={12}>
          <LineChartWidget
            device={selectedDevice}
            chartData={chartData}
            loading={loading}
            error={error}
          />
        </Col>
        <Col xl={6} lg={12}>
          <CurrentTrendsWidget
            device={selectedDevice}
            chartData={chartData}
            loading={loading}
            error={error}
          />
        </Col>
      </Row>
    </Fragment>
  )
}

export default DashboardsView

