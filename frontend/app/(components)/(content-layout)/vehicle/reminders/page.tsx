'use client'

import React, { Fragment, useEffect, useState, useCallback } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row, Badge, Modal, Form, Table, Button } from 'react-bootstrap'
import { getReminders, refreshReminders } from '@/app/actions/vehicle/vehicle.actions'

const statusColors: Record<string, string> = {
  overdue: 'danger', due_today: 'warning', upcoming: 'info', completed: 'success', dismissed: 'secondary',
}
const statusLabels: Record<string, string> = {
  overdue: 'Overdue', due_today: 'Due Today', upcoming: 'Upcoming', completed: 'Completed', dismissed: 'Dismissed',
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, per_page: 20 }
      if (filterStatus) params.status = filterStatus
      if (filterType) params.type = filterType
      const result = await getReminders(params) as any
      setReminders(result)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus, filterType])

  useEffect(() => { load() }, [load])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshReminders()
      load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setRefreshing(false)
    }
  }

  const items = reminders?.data ?? []
  const paginationMeta = reminders ? { current: reminders.current_page, last: reminders.last_page, total: reminders.total } : null

  return (
    <Fragment>
      <Seo title="Maintenance Reminders" />
      <Pageheader title="Vehicle" subtitle="Maintenance" currentpage="Reminders" activepage="Fleet Management" />

      <Row className="g-3">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <div className="card-title mb-0">
                <i className="ri-alarm-warning-fill me-2 text-danger" /> Maintenance Reminders
                {paginationMeta && <Badge bg="primary" className="ms-2 fs-11">{paginationMeta.total}</Badge>}
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <Form.Select style={{ maxWidth: 150 }} value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}>
                  <option value="">All Status</option>
                  <option value="overdue">Overdue</option>
                  <option value="due_today">Due Today</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </Form.Select>
                <Form.Select style={{ maxWidth: 180 }} value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setPage(1) }}>
                  <option value="">All Types</option>
                  <option value="scheduled_maintenance">Scheduled Maintenance</option>
                  <option value="insurance_expiry">Insurance Expiry</option>
                  <option value="registration_expiry">Registration Expiry</option>
                </Form.Select>
                <Button variant="outline-primary" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  {refreshing
                    ? <><span className="spinner-border spinner-border-sm me-1" />Refreshing...</>
                    : <><i className="ri-refresh-line me-1" />Refresh Status</>
                  }
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold fs-12">Title</th>
                        <th className="fw-semibold fs-12">Vehicle</th>
                        <th className="fw-semibold fs-12">Type</th>
                        <th className="fw-semibold fs-12">Due Date</th>
                        <th className="fw-semibold fs-12">Due Odometer</th>
                        <th className="fw-semibold fs-12">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-5">
                            <i className="ri-checkbox-circle-line d-block fs-30 text-success mb-2" />
                            No active reminders — fleet is up to date!
                          </td>
                        </tr>
                      ) : items.map((r: any) => (
                        <tr key={r.id} className={r.status === 'overdue' ? 'table-danger' : r.status === 'due_today' ? 'table-warning' : ''}>
                          <td>
                            <div className="fw-semibold fs-13">{r.title}</div>
                            {r.description && <div className="text-muted fs-11">{r.description}</div>}
                          </td>
                          <td>
                            <div className="fw-semibold fs-12">{r.vehicle?.vehicle_code}</div>
                            <div className="text-muted fs-11">{r.vehicle?.plate_number}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark fs-11">
                              {r.reminder_type.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="fs-12">
                            {r.due_date
                              ? new Date(r.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                              : '—'
                            }
                          </td>
                          <td className="fs-12">
                            {r.due_odometer
                              ? <>{Number(r.due_odometer).toLocaleString('id-ID')} km</>
                              : '—'
                            }
                          </td>
                          <td>
                            <Badge bg={statusColors[r.status] ?? 'secondary'}>
                              {statusLabels[r.status] ?? r.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
            {paginationMeta && paginationMeta.last > 1 && (
              <Card.Footer className="d-flex justify-content-between align-items-center">
                <span className="text-muted fs-12">Page {paginationMeta.current} of {paginationMeta.last}</span>
                <div className="d-flex gap-1">
                  <Button size="sm" variant="light" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    <i className="ri-arrow-left-s-line" />
                  </Button>
                  <Button size="sm" variant="light" disabled={page === paginationMeta.last} onClick={() => setPage(page + 1)}>
                    <i className="ri-arrow-right-s-line" />
                  </Button>
                </div>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}
