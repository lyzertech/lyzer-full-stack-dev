'use client'

import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row, Badge, Modal, Form, Table, Button } from 'react-bootstrap'
import { getVendors, createVendor, updateVendor, deleteVendor, type Vendor } from '@/app/actions/vehicle/vehicle.actions'

const VENDOR_TYPES = ['Internal Workshop', 'External Workshop', 'Dealer', 'Specialist']

const emptyForm = (): Partial<Vendor> => ({
  workshop_name: '', contact_person: '', phone: '', email: '',
  address: '', city: '', vendor_type: 'External Workshop', rating: undefined, is_active: true,
})

const StarRating = ({ rating }: { rating: number }) => (
  <div className="d-flex gap-0">
    {[1, 2, 3, 4, 5].map((s) => (
      <i key={s} className={`ri-star-${s <= rating ? 'fill text-warning' : 'line text-muted'} fs-13`} />
    ))}
  </div>
)

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Vendor>>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const searchTimer = useRef<NodeJS.Timeout | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, per_page: 15 }
      if (search) params.search = search
      const result = await getVendors(params) as any
      setVendors(result)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    setFormError(null)
    try {
      if (editingId) await updateVendor(editingId, form)
      else await createVendor(form)
      setShowModal(false)
      load()
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const set = (k: keyof Vendor, v: any) => setForm((f) => ({ ...f, [k]: v }))
  const items = vendors?.data ?? []
  const paginationMeta = vendors ? { current: vendors.current_page, last: vendors.last_page, total: vendors.total } : null

  return (
    <Fragment>
      <Seo title="Workshops & Vendors" />
      <Pageheader title="Vehicle" subtitle="Fleet" currentpage="Workshops" activepage="Fleet Management" />

      <Row className="g-3">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <div className="card-title mb-0">
                <i className="ri-store-3-fill me-2 text-primary" /> Workshops & Vendors
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
                <Button variant="primary" size="sm" onClick={() => {
                  setEditingId(null); setForm(emptyForm()); setFormError(null); setShowModal(true)
                }}>
                  <i className="ri-add-line me-1" /> Add Workshop
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
                        <th className="fw-semibold fs-12">Code</th>
                        <th className="fw-semibold fs-12">Name</th>
                        <th className="fw-semibold fs-12">Type</th>
                        <th className="fw-semibold fs-12">Contact</th>
                        <th className="fw-semibold fs-12">Phone</th>
                        <th className="fw-semibold fs-12">City</th>
                        <th className="fw-semibold fs-12">Rating</th>
                        <th className="fw-semibold fs-12">WO Count</th>
                        <th className="fw-semibold fs-12">Status</th>
                        <th className="fw-semibold fs-12 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="text-center text-muted py-5">
                            <i className="ri-store-line d-block fs-30 mb-2" />
                            No vendors found
                          </td>
                        </tr>
                      ) : items.map((v: any) => (
                        <tr key={v.id}>
                          <td className="fw-semibold fs-12">{v.vendor_code || '—'}</td>
                          <td className="fw-semibold fs-13">{v.workshop_name}</td>
                          <td>
                            <span className="badge bg-light text-dark fs-11">{v.vendor_type}</span>
                          </td>
                          <td className="fs-12">{v.contact_person || '—'}</td>
                          <td className="fs-12">{v.phone || '—'}</td>
                          <td className="fs-12">{v.city || '—'}</td>
                          <td>{v.rating ? <StarRating rating={v.rating} /> : <span className="text-muted fs-12">—</span>}</td>
                          <td className="text-center fs-12">{v.work_orders_count ?? 0}</td>
                          <td><Badge bg={v.is_active ? 'success' : 'secondary'}>{v.is_active ? 'Active' : 'Inactive'}</Badge></td>
                          <td className="text-end">
                            <Button size="sm" variant="light" className="btn-xs" title="Edit"
                              onClick={() => { setEditingId(v.id); setForm({ ...v }); setFormError(null); setShowModal(true) }}>
                              <i className="ri-edit-line" />
                            </Button>
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

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-16">{editingId ? 'Edit Workshop' : 'Add Workshop'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <div className="alert alert-danger fs-13 py-2">{formError}</div>}
          <Row className="g-3">
            <Col md={8}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Workshop Name *</Form.Label>
              <Form.Control value={form.workshop_name ?? ''} onChange={(e) => set('workshop_name', e.target.value)} />
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Type</Form.Label>
              <Form.Select value={form.vendor_type ?? 'External Workshop'} onChange={(e) => set('vendor_type', e.target.value)}>
                {VENDOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Contact Person</Form.Label>
              <Form.Control value={form.contact_person ?? ''} onChange={(e) => set('contact_person', e.target.value)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Phone</Form.Label>
              <Form.Control value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Email</Form.Label>
              <Form.Control type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">City</Form.Label>
              <Form.Control value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} />
            </Form.Group></Col>
            <Col md={12}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Address</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Rating (1-5)</Form.Label>
              <Form.Select value={form.rating ?? ''} onChange={(e) => set('rating', e.target.value ? parseInt(e.target.value) : undefined)}>
                <option value="">No Rating</option>
                {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{'★'.repeat(r)} ({r}/5)</option>)}
              </Form.Select>
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Active</Form.Label>
              <Form.Select value={form.is_active ? '1' : '0'} onChange={(e) => set('is_active', e.target.value === '1')}>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </Form.Select>
            </Form.Group></Col>
            <Col md={12}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Service Notes</Form.Label>
              <Form.Control as="textarea" rows={2} value={(form as any).service_notes ?? ''} onChange={(e) => set('service_notes' as any, e.target.value)} />
            </Form.Group></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : 'Save Workshop'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}
