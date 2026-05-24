'use client'

import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row, Badge, Modal, Form, Table, Button } from 'react-bootstrap'
import {
  getWorkOrders, createWorkOrder, updateWorkOrder, deleteWorkOrder, approveWorkOrder,
  getVehicles, getVendors, type WorkOrder,
} from '@/app/actions/vehicle/vehicle.actions'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  Draft: 'secondary', Pending: 'warning', 'In Progress': 'primary', Completed: 'success', Cancelled: 'danger',
}
const STATUSES = ['Draft', 'Pending', 'In Progress', 'Completed', 'Cancelled']
const SERVICE_TYPES = ['Preventive', 'Corrective', 'Emergency', 'Inspection']

const fmtCurrency = (n: any) =>
  'Rp ' + Number(n ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })

const emptyForm = () => ({
  vehicle_id: '', vendor_id: '', service_date: new Date().toISOString().split('T')[0],
  service_type: 'Preventive', complaint: '', diagnosis: '', action_taken: '',
  labor_cost: 0, other_cost: 0, notes: '', odometer_in: '',
})

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<any>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const searchTimer = useRef<NodeJS.Timeout | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, per_page: 15 }
      if (search) params.search = search
      if (filterStatus) params.status = filterStatus
      const result = await getWorkOrders(params) as any
      setOrders(result)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterStatus])

  useEffect(() => {
    load()
    getVehicles({ per_page: 200, status: 'Active' }).then((r: any) => setVehicles(r?.data ?? []))
    getVendors({ per_page: 100 }).then((r: any) => setVendors(r?.data ?? []))
  }, [load])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (wo: any) => {
    setEditingId(wo.id)
    setForm({
      vehicle_id: wo.vehicle_id, vendor_id: wo.vendor_id ?? '',
      service_date: wo.service_date, service_type: wo.service_type ?? 'Preventive',
      complaint: wo.complaint ?? '', diagnosis: wo.diagnosis ?? '',
      action_taken: wo.action_taken ?? '', labor_cost: wo.labor_cost,
      other_cost: wo.other_cost, notes: wo.notes ?? '',
      odometer_in: wo.odometer_in ?? '', status: wo.status,
    })
    setFormError(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setFormError(null)
    try {
      const payload = { ...form, vehicle_id: parseInt(form.vehicle_id) }
      if (payload.vendor_id) payload.vendor_id = parseInt(payload.vendor_id)
      else delete payload.vendor_id
      if (editingId) {
        await updateWorkOrder(editingId, payload)
      } else {
        await createWorkOrder(payload)
      }
      setShowModal(false)
      load()
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await approveWorkOrder(id)
      load()
    } catch (e: any) { alert(e.message) }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateWorkOrder(id, { status })
      load()
    } catch (e: any) { alert(e.message) }
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))
  const items = orders?.data ?? []
  const paginationMeta = orders ? { current: orders.current_page, last: orders.last_page, total: orders.total } : null

  return (
    <Fragment>
      <Seo title="Work Orders" />
      <Pageheader title="Vehicle" subtitle="Maintenance" currentpage="Work Orders" activepage="Fleet Management" />

      <Row className="g-3">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <div className="card-title mb-0">
                <i className="ri-file-list-3-fill me-2 text-primary" />
                Work Orders
                {paginationMeta && <Badge bg="primary" className="ms-2 fs-11">{paginationMeta.total}</Badge>}
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <div className="input-group" style={{ maxWidth: 220 }}>
                  <span className="input-group-text bg-transparent border-end-0">
                    <i className="ri-search-line text-muted" />
                  </span>
                  <Form.Control type="text" placeholder="Search WO#, plate..."
                    className="border-start-0 ps-0"
                    onChange={(e) => {
                      if (searchTimer.current) clearTimeout(searchTimer.current)
                      searchTimer.current = setTimeout(() => { setSearch(e.target.value); setPage(1) }, 400)
                    }}
                  />
                </div>
                <Form.Select style={{ maxWidth: 160 }} value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}>
                  <option value="">All Status</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
                <Button variant="primary" size="sm" onClick={openCreate}>
                  <i className="ri-add-line me-1" /> New Work Order
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
                        <th className="fw-semibold fs-12">WO Number</th>
                        <th className="fw-semibold fs-12">Vehicle</th>
                        <th className="fw-semibold fs-12">Type</th>
                        <th className="fw-semibold fs-12">Workshop</th>
                        <th className="fw-semibold fs-12">Date</th>
                        <th className="fw-semibold fs-12 text-end">Labor</th>
                        <th className="fw-semibold fs-12 text-end">Sparepart</th>
                        <th className="fw-semibold fs-12 text-end">Total</th>
                        <th className="fw-semibold fs-12">Status</th>
                        <th className="fw-semibold fs-12 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="text-center text-muted py-5">
                            <i className="ri-file-list-3-line d-block fs-30 mb-2" />
                            No work orders found
                          </td>
                        </tr>
                      ) : items.map((wo: any) => (
                        <tr key={wo.id}>
                          <td>
                            <span className="fw-bold text-primary fs-12 cursor-pointer"
                              onClick={() => { setSelectedOrder(wo); setShowDetailModal(true) }}>
                              {wo.work_order_number}
                            </span>
                          </td>
                          <td>
                            <div className="fw-semibold fs-12">{wo.vehicle?.vehicle_code}</div>
                            <div className="text-muted fs-11">{wo.vehicle?.plate_number}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark fs-11">{wo.service_type}</span>
                          </td>
                          <td className="fs-12">{wo.vendor?.workshop_name || <span className="text-muted">Internal</span>}</td>
                          <td className="fs-12 text-muted text-nowrap">
                            {new Date(wo.service_date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="text-end fs-12 text-nowrap">{fmtCurrency(wo.labor_cost)}</td>
                          <td className="text-end fs-12 text-nowrap">{fmtCurrency(wo.sparepart_cost)}</td>
                          <td className="text-end fs-12 fw-bold text-nowrap">{fmtCurrency(wo.total_cost)}</td>
                          <td><Badge bg={statusColors[wo.status] ?? 'secondary'}>{wo.status}</Badge></td>
                          <td className="text-end">
                            <div className="d-flex gap-1 justify-content-end">
                              {wo.status === 'Pending' && (
                                <Button size="sm" variant="success" className="btn-xs" title="Approve"
                                  onClick={() => handleApprove(wo.id)}>
                                  <i className="ri-check-line" />
                                </Button>
                              )}
                              {wo.status === 'In Progress' && (
                                <Button size="sm" variant="primary" className="btn-xs" title="Mark Complete"
                                  onClick={() => handleStatusChange(wo.id, 'Completed')}>
                                  <i className="ri-checkbox-circle-line" />
                                </Button>
                              )}
                              <Button size="sm" variant="light" className="btn-xs" title="Edit"
                                onClick={() => openEdit(wo)}>
                                <i className="ri-edit-line" />
                              </Button>
                            </div>
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
                <span className="text-muted fs-12">Page {paginationMeta.current} of {paginationMeta.last} ({paginationMeta.total} total)</span>
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

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-16">
            {editingId ? 'Edit Work Order' : 'New Work Order'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <div className="alert alert-danger fs-13 py-2">{formError}</div>}
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Vehicle *</Form.Label>
                <Form.Select value={form.vehicle_id} onChange={(e) => set('vehicle_id', e.target.value)}>
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.vehicle_code} — {v.plate_number} ({v.brand} {v.model})</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Workshop / Vendor</Form.Label>
                <Form.Select value={form.vendor_id} onChange={(e) => set('vendor_id', e.target.value)}>
                  <option value="">Internal Workshop</option>
                  {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.workshop_name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Service Date *</Form.Label>
                <Form.Control type="date" value={form.service_date} onChange={(e) => set('service_date', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Service Type</Form.Label>
                <Form.Select value={form.service_type} onChange={(e) => set('service_type', e.target.value)}>
                  {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Odometer In (km)</Form.Label>
                <Form.Control type="number" value={form.odometer_in} min={0}
                  onChange={(e) => set('odometer_in', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Complaint / Problem</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.complaint}
                  onChange={(e) => set('complaint', e.target.value)}
                  placeholder="Describe the vehicle complaint or problem..." />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Diagnosis</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.diagnosis}
                  onChange={(e) => set('diagnosis', e.target.value)}
                  placeholder="Technician diagnosis..." />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Action Taken</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.action_taken}
                  onChange={(e) => set('action_taken', e.target.value)}
                  placeholder="What was done to fix the issue..." />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Labor Cost (Rp)</Form.Label>
                <Form.Control type="number" value={form.labor_cost} min={0}
                  onChange={(e) => set('labor_cost', parseFloat(e.target.value) || 0)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Other Cost (Rp)</Form.Label>
                <Form.Control type="number" value={form.other_cost} min={0}
                  onChange={(e) => set('other_cost', parseFloat(e.target.value) || 0)} />
              </Form.Group>
            </Col>
            {editingId && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fs-13 fw-semibold">Status</Form.Label>
                  <Form.Select value={form.status} onChange={(e) => set('status', e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Notes</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.notes}
                  onChange={(e) => set('notes', e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : 'Save Work Order'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-15">
            Work Order — {selectedOrder?.work_order_number}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <Row className="g-3">
              <Col md={6}>
                <p className="text-muted fs-12 mb-1">Vehicle</p>
                <p className="fw-semibold fs-13 mb-0">
                  {selectedOrder.vehicle?.vehicle_code} — {selectedOrder.vehicle?.plate_number}
                </p>
              </Col>
              <Col md={6}>
                <p className="text-muted fs-12 mb-1">Status</p>
                <Badge bg={statusColors[selectedOrder.status] ?? 'secondary'}>{selectedOrder.status}</Badge>
              </Col>
              <Col md={6}>
                <p className="text-muted fs-12 mb-1">Service Date</p>
                <p className="fw-semibold fs-13 mb-0">
                  {new Date(selectedOrder.service_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </Col>
              <Col md={6}>
                <p className="text-muted fs-12 mb-1">Workshop</p>
                <p className="fw-semibold fs-13 mb-0">{selectedOrder.vendor?.workshop_name || 'Internal'}</p>
              </Col>
              {selectedOrder.complaint && (
                <Col md={12}>
                  <p className="text-muted fs-12 mb-1">Complaint</p>
                  <p className="fs-13 mb-0">{selectedOrder.complaint}</p>
                </Col>
              )}
              {selectedOrder.diagnosis && (
                <Col md={12}>
                  <p className="text-muted fs-12 mb-1">Diagnosis</p>
                  <p className="fs-13 mb-0">{selectedOrder.diagnosis}</p>
                </Col>
              )}
              {selectedOrder.action_taken && (
                <Col md={12}>
                  <p className="text-muted fs-12 mb-1">Action Taken</p>
                  <p className="fs-13 mb-0">{selectedOrder.action_taken}</p>
                </Col>
              )}
              <Col md={12}>
                <div className="d-flex gap-4 border-top pt-3 flex-wrap">
                  <div>
                    <p className="text-muted fs-11 mb-1">Labor Cost</p>
                    <h6 className="mb-0">{fmtCurrency(selectedOrder.labor_cost)}</h6>
                  </div>
                  <div>
                    <p className="text-muted fs-11 mb-1">Sparepart Cost</p>
                    <h6 className="mb-0">{fmtCurrency(selectedOrder.sparepart_cost)}</h6>
                  </div>
                  <div>
                    <p className="text-muted fs-11 mb-1">Other Cost</p>
                    <h6 className="mb-0">{fmtCurrency(selectedOrder.other_cost)}</h6>
                  </div>
                  <div>
                    <p className="text-muted fs-11 mb-1">Total</p>
                    <h5 className="mb-0 fw-bold text-primary">{fmtCurrency(selectedOrder.total_cost)}</h5>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </Fragment>
  )
}
