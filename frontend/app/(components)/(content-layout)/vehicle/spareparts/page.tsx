'use client'

import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row, Badge, Modal, Form, Table, Button } from 'react-bootstrap'
import {
  getSpareparts, createSparepart, updateSparepart, deleteSparepart, addSparepartStock,
  type Sparepart,
} from '@/app/actions/vehicle/vehicle.actions'

const CATEGORIES = ['Engine Oil', 'Oil Filter', 'Air Filter', 'Brake Pad', 'Tire', 'Battery', 'Belt', 'Coolant', 'Fuel Filter', 'Spark Plug', 'Other']
const UNITS = ['pcs', 'liter', 'set', 'meter', 'kg', 'roll', 'pair']

const fmtCurrency = (n: any) =>
  'Rp ' + Number(n ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })

const emptyForm = (): Partial<Sparepart> => ({
  sparepart_code: '', name: '', category: '', brand: '', unit: 'pcs',
  stock_quantity: 0, minimum_stock: 1, unit_price: 0, supplier: '',
})

export default function SparepartsPage() {
  const [spareparts, setSpareparts] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Sparepart>>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [showStockModal, setShowStockModal] = useState(false)
  const [stockTarget, setStockTarget] = useState<any>(null)
  const [stockForm, setStockForm] = useState({ quantity: '', unit_price: '', supplier: '', reference: '', notes: '' })
  const searchTimer = useRef<NodeJS.Timeout | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, per_page: 20 }
      if (search) params.search = search
      if (filterCategory) params.category = filterCategory
      if (lowStockOnly) params.low_stock = '1'
      const result = await getSpareparts(params) as any
      setSpareparts(result)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterCategory, lowStockOnly])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (sp: any) => {
    setEditingId(sp.id)
    setForm({ ...sp })
    setFormError(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setFormError(null)
    try {
      if (editingId) await updateSparepart(editingId, form)
      else await createSparepart(form)
      setShowModal(false)
      load()
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddStock = async () => {
    setSaving(true)
    try {
      await addSparepartStock(stockTarget.id, {
        quantity: parseFloat(stockForm.quantity),
        unit_price: parseFloat(stockForm.unit_price) || 0,
        supplier: stockForm.supplier,
        reference: stockForm.reference,
        notes: stockForm.notes,
      })
      setShowStockModal(false)
      setStockForm({ quantity: '', unit_price: '', supplier: '', reference: '', notes: '' })
      load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const set = (k: keyof Sparepart, v: any) => setForm((f) => ({ ...f, [k]: v }))
  const items = spareparts?.data ?? []
  const paginationMeta = spareparts ? { current: spareparts.current_page, last: spareparts.last_page, total: spareparts.total } : null

  return (
    <Fragment>
      <Seo title="Spareparts" />
      <Pageheader title="Vehicle" subtitle="Inventory" currentpage="Spareparts" activepage="Fleet Management" />

      <Row className="g-3">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <div className="card-title mb-0">
                <i className="ri-tools-fill me-2 text-warning" /> Sparepart Inventory
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
                <Form.Select style={{ maxWidth: 150 }} value={filterCategory}
                  onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Form.Select>
                <Form.Check
                  type="switch" id="low-stock-switch" label="Low Stock Only"
                  checked={lowStockOnly} onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1) }}
                  className="fs-13"
                />
                <Button variant="primary" size="sm" onClick={openCreate}>
                  <i className="ri-add-line me-1" /> Add Sparepart
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
                        <th className="fw-semibold fs-12">Category</th>
                        <th className="fw-semibold fs-12">Brand</th>
                        <th className="fw-semibold fs-12 text-end">Stock</th>
                        <th className="fw-semibold fs-12 text-end">Min</th>
                        <th className="fw-semibold fs-12">Unit</th>
                        <th className="fw-semibold fs-12 text-end">Unit Price</th>
                        <th className="fw-semibold fs-12">Supplier</th>
                        <th className="fw-semibold fs-12">Stock Status</th>
                        <th className="fw-semibold fs-12 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="text-center text-muted py-5">
                            <i className="ri-tools-line d-block fs-30 mb-2" />
                            No spareparts found
                          </td>
                        </tr>
                      ) : items.map((sp: any) => {
                        const isLow = sp.stock_quantity <= sp.minimum_stock
                        const isOut = sp.stock_quantity === 0
                        return (
                          <tr key={sp.id} className={isOut ? 'table-danger' : isLow ? 'table-warning' : ''}>
                            <td className="fw-semibold fs-12">{sp.sparepart_code}</td>
                            <td className="fs-13 fw-semibold">{sp.name}</td>
                            <td>
                              <span className="badge bg-light text-dark fs-11">{sp.category || '—'}</span>
                            </td>
                            <td className="fs-12">{sp.brand || '—'}</td>
                            <td className={`text-end fw-bold fs-12 ${isOut ? 'text-danger' : isLow ? 'text-warning' : ''}`}>
                              {sp.stock_quantity}
                            </td>
                            <td className="text-end fs-12 text-muted">{sp.minimum_stock}</td>
                            <td className="fs-12 text-muted">{sp.unit}</td>
                            <td className="text-end fs-12 text-nowrap">{fmtCurrency(sp.unit_price)}</td>
                            <td className="fs-12">{sp.supplier || '—'}</td>
                            <td>
                              {isOut
                                ? <Badge bg="danger">Out of Stock</Badge>
                                : isLow
                                ? <Badge bg="warning">Low Stock</Badge>
                                : <Badge bg="success">In Stock</Badge>
                              }
                            </td>
                            <td className="text-end">
                              <div className="d-flex gap-1 justify-content-end">
                                <Button size="sm" variant="success" className="btn-xs" title="Add Stock"
                                  onClick={() => { setStockTarget(sp); setShowStockModal(true) }}>
                                  <i className="ri-add-box-line" />
                                </Button>
                                <Button size="sm" variant="light" className="btn-xs" title="Edit"
                                  onClick={() => openEdit(sp)}>
                                  <i className="ri-edit-line" />
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

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-16">{editingId ? 'Edit Sparepart' : 'Add New Sparepart'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <div className="alert alert-danger fs-13 py-2">{formError}</div>}
          <Row className="g-3">
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Code *</Form.Label>
              <Form.Control value={form.sparepart_code ?? ''} onChange={(e) => set('sparepart_code', e.target.value)} placeholder="SP-001" />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Name *</Form.Label>
              <Form.Control value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Category</Form.Label>
              <Form.Select value={form.category ?? ''} onChange={(e) => set('category', e.target.value)}>
                <option value="">Select...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Brand</Form.Label>
              <Form.Control value={form.brand ?? ''} onChange={(e) => set('brand', e.target.value)} />
            </Form.Group></Col>
            <Col md={3}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Unit</Form.Label>
              <Form.Select value={form.unit ?? 'pcs'} onChange={(e) => set('unit', e.target.value)}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </Form.Select>
            </Form.Group></Col>
            <Col md={3}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Initial Stock</Form.Label>
              <Form.Control type="number" value={form.stock_quantity ?? 0} min={0} onChange={(e) => set('stock_quantity', parseFloat(e.target.value) || 0)} />
            </Form.Group></Col>
            <Col md={3}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Min Stock</Form.Label>
              <Form.Control type="number" value={form.minimum_stock ?? 1} min={0} onChange={(e) => set('minimum_stock', parseFloat(e.target.value) || 0)} />
            </Form.Group></Col>
            <Col md={3}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Unit Price (Rp)</Form.Label>
              <Form.Control type="number" value={form.unit_price ?? 0} min={0} onChange={(e) => set('unit_price', parseFloat(e.target.value) || 0)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Supplier</Form.Label>
              <Form.Control value={form.supplier ?? ''} onChange={(e) => set('supplier', e.target.value)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Supplier Phone</Form.Label>
              <Form.Control value={(form as any).supplier_phone ?? ''} onChange={(e) => set('supplier_phone' as any, e.target.value)} />
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Replace Every (km)</Form.Label>
              <Form.Control type="number" value={form.replacement_interval_km ?? ''} min={0} onChange={(e) => set('replacement_interval_km', e.target.value ? parseInt(e.target.value) : undefined)} />
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Replace Every (days)</Form.Label>
              <Form.Control type="number" value={form.replacement_interval_days ?? ''} min={0} onChange={(e) => set('replacement_interval_days', e.target.value ? parseInt(e.target.value) : undefined)} />
            </Form.Group></Col>
            <Col md={4}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Replace Every (hours)</Form.Label>
              <Form.Control type="number" value={(form as any).replacement_interval_hours ?? ''} min={0} onChange={(e) => set('replacement_interval_hours' as any, e.target.value ? parseInt(e.target.value) : undefined)} />
            </Form.Group></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : 'Save Sparepart'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Stock Modal */}
      <Modal show={showStockModal} onHide={() => setShowStockModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-15">
            <i className="ri-add-box-line me-1 text-success" />
            Add Stock — {stockTarget?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Quantity *</Form.Label>
              <Form.Control type="number" value={stockForm.quantity} min={0.01} step={0.01}
                onChange={(e) => setStockForm((f) => ({ ...f, quantity: e.target.value }))}
                placeholder="0" />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Unit Price (Rp)</Form.Label>
              <Form.Control type="number" value={stockForm.unit_price} min={0}
                onChange={(e) => setStockForm((f) => ({ ...f, unit_price: e.target.value }))} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Supplier</Form.Label>
              <Form.Control value={stockForm.supplier}
                onChange={(e) => setStockForm((f) => ({ ...f, supplier: e.target.value }))} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Reference / PO#</Form.Label>
              <Form.Control value={stockForm.reference}
                onChange={(e) => setStockForm((f) => ({ ...f, reference: e.target.value }))} />
            </Form.Group></Col>
            <Col md={12}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Notes</Form.Label>
              <Form.Control as="textarea" rows={2} value={stockForm.notes}
                onChange={(e) => setStockForm((f) => ({ ...f, notes: e.target.value }))} />
            </Form.Group></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowStockModal(false)} disabled={saving}>Cancel</Button>
          <Button variant="success" onClick={handleAddStock} disabled={saving || !stockForm.quantity}>
            {saving ? <><span className="spinner-border spinner-border-sm me-1" />Adding...</> : 'Add Stock'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}
