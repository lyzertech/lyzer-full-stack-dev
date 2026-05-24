'use client'

import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import {
  Card,
  Col,
  Row,
  Button,
  Table,
  Form,
  InputGroup,
  Pagination,
  Badge,
  Spinner,
  Alert,
} from 'react-bootstrap'

// ─── Column group definitions ────────────────────────────────────────────────
type ColDef = { key: string; label: string; unit?: string }

const COLUMN_GROUPS: {
  label: string
  icon: string
  color: string
  cols: ColDef[]
}[] = [
  {
    label: 'Device Info',
    icon: 'bi-cpu',
    color: 'primary',
    cols: [
      { key: 'gateway_name', label: 'Gateway' },
      { key: 'device_online', label: 'Online' },
    ],
  },
  {
    label: 'Voltage (V)',
    icon: 'bi-lightning-charge',
    color: 'warning',
    cols: [
      { key: 'V1', label: 'V1', unit: 'V' },
      { key: 'V2', label: 'V2', unit: 'V' },
      { key: 'V3', label: 'V3', unit: 'V' },
      { key: 'Vnavg_V', label: 'Vn avg', unit: 'V' },
      { key: 'V12', label: 'V12', unit: 'V' },
      { key: 'V23', label: 'V23', unit: 'V' },
      { key: 'V31', label: 'V31', unit: 'V' },
      { key: 'Vlavg_V', label: 'Vl avg', unit: 'V' },
    ],
  },
  {
    label: 'Current (A)',
    icon: 'bi-arrows-vertical',
    color: 'info',
    cols: [
      { key: 'I1', label: 'I1', unit: 'A' },
      { key: 'I2', label: 'I2', unit: 'A' },
      { key: 'I3', label: 'I3', unit: 'A' },
      { key: 'Iavg_A', label: 'Iavg', unit: 'A' },
      { key: 'In', label: 'In', unit: 'A' },
    ],
  },
  {
    label: 'Power',
    icon: 'bi-graph-up',
    color: 'success',
    cols: [
      { key: 'Freq_Hz', label: 'Freq', unit: 'Hz' },
      { key: 'Psum_kW', label: 'P sum', unit: 'kW' },
      { key: 'Qsum_kvar', label: 'Q sum', unit: 'kvar' },
      { key: 'Ssum_kVA', label: 'S sum', unit: 'kVA' },
    ],
  },
  {
    label: 'Power Factor',
    icon: 'bi-lightning-fill',
    color: 'teal',
    cols: [
      { key: 'PF1', label: 'PF1' },
      { key: 'PF2', label: 'PF2' },
      { key: 'PF3', label: 'PF3' },
      { key: 'PF', label: 'PF avg' },
      { key: 'LoadType', label: 'Load Type' },
    ],
  },
  {
    label: 'Energy (kWh)',
    icon: 'bi-battery-charging',
    color: 'danger',
    cols: [
      { key: 'EP_IMP_kWh', label: 'EP imp', unit: 'kWh' },
      { key: 'EP_EXP_kWh', label: 'EP exp', unit: 'kWh' },
      { key: 'EP_TOTAL_kWh', label: 'EP total', unit: 'kWh' },
      { key: 'EP_NET_kWh', label: 'EP net', unit: 'kWh' },
      { key: 'EQ_IMP_kvarh', label: 'EQ imp', unit: 'kvarh' },
      { key: 'EQ_EXP_kvarh', label: 'EQ exp', unit: 'kvarh' },
      { key: 'EQ_TOTAL_kvarh', label: 'EQ total', unit: 'kvarh' },
      { key: 'EQ_NET_kvarh', label: 'EQ net', unit: 'kvarh' },
      { key: 'ES_kVAh', label: 'ES', unit: 'kVAh' },
    ],
  },
  {
    label: 'Demand',
    icon: 'bi-speedometer2',
    color: 'secondary',
    cols: [
      { key: 'DMD_P_kW', label: 'DMD P', unit: 'kW' },
      { key: 'DMD_Q_kvar', label: 'DMD Q', unit: 'kvar' },
      { key: 'DMD_S_kVA', label: 'DMD S', unit: 'kVA' },
    ],
  },
  {
    label: 'THD / Harmonics',
    icon: 'bi-activity',
    color: 'purple',
    cols: [
      { key: 'THD_Va', label: 'THD Va', unit: '%' },
      { key: 'THD_Vb', label: 'THD Vb', unit: '%' },
      { key: 'THD_Vc', label: 'THD Vc', unit: '%' },
      { key: 'THD_Vavg', label: 'THD Vavg', unit: '%' },
      { key: 'THD_Ia', label: 'THD Ia', unit: '%' },
      { key: 'THD_Ib', label: 'THD Ib', unit: '%' },
      { key: 'THD_Ic', label: 'THD Ic', unit: '%' },
      { key: 'THD_Iavg', label: 'THD Iavg', unit: '%' },
    ],
  },
  {
    label: 'Unbalance',
    icon: 'bi-symmetry-vertical',
    color: 'orange',
    cols: [
      { key: 'Unbl_V', label: 'Unbl V', unit: '%' },
      { key: 'Unbl_I', label: 'Unbl I', unit: '%' },
    ],
  },
]

const ALL_GROUPS_LABEL = 'Device Info'

const TIMESTAMP_COL: ColDef = { key: 'Timestamp', label: 'Timestamp' }

const fmt = (val: any, unit?: string): string => {
  if (val === null || val === undefined || val === '') return '—'
  if (typeof val === 'boolean') return val ? '✓' : '✗'
  if (typeof val === 'number')
    return `${parseFloat(val.toFixed(3))}${unit ? ' ' + unit : ''}`
  return String(val)
}

// ─── Main Component ──────────────────────────────────────────────────────────
const DataRetrievalPage = () => {
  const searchParams = useSearchParams()

  // Device list
  const [deviceList, setDeviceList] = useState<any[]>([])
  const [selectedDevice, setSelectedDevice] = useState('')

  // Filters
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [activeGroup, setActiveGroup] = useState(0)

  // Data
  const [rows, setRows] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // UI state
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Tracks whether we already auto-fetched on redirect (to avoid double calls)
  const hasAutoFetched = useRef(false)

  // Load device list on mount
  useEffect(() => {
    apiClient.get('/monitoring/acuvim/devices')
      .then((res) => res.data || [])
      .then((data) => {
        setDeviceList(data)
        // Pre-select from query param (redirected from Devices page)
        const paramDevice = searchParams.get('device_name')
        if (paramDevice) {
          setSelectedDevice(paramDevice)
        } else if (data.length > 0) {
          setSelectedDevice(data[0].device_name)
        }
      })
      .catch(() => setDeviceList([]))
  }, [])


  const fetchData = useCallback(
    async (page = 1) => {
      if (!selectedDevice) return
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          device_name: selectedDevice,
          per_page: String(perPage),
          page: String(page),
        })
        if (dateFrom) params.set('date_from', dateFrom)
        if (dateTo) params.set('date_to', dateTo)

        const res = await apiClient.get(`/monitoring/acuvim/data?${params}`)
        setRows(res.data?.data ?? [])
        setMeta(res.data)
        setCurrentPage(page)
        setFetched(true)
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Network error. Could not reach the server.')
      } finally {
        setLoading(false)
      }
    },
    [selectedDevice, dateFrom, dateTo, perPage],
  )

  // Auto-fetch when redirected from Devices page with a device_name param
  useEffect(() => {
    const paramDevice = searchParams.get('device_name')
    if (
      paramDevice &&
      selectedDevice === paramDevice &&
      !hasAutoFetched.current
    ) {
      hasAutoFetched.current = true
      fetchData(1)
    }
  }, [selectedDevice, fetchData, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData(1)
  }

  const group = COLUMN_GROUPS[activeGroup]
  const totalPages = meta?.last_page ?? 1

  // Pagination items (show max 7)
  const paginationItems = () => {
    const items = []
    const start = Math.max(1, currentPage - 3)
    const end = Math.min(totalPages, currentPage + 3)
    for (let i = start; i <= end; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => fetchData(i)}
        >
          {i}
        </Pagination.Item>,
      )
    }
    return items
  }

  return (
    <React.Fragment>
      <Seo title="Data Retrieval - Monitoring" />
      <Pageheader
        title="Data"
        subtitle="Monitoring"
        currentpage="Acuvim Data Retrieval"
        activepage="Monitoring"
      />

      {/* ── Filter Card ── */}
      <Row className="mb-4">
        <Col xl={12}>
          <Card className="custom-card shadow-sm border-0">
            <Card.Header className="border-bottom-0 pb-0">
              <Card.Title className="fw-bold fs-15">
                <i className="bi bi-funnel me-2 text-primary" />
                Data Retrieval Filter
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row className="gy-3 gx-3 align-items-end bg-primary-transparent p-3 rounded-3 mx-0 border border-primary-transparent">
                  {/* Device Name */}
                  <Col xxl={4} xl={4} lg={5} md={12}>
                    <Form.Label className="fs-11 fw-bold text-muted mb-1 text-uppercase">
                      <i className="bi bi-cpu me-1" />
                      Device Name
                    </Form.Label>
                    <Form.Select
                      id="device-select"
                      className="border-default shadow-none"
                      value={selectedDevice}
                      onChange={(e) => setSelectedDevice(e.target.value)}
                      required
                    >
                      <option value="">Select a device...</option>
                      {deviceList.map((d, i) => (
                        <option key={i} value={d.device_name}>
                          {d.device_name}
                          {d.device_model ? ` — ${d.device_model}` : ''}
                          {d.gateway_name ? ` (${d.gateway_name})` : ''}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  {/* Date From */}
                  <Col xxl={2} xl={2} lg={3} md={6}>
                    <Form.Label className="fs-11 fw-bold text-muted mb-1 text-uppercase">
                      <i className="bi bi-calendar-event me-1" />
                      From
                    </Form.Label>
                    <Form.Control
                      id="date-from"
                      type="date"
                      className="border-default shadow-none"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </Col>

                  {/* Date To */}
                  <Col xxl={2} xl={2} lg={3} md={6}>
                    <Form.Label className="fs-11 fw-bold text-muted mb-1 text-uppercase">
                      <i className="bi bi-calendar-check me-1" />
                      To
                    </Form.Label>
                    <Form.Control
                      id="date-to"
                      type="date"
                      className="border-default shadow-none"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </Col>

                  {/* Per Page */}
                  <Col xxl={2} xl={2} lg={3} md={6}>
                    <Form.Label className="fs-11 fw-bold text-muted mb-1 text-uppercase">
                      <i className="bi bi-list-ol me-1" />
                      Rows / Page
                    </Form.Label>
                    <Form.Select
                      id="per-page"
                      className="border-default shadow-none"
                      value={perPage}
                      onChange={(e) => setPerPage(Number(e.target.value))}
                    >
                      {[10, 25, 50, 100, 200].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  {/* Action */}
                  <Col xxl={2} xl={2} lg={3} md={6} className="d-flex gap-2">
                    <Button
                      id="fetch-data-btn"
                      type="submit"
                      variant="primary"
                      className="w-100 shadow-sm"
                      disabled={loading || !selectedDevice}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-1" />
                          Loading…
                        </>
                      ) : (
                        <>
                          <i className="bi bi-search me-1" />
                          Fetch Data
                        </>
                      )}
                    </Button>
                    {fetched && (
                      <Button
                        variant="secondary-light"
                        className="border-0 shadow-sm px-3"
                        title="Clear"
                        onClick={() => {
                          setRows([])
                          setMeta(null)
                          setFetched(false)
                        }}
                      >
                        <i className="bi bi-x-lg" />
                      </Button>
                    )}
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Error ── */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </Alert>
      )}

      {/* ── Results Card ── */}
      {fetched && (
        <Row>
          <Col xl={12}>
            <Card className="custom-card shadow-sm border-0">
              <Card.Header className="border-bottom-0 pb-0">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 w-100">
                  <div>
                    <Card.Title className="fw-bold fs-15 mb-0">
                      <i className="bi bi-table me-2 text-primary" />
                      {selectedDevice}
                    </Card.Title>
                    <span className="text-muted fs-12">
                      {meta?.total?.toLocaleString() ?? 0} records found
                      {(dateFrom || dateTo) && (
                        <span className="ms-2">
                          <Badge
                            bg="primary-transparent"
                            className="text-primary border border-primary-transparent fs-10"
                          >
                            {dateFrom || '…'} → {dateTo || 'now'}
                          </Badge>
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-1 flex-wrap">
                    {COLUMN_GROUPS.map((g, i) => (
                      <Button
                        key={i}
                        size="sm"
                        variant={
                          activeGroup === i ? g.color : `${g.color}-light`
                        }
                        className={`border-0 shadow-none fs-11 fw-semibold ${activeGroup === i ? '' : 'opacity-75'}`}
                        onClick={() => setActiveGroup(i)}
                        id={`tab-group-${i}`}
                      >
                        <i className={`${g.icon} me-1`} />
                        {g.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card.Header>

              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table
                    className="table table-hover text-nowrap align-middle mb-0"
                    style={{ fontSize: '12px' }}
                  >
                    <thead
                      style={{ position: 'sticky', top: 0, zIndex: 1 }}
                      className="bg-primary-transparent border-0"
                    >
                      <tr>
                        <th
                          className="border-0 ps-3 text-muted fw-bold fs-11"
                          style={{ width: 50 }}
                        >
                          #
                        </th>
                        {[TIMESTAMP_COL, ...group.cols].map((c) => (
                          <th
                            key={c.key}
                            className="border-0 fw-bold text-primary fs-11 text-uppercase"
                          >
                            {c.label}
                            {c.unit && (
                              <span className="text-muted ms-1 fw-normal">
                                ({c.unit})
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length > 0 ? (
                        rows.map((row, idx) => (
                          <tr
                            key={row.id ?? idx}
                            className="border-bottom border-default"
                          >
                            <td className="ps-3 text-muted fs-11">
                              {(currentPage - 1) * perPage + idx + 1}
                            </td>
                            {[TIMESTAMP_COL, ...group.cols].map((c) => {
                              const val = row[c.key]
                              // Special rendering for device_online
                              if (c.key === 'device_online') {
                                const onlineCls = val
                                  ? 'bg-success-transparent text-success border border-success-transparent'
                                  : 'bg-danger-transparent text-danger border border-danger-transparent'
                                return (
                                  <td key={c.key}>
                                    <span
                                      className={`d-inline-flex align-items-center px-2 rounded-pill fw-semibold ${onlineCls}`}
                                      style={{ fontSize: 11, gap: 5 }}
                                    >
                                      <span
                                        className={`rounded-circle ${val ? 'bg-success' : 'bg-danger'}`}
                                        style={{
                                          width: 6,
                                          height: 6,
                                          display: 'inline-block',
                                          flexShrink: 0,
                                        }}
                                      />
                                      {val ? 'Online' : 'Offline'}
                                    </span>
                                  </td>
                                )
                              }
                              // Timestamp formatting
                              if (c.key === 'Timestamp') {
                                return (
                                  <td key={c.key}>
                                    <span className="fw-medium text-default">
                                      {val
                                        ? new Date(val).toLocaleString()
                                        : '—'}
                                    </span>
                                  </td>
                                )
                              }
                              // Numeric highlight for key values
                              const isNumeric = typeof val === 'number'
                              return (
                                <td key={c.key}>
                                  <span
                                    className={
                                      isNumeric
                                        ? 'fw-medium text-default'
                                        : 'text-muted'
                                    }
                                  >
                                    {fmt(val)}
                                  </span>
                                </td>
                              )
                            })}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={[TIMESTAMP_COL, ...group.cols].length + 1}
                            className="text-center py-5"
                          >
                            <div className="text-muted fs-15">
                              No data found for this device and date range.
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>

              <Card.Footer className="border-top-0 d-flex align-items-center justify-content-between py-3 flex-wrap gap-2">
                <span className="text-muted fs-12 fw-medium">
                  Page {currentPage} of {totalPages}
                  &nbsp;·&nbsp; Showing {rows.length} of{' '}
                  {meta?.total?.toLocaleString() ?? 0} records
                </span>
                <Pagination className="pagination-sm mb-0 shadow-sm">
                  <Pagination.First
                    disabled={currentPage === 1}
                    onClick={() => fetchData(1)}
                  />
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => fetchData(currentPage - 1)}
                  />
                  {paginationItems()}
                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => fetchData(currentPage + 1)}
                  />
                  <Pagination.Last
                    disabled={currentPage === totalPages}
                    onClick={() => fetchData(totalPages)}
                  />
                </Pagination>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      )}

      {/* ── Empty State ── */}
      {!fetched && !loading && (
        <Row>
          <Col xl={12}>
            <Card className="custom-card shadow-sm border-0">
              <Card.Body className="py-5 text-center">
                <div className="avatar avatar-xl bg-primary-transparent text-primary avatar-rounded mx-auto mb-3">
                  <i className="bi bi-database-down fs-24" />
                </div>
                <h5 className="fw-bold text-muted">Select a Device to Begin</h5>
                <p className="text-muted fs-13 mb-0">
                  Choose a device name from the dropdown above, optionally set a
                  date range, then click <strong>Fetch Data</strong>.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </React.Fragment>
  )
}

export default DataRetrievalPage
