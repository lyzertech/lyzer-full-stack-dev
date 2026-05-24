'use client'

import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row, Badge, Modal, Form, Table, Button } from 'react-bootstrap'
import {
  getVehicles, getVehicleTypes, getDrivers,
  createVehicle, updateVehicle, deleteVehicle,
  type Vehicle,
} from '@/app/actions/vehicle/vehicle.actions'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  Active: 'success', Maintenance: 'warning', Breakdown: 'danger', Retired: 'secondary',
}

const STATUSES = ['Active', 'Maintenance', 'Breakdown', 'Retired']
const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'Other']
const TRANSMISSIONS = ['Manual', 'Automatic', 'CVT', 'Semi-Auto']

const emptyForm = (): Partial<Vehicle> => ({
  vehicle_code: '', plate_number: '', brand: '', model: '', year: undefined,
  fuel_type: 'Diesel', transmission: 'Manual', odometer: 0, odometer_unit: 'km',
  status: 'Active', notes: '',
})

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any>(null)
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Vehicle>>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [page, setPage] = useState(1)
  const searchTimer = useRef<NodeJS.Timeout | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const loadVehicles = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, per_page: 15 }
      if (search) params.search = search
      if (filterStatus) params.status = filterStatus
      if (filterType) params.vehicle_type_id = filterType
      const result = await getVehicles(params) as any
      setVehicles(result)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterStatus, filterType])

  useEffect(() => {
    loadVehicles()
    // Load types & drivers for form
    getVehicleTypes({ per_page: 100 }).then((r: any) => setVehicleTypes(r?.data ?? []))
    getDrivers({ per_page: 100, status: 'Active' }).then((r: any) => setDrivers(r?.data ?? []))
  }, [loadVehicles])

  const handleSearchChange = (v: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setSearch(v)
      setPage(1)
    }, 400)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (v: any) => {
    setEditingId(v.id)
    setForm({ ...v })
    setFormError(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setFormError(null)
    try {
      if (editingId) {
        await updateVehicle(editingId, form)
      } else {
        await createVehicle(form)
      }
      setShowModal(false)
      loadVehicles()
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteVehicle(id)
      setDeleteConfirm(null)
      loadVehicles()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const set = (k: keyof Vehicle, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const items = vehicles?.data ?? []
  const paginationMeta = vehicles
    ? { current: vehicles.current_page, last: vehicles.last_page, total: vehicles.total }
    : null

  return (
    <Fragment>
      <Seo title="Vehicles" />
      <Pageheader title="Vehicle" subtitle="Fleet" currentpage="Vehicles" activepage="Fleet Management" />

      <Row className="g-3">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <div className="card-title mb-0">
                <i className="ri-car-fill me-2 text-primary" />
                Vehicle Fleet
                {paginationMeta && (
                  <Badge bg="primary" className="ms-2 fs-11">{paginationMeta.total}</Badge>
                )}
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                {/* Search */}
                <div className="input-group" style={{ maxWidth: 220 }}>
                  <span className="input-group-text bg-transparent border-end-0">
                    <i className="ri-search-line text-muted" />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Search vehicle..."
                    className="border-start-0 ps-0"
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
                {/* Filter Status */}
                <Form.Select style={{ maxWidth: 140 }} value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}>
                  <option value="">All Status</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
                {/* Filter Type */}
                <Form.Select style={{ maxWidth: 160 }} value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setPage(1) }}>
                  <option value="">All Types</option>
                  {vehicleTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Form.Select>
                <Button variant="primary" size="sm" onClick={openCreate}>
                  <i className="ri-add-line me-1" /> Add Vehicle
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : error ? (
                <div className="alert alert-danger m-3">{error}</div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold fs-12">Code</th>
                        <th className="fw-semibold fs-12">Plate</th>
                        <th className="fw-semibold fs-12">Brand / Model</th>
                        <th className="fw-semibold fs-12">Type</th>
                        <th className="fw-semibold fs-12">Year</th>
                        <th className="fw-semibold fs-12">Fuel</th>
                        <th className="fw-semibold fs-12 text-end">Odometer</th>
                        <th className="fw-semibold fs-12">Driver</th>
                        <th className="fw-semibold fs-12">Status</th>
                        <th className="fw-semibold fs-12">Insurance</th>
                        <th className="fw-semibold fs-12 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="text-center text-muted py-5">
                            <i className="ri-car-line d-block fs-30 mb-2" />
                            No vehicles found
                          </td>
                        </tr>
                      ) : items.map((v: any) => (
                        <tr key={v.id}>
                          <td>
                            <Link href={`/vehicle/vehicles/${v.id}`} className="fw-bold text-primary fs-12">
                              {v.vehicle_code}
                            </Link>
                          </td>
                          <td className="fw-semibold fs-12">{v.plate_number || '—'}</td>
                          <td>
                            <div className="fw-semibold fs-13">{v.brand} {v.model}</div>
                          </td>
                          <td className="fs-12 text-muted">{v.vehicle_type?.name || '—'}</td>
                          <td className="fs-12">{v.year || '—'}</td>
                          <td>
                            <span className="badge bg-light text-dark fs-11">{v.fuel_type || '—'}</span>
                          </td>
                          <td className="text-end fs-12 text-nowrap">
                            {Number(v.odometer).toLocaleString('id-ID')} {v.odometer_unit}
                          </td>
                          <td className="fs-12">{v.driver?.name || <span className="text-muted">—</span>}</td>
                          <td>
                            <Badge bg={statusColors[v.status] ?? 'secondary'}>{v.status}</Badge>
                          </td>
                          <td className="fs-11">
                            {v.insurance_expiry
                              ? <span className={new Date(v.insurance_expiry) < new Date() ? 'text-danger fw-bold' : 'text-muted'}>
                                  {new Date(v.insurance_expiry).toLocaleDateString('id-ID')}
                                </span>
                              : <span className="text-muted">—</span>
                            }
                          </td>
                          <td className="text-end">
                            <div className="d-flex gap-1 justify-content-end">
                              <Link href={`/vehicle/vehicles/${v.id}`}
                                className="btn btn-xs btn-light" title="View Profile">
                                <i className="ri-eye-line" />
                              </Link>
                              <Button size="sm" variant="light" className="btn-xs" title="Edit"
                                onClick={() => openEdit(v)}>
                                <i className="ri-edit-line" />
                              </Button>
                              <Button size="sm" variant="light" className="btn-xs text-danger" title="Delete"
                                onClick={() => setDeleteConfirm(v.id)}>
                                <i className="ri-delete-bin-line" />
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
            {/* Pagination */}
            {paginationMeta && paginationMeta.last > 1 && (
              <Card.Footer className="d-flex justify-content-between align-items-center">
                <span className="text-muted fs-12">
                  Page {paginationMeta.current} of {paginationMeta.last}
                </span>
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

      {/* ── Create/Edit Modal ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-16">
            {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <div className="alert alert-danger fs-13 py-2">{formError}</div>}
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Vehicle Code *</Form.Label>
                <Form.Control value={form.vehicle_code ?? ''} onChange={(e) => set('vehicle_code', e.target.value)}
                  placeholder="e.g. VH-001" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Plate Number</Form.Label>
                <Form.Control value={form.plate_number ?? ''} onChange={(e) => set('plate_number', e.target.value)}
                  placeholder="e.g. B 1234 XYZ" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Brand</Form.Label>
                <Form.Control value={form.brand ?? ''} onChange={(e) => set('brand', e.target.value)}
                  placeholder="Toyota" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Model</Form.Label>
                <Form.Control value={form.model ?? ''} onChange={(e) => set('model', e.target.value)}
                  placeholder="Avanza" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Year</Form.Label>
                <Form.Control type="number" value={form.year ?? ''} onChange={(e) => set('year', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="2022" min={1900} max={2100} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Vehicle Type</Form.Label>
                <Form.Select value={form.vehicle_type_id ?? ''} onChange={(e) => set('vehicle_type_id', e.target.value ? parseInt(e.target.value) : undefined)}>
                  <option value="">Select type...</option>
                  {vehicleTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Assigned Driver</Form.Label>
                <Form.Select value={form.assigned_driver_id ?? ''} onChange={(e) => set('assigned_driver_id', e.target.value ? parseInt(e.target.value) : undefined)}>
                  <option value="">None</option>
                  {drivers.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Fuel Type</Form.Label>
                <Form.Select value={form.fuel_type ?? 'Diesel'} onChange={(e) => set('fuel_type', e.target.value)}>
                  {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Transmission</Form.Label>
                <Form.Select value={form.transmission ?? 'Manual'} onChange={(e) => set('transmission', e.target.value)}>
                  {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Status</Form.Label>
                <Form.Select value={form.status ?? 'Active'} onChange={(e) => set('status', e.target.value as any)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Odometer</Form.Label>
                <Form.Control type="number" value={form.odometer ?? 0} min={0}
                  onChange={(e) => set('odometer', parseFloat(e.target.value) || 0)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Odometer Unit</Form.Label>
                <Form.Select value={form.odometer_unit ?? 'km'} onChange={(e) => set('odometer_unit', e.target.value)}>
                  <option value="km">KM</option>
                  <option value="hours">Hours</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Purchase Date</Form.Label>
                <Form.Control type="date" value={form.purchase_date ?? ''} onChange={(e) => set('purchase_date', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Insurance Expiry</Form.Label>
                <Form.Control type="date" value={form.insurance_expiry ?? ''} onChange={(e) => set('insurance_expiry', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Registration Expiry</Form.Label>
                <Form.Control type="date" value={form.registration_expiry ?? ''} onChange={(e) => set('registration_expiry', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">VIN Number</Form.Label>
                <Form.Control value={form.vin_number ?? ''} onChange={(e) => set('vin_number', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Engine Number</Form.Label>
                <Form.Control value={form.engine_number ?? ''} onChange={(e) => set('engine_number', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Location</Form.Label>
                <Form.Control value={form.location ?? ''} onChange={(e) => set('location', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Department</Form.Label>
                <Form.Control value={form.department ?? ''} onChange={(e) => set('department', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fs-13 fw-semibold">Notes</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.notes ?? ''}
                  onChange={(e) => set('notes', e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : 'Save Vehicle'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal show={deleteConfirm !== null} onHide={() => setDeleteConfirm(null)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title className="fs-15 text-danger">
            <i className="ri-delete-bin-line me-2" />Delete Vehicle
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-3">
          <p className="mb-0 fs-14">Are you sure you want to delete this vehicle?</p>
          <p className="text-muted fs-12">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}
