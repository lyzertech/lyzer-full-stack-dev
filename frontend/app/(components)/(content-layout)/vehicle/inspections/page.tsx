'use client'

import React, { Fragment, useEffect, useState, useCallback } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row, Badge, Modal, Form, Table, Button } from 'react-bootstrap'
import { getInspections, createInspection, getVehicles, getDrivers } from '@/app/actions/vehicle/vehicle.actions'

const INSPECTION_TYPES = ['Pre-Trip', 'Post-Trip', 'Daily', 'Weekly', 'Monthly', 'Periodic']
const statusColors: Record<string, string> = { Good: 'success', Warning: 'warning', Critical: 'danger' }

const DEFAULT_CHECKLIST_ITEMS = [
  { check_item: 'Engine Oil Level', category: 'Mechanical', result: 'Good' },
  { check_item: 'Coolant Level', category: 'Mechanical', result: 'Good' },
  { check_item: 'Brake Fluid', category: 'Mechanical', result: 'Good' },
  { check_item: 'Front Tires', category: 'Mechanical', result: 'Good' },
  { check_item: 'Rear Tires', category: 'Mechanical', result: 'Good' },
  { check_item: 'Brake Functionality', category: 'Safety', result: 'Good' },
  { check_item: 'Headlights', category: 'Electrical', result: 'Good' },
  { check_item: 'Tail Lights', category: 'Electrical', result: 'Good' },
  { check_item: 'Turn Signals', category: 'Electrical', result: 'Good' },
  { check_item: 'Horn', category: 'Electrical', result: 'Good' },
  { check_item: 'Windshield', category: 'Safety', result: 'Good' },
  { check_item: 'Wipers', category: 'Safety', result: 'Good' },
  { check_item: 'Seatbelts', category: 'Safety', result: 'Good' },
  { check_item: 'Fuel Level', category: 'Mechanical', result: 'Good' },
]

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<any>({
    vehicle_id: '', driver_id: '', inspection_date: new Date().toISOString().split('T')[0],
    inspection_type: 'Daily', odometer: '', general_notes: '',
    items: DEFAULT_CHECKLIST_ITEMS.map((i) => ({ ...i })),
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [filterVehicle, setFilterVehicle] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, per_page: 15 }
      if (filterVehicle) params.vehicle_id = filterVehicle
      const result = await getInspections(params) as any
      setInspections(result)
    } catch (e: any) { console.error(e) }
    finally { setLoading(false) }
  }, [page, filterVehicle])

  useEffect(() => {
    load()
    getVehicles({ per_page: 200 }).then((r: any) => setVehicles(r?.data ?? []))
    getDrivers({ per_page: 100, status: 'Active' }).then((r: any) => setDrivers(r?.data ?? []))
  }, [load])

  const setItem = (idx: number, key: string, val: string) => {
    setForm((f: any) => {
      const items = [...f.items]
      items[idx] = { ...items[idx], [key]: val }
      return { ...f, items }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        ...form,
        vehicle_id: parseInt(form.vehicle_id),
        driver_id: form.driver_id ? parseInt(form.driver_id) : undefined,
        odometer: form.odometer ? parseFloat(form.odometer) : undefined,
      }
      await createInspection(payload)
      setShowModal(false)
      load()
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const items = inspections?.data ?? []
  const paginationMeta = inspections ? { current: inspections.current_page, last: inspections.last_page, total: inspections.total } : null

  const healthColor = (score: number) => score >= 80 ? 'success' : score >= 50 ? 'warning' : 'danger'

  return (
    <Fragment>
      <Seo title="Inspections" />
      <Pageheader title="Vehicle" subtitle="Maintenance" currentpage="Inspections" activepage="Fleet Management" />

      <Row className="g-3">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <div className="card-title mb-0">
                <i className="ri-clipboard-line me-2 text-success" /> Inspection Checklists
                {paginationMeta && <Badge bg="primary" className="ms-2 fs-11">{paginationMeta.total}</Badge>}
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <Form.Select style={{ maxWidth: 220 }} value={filterVehicle}
                  onChange={(e) => { setFilterVehicle(e.target.value); setPage(1) }}>
                  <option value="">All Vehicles</option>
                  {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.vehicle_code} — {v.plate_number}</option>)}
                </Form.Select>
                <Button variant="success" size="sm" onClick={() => {
                  setForm({
                    vehicle_id: '', driver_id: '', inspection_date: new Date().toISOString().split('T')[0],
                    inspection_type: 'Daily', odometer: '', general_notes: '',
                    items: DEFAULT_CHECKLIST_ITEMS.map((i) => ({ ...i })),
                  })
                  setFormError(null)
                  setShowModal(true)
                }}>
                  <i className="ri-add-line me-1" /> New Inspection
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success" /></div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold fs-12">Checklist #</th>
                        <th className="fw-semibold fs-12">Vehicle</th>
                        <th className="fw-semibold fs-12">Date</th>
                        <th className="fw-semibold fs-12">Type</th>
                        <th className="fw-semibold fs-12">Driver</th>
                        <th className="fw-semibold fs-12 text-end">Odometer</th>
                        <th className="fw-semibold fs-12">Health Score</th>
                        <th className="fw-semibold fs-12">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center text-muted py-5">
                            <i className="ri-clipboard-line d-block fs-30 mb-2" />
                            No inspections found
                          </td>
                        </tr>
                      ) : items.map((ins: any) => (
                        <tr key={ins.id}>
                          <td className="fw-semibold fs-12 text-primary">{ins.checklist_number}</td>
                          <td>
                            <div className="fw-semibold fs-12">{ins.vehicle?.vehicle_code}</div>
                            <div className="text-muted fs-11">{ins.vehicle?.plate_number}</div>
                          </td>
                          <td className="fs-12 text-nowrap">
                            {new Date(ins.inspection_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td><span className="badge bg-light text-dark fs-11">{ins.inspection_type}</span></td>
                          <td className="fs-12">{ins.driver?.name || '—'}</td>
                          <td className="text-end fs-12">
                            {ins.odometer ? `${Number(ins.odometer).toLocaleString('id-ID')} km` : '—'}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: 6 }}>
                                <div className={`progress-bar bg-${healthColor(ins.health_score)}`}
                                  style={{ width: `${ins.health_score}%` }} />
                              </div>
                              <span className={`fs-12 fw-bold text-${healthColor(ins.health_score)}`}>
                                {ins.health_score}%
                              </span>
                            </div>
                          </td>
                          <td><Badge bg={statusColors[ins.overall_status] ?? 'secondary'}>{ins.overall_status}</Badge></td>
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

      {/* New Inspection Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-16"><i className="ri-clipboard-line me-2" />New Inspection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <div className="alert alert-danger fs-13 py-2">{formError}</div>}
          <Row className="g-3 mb-3">
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Vehicle *</Form.Label>
              <Form.Select value={form.vehicle_id} onChange={(e) => setForm((f: any) => ({ ...f, vehicle_id: e.target.value }))}>
                <option value="">Select vehicle...</option>
                {vehicles.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.vehicle_code} — {v.plate_number} ({v.brand} {v.model})</option>
                ))}
              </Form.Select>
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Driver</Form.Label>
              <Form.Select value={form.driver_id} onChange={(e) => setForm((f: any) => ({ ...f, driver_id: e.target.value }))}>
                <option value="">Select driver...</option>
                {drivers.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Form.Select>
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Date *</Form.Label>
              <Form.Control type="date" value={form.inspection_date}
                onChange={(e) => setForm((f: any) => ({ ...f, inspection_date: e.target.value }))} />
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Type</Form.Label>
              <Form.Select value={form.inspection_type}
                onChange={(e) => setForm((f: any) => ({ ...f, inspection_type: e.target.value }))}>
                {INSPECTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Odometer (km)</Form.Label>
              <Form.Control type="number" value={form.odometer} min={0}
                onChange={(e) => setForm((f: any) => ({ ...f, odometer: e.target.value }))} />
            </Form.Group></Col>
          </Row>

          {/* Checklist Items */}
          <div className="fw-semibold fs-13 mb-2">Checklist Items</div>
          <div className="table-responsive">
            <Table size="sm" className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold fs-12" style={{ minWidth: 180 }}>Check Item</th>
                  <th className="fw-semibold fs-12" style={{ minWidth: 120 }}>Category</th>
                  <th className="fw-semibold fs-12" style={{ minWidth: 140 }}>Result</th>
                  <th className="fw-semibold fs-12">Notes</th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="fs-12 align-middle">{item.check_item}</td>
                    <td>
                      <span className="badge bg-light text-dark fs-11">{item.category}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {['Good', 'Warning', 'Critical'].map((r) => (
                          <button key={r} type="button"
                            className={`btn btn-xs ${item.result === r
                              ? r === 'Good' ? 'btn-success' : r === 'Warning' ? 'btn-warning' : 'btn-danger'
                              : 'btn-outline-secondary'}`}
                            onClick={() => setItem(idx, 'result', r)}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Form.Control size="sm" type="text" placeholder="Notes..."
                        value={item.technician_notes ?? ''}
                        onChange={(e) => setItem(idx, 'technician_notes', e.target.value)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="mt-3"><Form.Group>
            <Form.Label className="fs-13 fw-semibold">General Notes</Form.Label>
            <Form.Control as="textarea" rows={2} value={form.general_notes}
              onChange={(e) => setForm((f: any) => ({ ...f, general_notes: e.target.value }))} />
          </Form.Group></div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
          <Button variant="success" onClick={handleSave} disabled={saving || !form.vehicle_id}>
            {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : 'Submit Inspection'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}
