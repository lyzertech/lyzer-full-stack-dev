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
}

interface MetricRow {
  key: keyof Pick<AcuvimLatestRow, 'Vlavg_V' | 'Iavg_A' | 'Psum_kW'>
  label: string
}

const METRIC_ROWS: MetricRow[] = [
  { key: 'Vlavg_V', label: 'Vl avg' },
  { key: 'Iavg_A', label: 'I avg' },
  { key: 'Psum_kW', label: 'P sum' },
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

  const subtitle = latestRow?.Timestamp
    ? formatTimestamp(String(latestRow.Timestamp))
    : device
      ? 'No data timestamp'
      : 'Select a device'

  return (
    <>
      <style jsx global>{`
        @font-face {
          font-family: 'DSEG7Classic';
          src: url('https://cdn.jsdelivr.net/npm/@kfonts/dseg7-classic@1.0.0/DSEG7Classic-Regular.woff2') format('woff2'),
               url('https://cdn.jsdelivr.net/gh/keshikan/DSEG@master/fonts/DSEG7-Classic/DSEG7Classic-Regular.woff2') format('woff2'),
               url('https://fonts.gstatic.com/l/font?kit=u-450q1lgwslOqpF_6gBZnPz&skey=a1029226f80653a8') format('woff2');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .device-metrics-widget .metrics-seven-segment {
          font-family: 'DSEG7Classic', 'Courier New', 'Share Tech Mono', monospace !important;
          font-size: 2.15rem;
          line-height: 1;
          letter-spacing: 0.08em;
          color: #ff2a2a;
          text-shadow: 
            0 0 3px #ff2a2a,
            0 0 6px #ff2a2a,
            0 0 12px #ff2a2a,
            0 0 18px #ff4444,
            0 0 24px #ff6666;
          filter: brightness(1.3);
          font-weight: 400;
          font-variant-numeric: tabular-nums;
        }

        .device-metrics-widget .metrics-seven-segment.font-loading {
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        .device-metrics-widget .font-debug {
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 8px;
          color: #888;
          background: rgba(255,255,255,0.8);
          padding: 1px 3px;
          border-radius: 2px;
          font-family: monospace;
        }

        .device-metrics-widget .metric-row {
          min-height: 78px;
          background: var(--custom-white);
        }

        .device-metrics-widget .metric-row + .metric-row {
          border-top: 1px solid var(--default-border);
        }
      `}</style>

      <DashboardWidgetCard
        title={device?.label ?? 'Select device'}
        subtitle={subtitle}
        icon="bi-speedometer2"
        className="device-metrics-widget"
        bodyClassName="p-0"
      >
        {/* Power Meter Frame */}
        <div style={{
          background: 'linear-gradient(135deg, #2a2d3a 0%, #1e212e 100%)',
          border: '3px solid #444',
          borderRadius: '8px',
          margin: '8px',
          position: 'relative',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
        }}>
          {/* Power Meter Header */}
          <div style={{
            background: 'linear-gradient(90deg, #9d4edd 0%, #c77dff 100%)',
            color: 'white',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 'bold',
            textAlign: 'center',
            borderRadius: '4px 4px 0 0',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            ⚡ DIGITAL POWER METER
          </div>
          
          {/* Status Indicators */}
          <div style={{
            position: 'absolute',
            top: '45px',
            right: '12px',
            display: 'flex',
            gap: '4px',
            flexDirection: 'column'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: loading ? '#ffa500' : (error ? '#ff4444' : '#00ff88'),
              boxShadow: `0 0 6px ${loading ? '#ffa500' : (error ? '#ff4444' : '#00ff88')}`,
              animation: loading ? 'pulse 1s infinite' : 'none'
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: latestRow ? '#00aaff' : '#333',
              boxShadow: latestRow ? '0 0 6px #00aaff' : 'none'
            }} />
          </div>

          {loading ? (
            <div className="text-center py-5" style={{ color: '#aaa' }}>
              <Spinner size="sm" animation="border" className="me-2" />
              Loading...
            </div>
          ) : error ? (
            <div className="text-center py-4 px-3">
              <div style={{ color: '#ff4444', fontSize: '13px', marginBottom: '8px' }}>{error}</div>
              {device && (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={fetchLatest}
                  style={{
                    background: 'linear-gradient(135deg, #666 0%, #444 100%)',
                    border: '1px solid #888',
                    color: 'white'
                  }}
                >
                  Retry
                </button>
              )}
            </div>
          ) : (
            <div style={{ padding: '12px' }}>
              {METRIC_ROWS.map((row) => {
                const value = toNumber(latestRow?.[row.key])
                const unit = row.key === 'Vlavg_V' ? 'V' : row.key === 'Iavg_A' ? 'A' : 'kW'
                return (
                  <div
                    key={row.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      position: 'relative'
                    }}
                  >
                    {/* Label */}
                    <div style={{
                      color: '#aaa',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {row.label}
                    </div>
                    
                    {/* Digital Display */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#000',
                      border: '2px inset #333',
                      borderRadius: '3px',
                      padding: '6px 12px',
                      minWidth: '120px',
                      justifyContent: 'flex-end'
                    }}>
                      <span className={`metrics-seven-segment ${!fontLoaded ? 'font-loading' : ''}`}>
                        {formatReading(value)}
                      </span>
                      <span style={{
                        color: '#666',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginLeft: '8px',
                        fontFamily: 'monospace'
                      }}>
                        {unit}
                      </span>
                    </div>
                  </div>
                )
              })}
              
              {/* Power Meter Badge */}
              <div style={{
                textAlign: 'center',
                marginTop: '8px',
                padding: '4px',
                background: 'rgba(157, 78, 221, 0.1)',
                borderRadius: '4px',
                border: '1px solid rgba(157, 78, 221, 0.3)'
              }}>
                <span style={{
                  color: '#9d4edd',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  🔌 Digital Energy Monitor
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Add pulsing animation */}
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </DashboardWidgetCard>
    </>
  )
}

export default DeviceMetricsWidget
