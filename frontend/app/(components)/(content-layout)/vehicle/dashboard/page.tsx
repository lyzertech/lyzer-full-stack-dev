'use client'

import React, { Fragment, useEffect, useState, useCallback } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row, Badge, Table } from 'react-bootstrap'
import { getVehicleDashboard, type VehicleDashboardData } from '@/app/actions/vehicle/vehicle.actions'
import Link from 'next/link'

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: unknown): string => {
  const num = typeof n === 'number' ? n : Number(n ?? 0)
  if (isNaN(num)) return '0'
  return num.toLocaleString('id-ID', { maximumFractionDigits: 0 })
}

const fmtCurrency = (n: unknown): string => {
  const num = typeof n === 'number' ? n : Number(n ?? 0)
  if (isNaN(num)) return 'Rp 0'
  return 'Rp ' + num.toLocaleString('id-ID', { maximumFractionDigits: 0 })
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: 'success',
    Maintenance: 'warning',
    Breakdown: 'danger',
    Retired: 'secondary',
    'In Progress': 'primary',
    Pending: 'warning',
    Completed: 'success',
    Cancelled: 'danger',
    Draft: 'secondary',
  }
  return <Badge bg={map[status] ?? 'secondary'}>{status}</Badge>
}

const reminderStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    overdue: 'danger',
    due_today: 'warning',
    upcoming: 'info',
  }
  return (
    <Badge bg={map[status] ?? 'secondary'} className="text-capitalize">
      {status.replace('_', ' ')}
    </Badge>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: string
  subtitle?: string
  href?: string
}

function StatCard({ title, value, icon, color, subtitle, href }: StatCardProps) {
  const inner = (
    <Card className="custom-card h-100">
      <Card.Body>
        <div className="d-flex align-items-center gap-3">
          <div className={`avatar avatar-lg bg-${color}-transparent rounded-2 flex-shrink-0`}>
            <i className={`${icon} fs-22 text-${color}`} />
          </div>
          <div className="flex-grow-1 min-w-0">
            <p className="text-muted mb-1 fs-12 text-uppercase fw-semibold">{title}</p>
            <h3 className="mb-0 fw-bold">{value}</h3>
            {subtitle && <span className="fs-11 text-muted">{subtitle}</span>}
          </div>
        </div>
      </Card.Body>
    </Card>
  )

  if (href) return <Link href={href} className="text-decoration-none">{inner}</Link>
  return inner
}

// ─── Mini Bar Chart (CSS only) ────────────────────────────────────────────────

function MiniBarChart({ data }: { data: any[] }) {
  if (!data?.length) return <div className="text-muted text-center py-4 fs-13">No data yet</div>

  const maxVal = Math.max(...data.map((d) => Number(d.total || 0)), 1)

  return (
    <div className="d-flex align-items-end gap-1" style={{ height: 80 }}>
      {data.map((d, i) => {
        const pct = (Number(d.total || 0) / maxVal) * 100
        return (
          <div
            key={i}
            className="d-flex flex-column align-items-center flex-grow-1"
            title={`${d.month}: ${fmtCurrency(d.total)}`}
          >
            <div
              className="rounded-top bg-primary"
              style={{ height: `${Math.max(pct, 4)}%`, width: '100%', opacity: 0.7 + (i / data.length) * 0.3 }}
            />
          </div>
        )
      })}
    </div>
  )
}

// ─── Vehicle Status Donut (CSS only) ─────────────────────────────────────────

function StatusPills({ data }: { data: any[] }) {
  const colors: Record<string, string> = {
    Active: 'success',
    Maintenance: 'warning',
    Breakdown: 'danger',
    Retired: 'secondary',
  }
  const total = data.reduce((s, d) => s + Number(d.count), 0) || 1
  return (
    <div className="d-flex flex-column gap-2">
      {data.map((d) => (
        <div key={d.status} className="d-flex align-items-center gap-2">
          <div
            className={`bg-${colors[d.status] ?? 'secondary'} rounded-circle`}
            style={{ width: 10, height: 10, flexShrink: 0 }}
          />
          <span className="fs-13 flex-grow-1">{d.status}</span>
          <span className="fw-semibold fs-13">{d.count}</span>
          <span className="text-muted fs-11">
            {Math.round((Number(d.count) / total) * 100)}%
          </span>
          <div className="progress flex-grow-1" style={{ height: 6, minWidth: 60 }}>
            <div
              className={`progress-bar bg-${colors[d.status] ?? 'secondary'}`}
              style={{ width: `${(Number(d.count) / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const VehicleDashboardPage: React.FC = () => {
  const [data, setData] = useState<VehicleDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getVehicleDashboard()
      setData(result)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <Fragment>
        <Seo title="Fleet Dashboard" />
        <Pageheader title="Vehicle" subtitle="Dashboard" currentpage="Dashboard" activepage="Fleet Dashboard" />
        <Row className="g-3">
          {[1, 2, 3, 4].map((i) => (
            <Col key={i} xl={3} lg={6}>
              <Card className="custom-card">
                <Card.Body>
                  <div className="placeholder-glow">
                    <span className="placeholder col-8 mb-2 d-block" />
                    <span className="placeholder col-5 d-block" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
          <Col xl={12}>
            <Card className="custom-card">
              <Card.Body style={{ height: 200 }}>
                <div className="placeholder-glow h-100">
                  <span className="placeholder col-12 h-100 d-block" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Fragment>
    )
  }

  if (error || !data) {
    return (
      <Fragment>
        <Seo title="Fleet Dashboard" />
        <Pageheader title="Vehicle" subtitle="Dashboard" currentpage="Dashboard" activepage="Fleet Dashboard" />
        <Row>
          <Col xl={12}>
            <Card className="custom-card">
              <Card.Body>
                <div className="alert alert-danger">{error ?? 'No data'}</div>
                <button className="btn btn-primary btn-sm" onClick={load}>Retry</button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Fragment>
    )
  }

  const vs = data.vehicleSummary
  const rs = data.reminderSummary
  const mc = data.monthlyCost
  const ws = data.workOrderSummary

  return (
    <Fragment>
      <Seo title="Fleet Dashboard" />
      <Pageheader title="Vehicle" subtitle="Dashboard" currentpage="Dashboard" activepage="Fleet Dashboard" />

      {/* ── Quick Actions ── */}
      <Row className="g-2 mb-3">
        <Col>
          <div className="d-flex flex-wrap gap-2">
            <Link href="/vehicle/vehicles" className="btn btn-primary btn-sm">
              <i className="ri-add-line me-1" /> New Vehicle
            </Link>
            <Link href="/vehicle/work-orders" className="btn btn-warning btn-sm">
              <i className="ri-tools-line me-1" /> New Work Order
            </Link>
            <Link href="/vehicle/fuel-logs" className="btn btn-info btn-sm">
              <i className="ri-gas-station-line me-1" /> Log Fuel
            </Link>
            <Link href="/vehicle/inspections" className="btn btn-success btn-sm">
              <i className="ri-checkbox-multiple-line me-1" /> New Inspection
            </Link>
            <Link href="/vehicle/reminders" className="btn btn-danger btn-sm">
              <i className="ri-alarm-warning-line me-1" /> View Alerts
            </Link>
          </div>
        </Col>
      </Row>

      {/* ── KPI Cards Row 1: Fleet Status ── */}
      <Row className="g-3 mb-3">
        <Col xl={3} lg={6} md={6}>
          <StatCard
            title="Total Vehicles"
            value={fmt(vs.total_vehicles)}
            icon="ri-car-fill"
            color="primary"
            href="/vehicle/vehicles"
          />
        </Col>
        <Col xl={3} lg={6} md={6}>
          <StatCard
            title="Active"
            value={fmt(vs.active_vehicles)}
            icon="ri-checkbox-circle-fill"
            color="success"
            subtitle={`${vs.under_maintenance} in maintenance`}
            href="/vehicle/vehicles?status=Active"
          />
        </Col>
        <Col xl={3} lg={6} md={6}>
          <StatCard
            title="In Maintenance"
            value={fmt(vs.under_maintenance)}
            icon="ri-tools-fill"
            color="warning"
            subtitle={`${vs.breakdown} breakdown`}
            href="/vehicle/vehicles?status=Maintenance"
          />
        </Col>
        <Col xl={3} lg={6} md={6}>
          <StatCard
            title="Work Orders Active"
            value={fmt(ws.in_progress + ws.pending)}
            icon="ri-file-list-3-fill"
            color="info"
            subtitle={`${ws.completed_this_month} completed this month`}
            href="/vehicle/work-orders"
          />
        </Col>
      </Row>

      {/* ── KPI Cards Row 2: Alerts & Costs ── */}
      <Row className="g-3 mb-3">
        <Col xl={3} lg={6} md={6}>
          <StatCard
            title="Overdue Reminders"
            value={fmt(rs.overdue)}
            icon="ri-alarm-warning-fill"
            color="danger"
            subtitle={`${rs.due_today} due today`}
            href="/vehicle/reminders?status=overdue"
          />
        </Col>
        <Col xl={3} lg={6} md={6}>
          <StatCard
            title="Upcoming Reminders"
            value={fmt(rs.upcoming)}
            icon="ri-notification-3-fill"
            color="warning"
            subtitle="Within 7 days / 500 km"
            href="/vehicle/reminders?status=upcoming"
          />
        </Col>
        <Col xl={3} lg={6} md={6}>
          <StatCard
            title="Low Stock Alerts"
            value={fmt(data.lowStockCount)}
            icon="ri-store-fill"
            color="danger"
            subtitle="Spareparts below minimum"
            href="/vehicle/spareparts?low_stock=1"
          />
        </Col>
        <Col xl={3} lg={6} md={6}>
          <StatCard
            title="Monthly Cost"
            value={fmtCurrency(mc.total_cost)}
            icon="ri-money-dollar-circle-fill"
            color="primary"
            subtitle={`Fuel: ${fmtCurrency(mc.fuel_cost)}`}
            href="/vehicle/reports"
          />
        </Col>
      </Row>

      {/* ── Charts & Tables Row ── */}
      <Row className="g-3 mb-3">
        {/* Monthly Cost Trend */}
        <Col xl={5} lg={12}>
          <Card className="custom-card h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="card-title mb-0">Monthly Cost Trend</div>
              <Link href="/vehicle/reports" className="btn btn-xs btn-light">View Report</Link>
            </Card.Header>
            <Card.Body>
              <MiniBarChart data={data.monthlyCostTrend} />
              <div className="d-flex gap-4 mt-3 border-top pt-3 flex-wrap">
                <div>
                  <p className="text-muted fs-11 mb-1">Maintenance</p>
                  <h6 className="mb-0 text-warning">{fmtCurrency(mc.maintenance_cost)}</h6>
                </div>
                <div>
                  <p className="text-muted fs-11 mb-1">Fuel</p>
                  <h6 className="mb-0 text-info">{fmtCurrency(mc.fuel_cost)}</h6>
                </div>
                <div>
                  <p className="text-muted fs-11 mb-1">Sparepart</p>
                  <h6 className="mb-0 text-danger">{fmtCurrency(mc.sparepart_cost)}</h6>
                </div>
                <div>
                  <p className="text-muted fs-11 mb-1">Total</p>
                  <h6 className="mb-0 fw-bold">{fmtCurrency(mc.total_cost)}</h6>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Fleet Status Distribution */}
        <Col xl={3} lg={6}>
          <Card className="custom-card h-100">
            <Card.Header>
              <div className="card-title mb-0">Fleet Status</div>
            </Card.Header>
            <Card.Body>
              {data.vehicleStatusChart.length > 0
                ? <StatusPills data={data.vehicleStatusChart} />
                : <div className="text-muted text-center py-4 fs-13">No vehicle data</div>
              }
            </Card.Body>
          </Card>
        </Col>

        {/* Expiring Documents */}
        <Col xl={4} lg={6}>
          <Card className="custom-card h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="card-title mb-0">
                <i className="ri-file-shield-2-line me-1 text-warning" />
                Expiring Documents
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {data.expiringDocuments.length === 0 ? (
                <div className="text-muted text-center py-4 fs-13">
                  <i className="ri-checkbox-circle-line d-block fs-30 text-success mb-1" />
                  All documents are valid
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {data.expiringDocuments.map((v: any) => (
                    <Link
                      key={v.id}
                      href={`/vehicle/vehicles/${v.id}`}
                      className="list-group-item list-group-item-action px-3 py-2"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <div className="flex-grow-1">
                          <div className="fw-semibold fs-13">{v.vehicle_code}</div>
                          <div className="text-muted fs-11">
                            {v.plate_number} — {v.brand} {v.model}
                          </div>
                          {v.insurance_expiry && (
                            <div className="fs-11 text-danger">
                              <i className="ri-shield-line me-1" />
                              Ins: {new Date(v.insurance_expiry).toLocaleDateString('id-ID')}
                            </div>
                          )}
                          {v.registration_expiry && (
                            <div className="fs-11 text-warning">
                              <i className="ri-government-line me-1" />
                              Reg: {new Date(v.registration_expiry).toLocaleDateString('id-ID')}
                            </div>
                          )}
                        </div>
                        <i className="ri-arrow-right-s-line text-muted" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Work Orders + Reminders ── */}
      <Row className="g-3 mb-3">
        {/* Upcoming Reminders */}
        <Col xl={5} lg={12}>
          <Card className="custom-card h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="card-title mb-0">
                <i className="ri-alarm-warning-line me-1 text-danger" />
                Active Reminders
              </div>
              <Link href="/vehicle/reminders" className="btn btn-xs btn-danger">View All</Link>
            </Card.Header>
            <Card.Body className="p-0">
              {data.upcomingReminders.length === 0 ? (
                <div className="text-muted text-center py-4 fs-13">
                  <i className="ri-checkbox-circle-line d-block fs-30 text-success mb-1" />
                  No active reminders
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {data.upcomingReminders.map((r: any) => (
                    <div key={r.id} className="list-group-item px-3 py-2">
                      <div className="d-flex align-items-start gap-2">
                        <div className="flex-grow-1">
                          <div className="fw-semibold fs-13">{r.title}</div>
                          <div className="text-muted fs-11">
                            {r.vehicle_code} — {r.plate_number}
                          </div>
                          <div className="d-flex gap-2 mt-1 flex-wrap">
                            {r.due_date && (
                              <span className="fs-11 text-muted">
                                <i className="ri-calendar-line me-1" />
                                {new Date(r.due_date).toLocaleDateString('id-ID')}
                              </span>
                            )}
                            {r.due_odometer && (
                              <span className="fs-11 text-muted">
                                <i className="ri-speed-line me-1" />
                                {fmt(r.due_odometer)} km
                              </span>
                            )}
                          </div>
                        </div>
                        {reminderStatusBadge(r.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Work Orders */}
        <Col xl={7} lg={12}>
          <Card className="custom-card h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="card-title mb-0">
                <i className="ri-file-list-3-line me-1 text-primary" />
                Recent Work Orders
              </div>
              <Link href="/vehicle/work-orders" className="btn btn-xs btn-primary">View All</Link>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold fs-12">WO#</th>
                      <th className="fw-semibold fs-12">Vehicle</th>
                      <th className="fw-semibold fs-12">Type</th>
                      <th className="fw-semibold fs-12">Date</th>
                      <th className="fw-semibold fs-12">Cost</th>
                      <th className="fw-semibold fs-12">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentWorkOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-4 fs-13">
                          No work orders yet
                        </td>
                      </tr>
                    ) : (
                      data.recentWorkOrders.map((wo: any) => (
                        <tr key={wo.id}>
                          <td>
                            <Link href={`/vehicle/work-orders/${wo.id}`} className="text-primary fw-semibold fs-12">
                              {wo.work_order_number}
                            </Link>
                          </td>
                          <td>
                            <div className="fw-semibold fs-12">{wo.vehicle_code}</div>
                            <div className="text-muted fs-11">{wo.plate_number}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark fs-11">{wo.service_type}</span>
                          </td>
                          <td className="fs-12 text-muted">
                            {new Date(wo.service_date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="fs-12 fw-semibold text-nowrap">{fmtCurrency(wo.total_cost)}</td>
                          <td>{statusBadge(wo.status)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Low Stock Items ── */}
      {data.lowStockItems.length > 0 && (
        <Row className="g-3">
          <Col xl={12}>
            <Card className="custom-card border-danger" style={{ borderLeft: '4px solid var(--bs-danger)' }}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div className="card-title mb-0 text-danger">
                  <i className="ri-error-warning-line me-1" />
                  Low Stock Alerts — {data.lowStockCount} item{data.lowStockCount !== 1 ? 's' : ''} below minimum
                </div>
                <Link href="/vehicle/spareparts?low_stock=1" className="btn btn-xs btn-danger">Manage Stock</Link>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold fs-12">Code</th>
                        <th className="fw-semibold fs-12">Name</th>
                        <th className="fw-semibold fs-12">Category</th>
                        <th className="fw-semibold fs-12 text-end">Stock</th>
                        <th className="fw-semibold fs-12 text-end">Min Stock</th>
                        <th className="fw-semibold fs-12">Unit</th>
                        <th className="fw-semibold fs-12">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lowStockItems.map((item: any) => (
                        <tr key={item.id}>
                          <td className="fw-semibold fs-12">{item.sparepart_code}</td>
                          <td className="fs-12">{item.name}</td>
                          <td>
                            <span className="badge bg-light text-dark fs-11">{item.category || '-'}</span>
                          </td>
                          <td className="text-end fw-bold text-danger fs-12">{item.stock_quantity}</td>
                          <td className="text-end fs-12 text-muted">{item.minimum_stock}</td>
                          <td className="fs-12 text-muted">{item.unit}</td>
                          <td>
                            {Number(item.stock_quantity) === 0
                              ? <Badge bg="danger">Out of Stock</Badge>
                              : <Badge bg="warning">Low Stock</Badge>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Fragment>
  )
}

export default VehicleDashboardPage
