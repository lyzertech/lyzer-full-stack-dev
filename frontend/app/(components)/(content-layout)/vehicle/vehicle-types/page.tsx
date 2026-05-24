'use client'

import React, { Fragment, useEffect, useState, useCallback } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row, Badge, Modal, Form, Table, Button } from 'react-bootstrap'
import { getVehicleTypes, createVehicleType, updateVehicleType, deleteVehicleType } from '@/app/actions/vehicle/vehicle.actions'

const CATEGORIES = ['Car', 'Truck', 'Bus', 'Motorcycle', 'Van', 'Generator', 'Excavator', 'Forklift', 'Heavy Equipment', 'Other']

const emptyForm = () => ({
  name: '', category: '', brand: '', model: '',
  default_oil_interval_km: '', default_oil_interval_days: '',
  default_service_interval_km: '', default_service_interval_days: '', default_service_interval_hours: '', notes: '',
})

// Prevents null values from being passed to controlled inputs (React warns on null)
const sanitizeForm = (data: any) => {
  const base = emptyForm() as Record<string, any>
  Object.keys(base).forEach((key) => {
    base[key] = data[key] == null ? '' : data[key]
  })
  return base
}

export default function VehicleTypesPage() {
  const [types, setTypes] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<any>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getVehicleTypes({ page, per_page: 20 }) as any
      setTypes(result)
    } catch (e: any) { console.error(e) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    setFormError(null)
    try {
      if (editingId) await updateVehicleType(editingId, form)
      else await createVehicleType(form)
      setShowModal(false)
      load()
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))
  const items = types?.data ?? []
  const paginationMeta = types ? { current: types.current_page, last: types.last_page, total: types.total } : null

  return (
    <Fragment>
      <Seo title="Vehicle Types" />
      <Pageheader title="Vehicle" subtitle="Fleet" currentpage="Vehicle Types" activepage="Fleet Management" />

      <Row className="g-3">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="card-title mb-0">
                <i className="ri-folders-fill me-2 text-primary" /> Vehicle Types
                {paginationMeta && <Badge bg="primary" className="ms-2 fs-11">{paginationMeta.total}</Badge>}
              </div>
              <Button variant="primary" size="sm" onClick={() => {
                setEditingId(null); setForm(emptyForm()); setFormError(null); setShowModal(true)
              }}>
                <i className="ri-add-line me-1" /> Add Type
              </Button>
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
                        <th className="fw-semibold fs-12">Category</th>
                        <th className="fw-semibold fs-12">Brand</th>
                        <th className="fw-semibold fs-12">Oil Interval</th>
                        <th className="fw-semibold fs-12">Service Interval</th>
                        <th className="fw-semibold fs-12">Vehicles</th>
                        <th className="fw-semibold fs-12 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-5">
                            <i className="ri-folders-line d-block fs-30 mb-2" />
                            No vehicle types found
                          </td>
                        </tr>
                      ) : items.map((t: any) => (
                        <tr key={t.id}>
                          <td className="fw-semibold fs-13">{t.name}</td>
                          <td><span className="badge bg-light text-dark fs-11">{t.category || '—'}</span></td>
                          <td className="fs-12">{t.brand || '—'}</td>
                          <td className="fs-12 text-muted">
                            {t.default_oil_interval_km && <div>{t.default_oil_interval_km.toLocaleString()} km</div>}
                            {t.default_oil_interval_days && <div>{t.default_oil_interval_days} days</div>}
                            {!t.default_oil_interval_km && !t.default_oil_interval_days && '—'}
                          </td>
                          <td className="fs-12 text-muted">
                            {t.default_service_interval_km && <div>{t.default_service_interval_km.toLocaleString()} km</div>}
                            {t.default_service_interval_days && <div>{t.default_service_interval_days} days</div>}
                            {t.default_service_interval_hours && <div>{t.default_service_interval_hours} hours</div>}
                            {!t.default_service_interval_km && !t.default_service_interval_days && !t.default_service_interval_hours && '—'}
                          </td>
                          <td className="text-center fs-12">{t.vehicles_count ?? 0}</td>
                          <td className="text-end">
                            <div className="d-flex gap-1 justify-content-end">
                              <Button size="sm" variant="light" className="btn-xs"
                                onClick={() => { setEditingId(t.id); setForm(sanitizeForm(t)); setFormError(null); setShowModal(true) }}>
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
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-16">{editingId ? 'Edit Vehicle Type' : 'Add Vehicle Type'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <div className="alert alert-danger fs-13 py-2">{formError}</div>}
          <Row className="g-3">
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Name *</Form.Label>
              <Form.Control value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Toyota Avanza" />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Category</Form.Label>
              <Form.Select value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">Select...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Brand</Form.Label>
              <Form.Control value={form.brand} onChange={(e) => set('brand', e.target.value)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Model</Form.Label>
              <Form.Control value={form.model} onChange={(e) => set('model', e.target.value)} />
            </Form.Group></Col>
            <Col md={12}><hr className="my-1" /><p className="fs-12 text-muted mb-2">Default Maintenance Intervals</p></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Oil Change (km)</Form.Label>
              <Form.Control type="number" value={form.default_oil_interval_km} min={0}
                onChange={(e) => set('default_oil_interval_km', e.target.value)} placeholder="e.g. 5000" />
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Oil Change (days)</Form.Label>
              <Form.Control type="number" value={form.default_oil_interval_days} min={0}
                onChange={(e) => set('default_oil_interval_days', e.target.value)} placeholder="e.g. 90" />
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Service (km)</Form.Label>
              <Form.Control type="number" value={form.default_service_interval_km} min={0}
                onChange={(e) => set('default_service_interval_km', e.target.value)} placeholder="e.g. 10000" />
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Service (days)</Form.Label>
              <Form.Control type="number" value={form.default_service_interval_days} min={0}
                onChange={(e) => set('default_service_interval_days', e.target.value)} placeholder="e.g. 180" />
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Service (hours)</Form.Label>
              <Form.Control type="number" value={form.default_service_interval_hours} min={0}
                onChange={(e) => set('default_service_interval_hours', e.target.value)} placeholder="e.g. 250" />
            </Form.Group></Col>
            <Col md={12}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Notes</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.notes}
                onChange={(e) => set('notes', e.target.value)} />
            </Form.Group></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : 'Save Type'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}
