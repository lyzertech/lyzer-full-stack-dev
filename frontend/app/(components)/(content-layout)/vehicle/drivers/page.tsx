'use client'

import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row, Badge, Modal, Form, Table, Button } from 'react-bootstrap'
import { getDrivers, createDriver, updateDriver, deleteDriver, type Driver } from '@/app/actions/vehicle/vehicle.actions'

const statusColors: Record<string, string> = { Active: 'success', Inactive: 'secondary', 'On Leave': 'warning' }

const emptyForm = (): Partial<Driver> => ({
  name: '', phone: '', email: '', license_number: '', license_type: 'SIM B2',
  license_expiry: '', status: 'Active', notes: '',
})

const LICENSE_TYPES = ['SIM A', 'SIM B1', 'SIM B2', 'SIM C', 'SIM D']

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Driver>>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const searchTimer = useRef<NodeJS.Timeout | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, per_page: 15 }
      if (search) params.search = search
      if (filterStatus) params.status = filterStatus
      const result = await getDrivers(params) as any
      setDrivers(result)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterStatus])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    setFormError(null)
    try {
      if (editingId) await updateDriver(editingId, form)
      else await createDriver(form)
      setShowModal(false)
      load()
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteDriver(id)
      setDeleteConfirm(null)
      load()
    } catch (e: any) { alert(e.message) }
  }

  const set = (k: keyof Driver, v: any) => setForm((f) => ({ ...f, [k]: v }))
  const items = drivers?.data ?? []
  const paginationMeta = drivers ? { current: drivers.current_page, last: drivers.last_page, total: drivers.total } : null

  return (
    <Fragment>
      <Seo title="Drivers" />
      <Pageheader title="Vehicle" subtitle="Fleet" currentpage="Drivers" activepage="Fleet Management" />

      <Row className="g-3">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <div className="card-title mb-0">
                <i className="ri-user-star-fill me-2 text-info" /> Drivers
                {paginationMeta && <Badge bg="primary" className="ms-2 fs-11">{paginationMeta.total}</Badge>}
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <div className="input-group" style={{ maxWidth: 200 }}>
                  <span className="input-group-text bg-transparent border-end-0">
                    <i className="ri-search-line text-muted" />
                  </span>
                  <Form.Control type="text" placeholder="Search..." className="border-start-0 ps-0"
                    onChange={(e) => {
                      if (searchTimer.current) clearTimeout(searchTimer.current)
                      searchTimer.current = setTimeout(() => { setSearch(e.target.value); setPage(1) }, 400)
                    }}
                  />
                </div>
                <Form.Select style={{ maxWidth: 140 }} value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}>
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </Form.Select>
                <Button variant="primary" size="sm" onClick={() => {
                  setEditingId(null); setForm(emptyForm()); setFormError(null); setShowModal(true)
                }}>
                  <i className="ri-user-add-line me-1" /> Add Driver
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
                        <th className="fw-semibold fs-12">Name</th>
                        <th className="fw-semibold fs-12">Employee Code</th>
                        <th className="fw-semibold fs-12">Phone</th>
                        <th className="fw-semibold fs-12">License</th>
                        <th className="fw-semibold fs-12">License Type</th>
                        <th className="fw-semibold fs-12">License Expiry</th>
                        <th className="fw-semibold fs-12">Assigned Vehicles</th>
                        <th className="fw-semibold fs-12">Status</th>
                        <th className="fw-semibold fs-12 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center text-muted py-5">
                            <i className="ri-user-line d-block fs-30 mb-2" />
                            No drivers found
                          </td>
                        </tr>
                      ) : items.map((d: any) => {
                        const licenseExpired = d.license_expiry && new Date(d.license_expiry) < new Date()
                        return (
                          <tr key={d.id}>
                            <td className="fw-semibold fs-13">{d.name}</td>
                            <td className="fs-12 text-muted">{d.employee_code || '—'}</td>
                            <td className="fs-12">{d.phone || '—'}</td>
                            <td className="fs-12">{d.license_number || '—'}</td>
                            <td>
                              <span className="badge bg-light text-dark fs-11">{d.license_type || '—'}</span>
                            </td>
                            <td className={`fs-12 ${licenseExpired ? 'text-danger fw-bold' : 'text-muted'}`}>
                              {d.license_expiry
                                ? new Date(d.license_expiry).toLocaleDateString('id-ID')
                                : '—'
                              }
                              {licenseExpired && <span className="ms-1"><i className="ri-error-warning-line" /></span>}
                            </td>
                            <td className="fs-12 text-center">{d.vehicles_count ?? 0}</td>
                            <td><Badge bg={statusColors[d.status] ?? 'secondary'}>{d.status}</Badge></td>
                            <td className="text-end">
                              <div className="d-flex gap-1 justify-content-end">
                                <Button size="sm" variant="light" className="btn-xs" title="Edit"
                                  onClick={() => { setEditingId(d.id); setForm({ ...d }); setFormError(null); setShowModal(true) }}>
                                  <i className="ri-edit-line" />
                                </Button>
                                <Button size="sm" variant="light" className="btn-xs text-danger" title="Delete"
                                  onClick={() => setDeleteConfirm(d.id)}>
                                  <i className="ri-delete-bin-line" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
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

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-16">{editingId ? 'Edit Driver' : 'Add Driver'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <div className="alert alert-danger fs-13 py-2">{formError}</div>}
          <Row className="g-3">
            <Col md={8}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Full Name *</Form.Label>
              <Form.Control value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} />
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Employee Code</Form.Label>
              <Form.Control value={form.employee_code ?? ''} onChange={(e) => set('employee_code', e.target.value)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Phone</Form.Label>
              <Form.Control value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Email</Form.Label>
              <Form.Control type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">License Type</Form.Label>
              <Form.Select value={form.license_type ?? ''} onChange={(e) => set('license_type', e.target.value)}>
                <option value="">Select...</option>
                {LICENSE_TYPES.map((l) => <option key={l} value={l}>{l}</option>)}
              </Form.Select>
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">License Number</Form.Label>
              <Form.Control value={form.license_number ?? ''} onChange={(e) => set('license_number', e.target.value)} />
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">License Expiry</Form.Label>
              <Form.Control type="date" value={form.license_expiry ?? ''} onChange={(e) => set('license_expiry', e.target.value)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Status</Form.Label>
              <Form.Select value={form.status ?? 'Active'} onChange={(e) => set('status', e.target.value as any)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </Form.Select>
            </Form.Group></Col>
            <Col md={12}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Notes</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
            </Form.Group></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : 'Save Driver'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={deleteConfirm !== null} onHide={() => setDeleteConfirm(null)} centered size="sm">
        <Modal.Header closeButton><Modal.Title className="fs-15 text-danger">Delete Driver</Modal.Title></Modal.Header>
        <Modal.Body className="text-center py-3">
          <p className="mb-0 fs-14">Are you sure you want to delete this driver?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}
