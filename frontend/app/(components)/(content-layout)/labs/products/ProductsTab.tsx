'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card, Table, Button, Modal, Form, InputGroup,
  Badge, Spinner, Row, Col, Pagination,
} from 'react-bootstrap'
import type { Product, Brand, Category, SpecDefinition, DataType } from './types'
import { DATA_TYPE_LABELS, STATUS_COLORS } from './types'

// ─── Dynamic spec field renderer ─────────────────────────────────────────────
function SpecField({ spec, value, onChange }: {
  spec: SpecDefinition
  value: any
  onChange: (v: any) => void
}) {
  switch (spec.data_type as DataType) {

    case 'boolean':
      return (
        <Form.Check type="switch" id={`spec-${spec.id}`}
          label={value ? 'Yes' : 'No'} checked={!!value}
          onChange={e => onChange(e.target.checked)} />
      )

    case 'number':
    case 'decimal':
      return (
        <InputGroup size="sm">
          <Form.Control type="number" step={spec.data_type === 'decimal' ? 'any' : '1'}
            value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder="0" />
          {spec.unit && <InputGroup.Text className="border-default">{spec.unit}</InputGroup.Text>}
        </InputGroup>
      )

    // ── Single select → Radio button list ──────────────────────────────────
    case 'select': {
      const selected = value ?? ''
      return (
        <div
          className="rounded-3 border border-default overflow-hidden"
          style={{ maxHeight: 160, overflowY: 'auto' }}
        >
          {(spec.options || []).map((opt, idx) => {
            const isChecked = selected === opt
            return (
              <label
                key={opt}
                htmlFor={`spec-${spec.id}-opt-${idx}`}
                className="d-flex align-items-center gap-2 px-3 py-2 cursor-pointer"
                style={{
                  cursor: 'pointer',
                  borderTop: idx > 0 ? '1px solid var(--default-border)' : 'none',
                  background: isChecked ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--custom-white)',
                  transition: 'background 0.15s',
                }}
              >
                <input
                  type="radio"
                  id={`spec-${spec.id}-opt-${idx}`}
                  name={`spec-radio-${spec.id}`}
                  value={opt}
                  checked={isChecked}
                  onChange={() => onChange(opt)}
                  style={{ accentColor: 'var(--primary-color)', width: 15, height: 15, flexShrink: 0 }}
                />
                <span className={`fs-13 ${isChecked ? 'fw-semibold text-primary' : 'text-muted'}`}>
                  {opt}
                </span>
                {isChecked && (
                  <span className="ms-auto">
                    <i className="bi bi-check-circle-fill text-primary fs-13" />
                  </span>
                )}
              </label>
            )
          })}
        </div>
      )
    }

    // ── Multi-select → Checkbox list ───────────────────────────────────────
    case 'multi_select': {
      const selected: string[] = Array.isArray(value) ? value : []
      const toggle = (opt: string) => {
        if (selected.includes(opt)) {
          onChange(selected.filter(v => v !== opt))
        } else {
          onChange([...selected, opt])
        }
      }
      return (
        <div>
          <div
            className="rounded-3 border border-default overflow-hidden"
            style={{ maxHeight: 200, overflowY: 'auto' }}
          >
            {(spec.options || []).map((opt, idx) => {
              const isChecked = selected.includes(opt)
              return (
                <label
                  key={opt}
                  htmlFor={`spec-${spec.id}-chk-${idx}`}
                  className="d-flex align-items-center gap-2 px-3 py-2"
                  style={{
                    cursor: 'pointer',
                    borderTop: idx > 0 ? '1px solid var(--default-border)' : 'none',
                    background: isChecked ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--custom-white)',
                    transition: 'background 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    id={`spec-${spec.id}-chk-${idx}`}
                    checked={isChecked}
                    onChange={() => toggle(opt)}
                    style={{ accentColor: 'var(--primary-color)', width: 15, height: 15, flexShrink: 0 }}
                  />
                  <span className={`fs-13 flex-fill ${isChecked ? 'fw-semibold text-primary' : 'text-muted'}`}>
                    {opt}
                  </span>
                  {isChecked && (
                    <span className="badge bg-primary fs-10 rounded-pill">&nbsp;✓&nbsp;</span>
                  )}
                </label>
              )
            })}
          </div>
          {selected.length > 0 && (
            <div className="d-flex flex-wrap gap-1 mt-2">
              {selected.map(s => (
                <span key={s}
                  className="badge bg-primary-transparent text-primary border border-primary-transparent rounded-pill fs-11 px-2 py-1"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggle(s)}
                  title="Click to remove"
                >
                  {s} <i className="bi bi-x ms-1" />
                </span>
              ))}
            </div>
          )}
        </div>
      )
    }

    // ── Range → Min / Max inputs ───────────────────────────────────────────
    case 'range': {
      const rangeVal = Array.isArray(value) ? value : ['', '']
      return (
        <InputGroup size="sm">
          <Form.Control type="number" placeholder="Min" value={rangeVal[0] ?? ''}
            onChange={e => onChange([e.target.value, rangeVal[1]])} />
          <InputGroup.Text className="border-default">to</InputGroup.Text>
          <Form.Control type="number" placeholder="Max" value={rangeVal[1] ?? ''}
            onChange={e => onChange([rangeVal[0], e.target.value])} />
          {spec.unit && <InputGroup.Text className="border-default">{spec.unit}</InputGroup.Text>}
        </InputGroup>
      )
    }

    default:
      return (
        <Form.Control size="sm" type="text" value={value ?? ''} onChange={e => onChange(e.target.value)}
          placeholder={spec.unit ? `Value in ${spec.unit}` : 'Enter value'} />
      )
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Product | null>(null)
  const [form, setForm] = useState<Record<string, any>>({
    product_name: '', brand_id: '', category_id: '', model: '',
    sku: '', description: '', status: 'Active', image: '', datasheet: '',
  })
  const [catSpecs, setCatSpecs] = useState<SpecDefinition[]>([])
  const [specValues, setSpecValues] = useState<Record<number, any>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), per_page: '10' })
    if (search) params.set('search', search)
    if (filterBrand) params.set('brand_id', filterBrand)
    if (filterCat) params.set('category_id', filterCat)
    if (filterStatus) params.set('status', filterStatus)
    
    // Add sorting parameters for backend
    params.set('sort_by', 'model')
    params.set('sort_dir', 'asc')
    params.set('sort', 'model')

    const res = await fetch(`/api/v1/labs/products?${params}`)
    if (res.ok) {
      const data = await res.json()
      let fetchedProducts = data.data ?? data
      
      // Fallback frontend sort for current page
      fetchedProducts = [...fetchedProducts].sort((a: any, b: any) => {
        const modelA = a.model || ''
        const modelB = b.model || ''
        const cmp = modelA.localeCompare(modelB)
        if (cmp !== 0) return cmp
        const skuA = a.sku || ''
        const skuB = b.sku || ''
        return skuA.localeCompare(skuB)
      })

      setProducts(fetchedProducts)
      if (data.last_page) setTotalPages(data.last_page)
    }
    setLoading(false)
  }, [page, search, filterBrand, filterCat, filterStatus])

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/labs/brands?active_only=true').then(r => r.ok ? r.json() : []),
      fetch('/api/v1/labs/categories?active_only=true').then(r => r.ok ? r.json() : []),
    ]).then(([b, c]) => { setBrands(b); setCategories(c) })
  }, [])

  useEffect(() => { load() }, [load])

  // Load category specs when category changes in form
  useEffect(() => {
    if (!form.category_id) { setCatSpecs([]); return }
    fetch(`/api/v1/labs/categories/${form.category_id}/specs`).then(async r => {
      if (r.ok) setCatSpecs(await r.json())
    })
  }, [form.category_id])

  const openCreate = () => {
    setEditItem(null)
    setForm({ product_name: '', brand_id: '', category_id: '', model: '', sku: '', description: '', status: 'Active', image: '', datasheet: '' })
    setCatSpecs([]); setSpecValues({}); setError(null); setShowModal(true)
  }

  const openEdit = async (p: Product) => {
    setEditItem(p)
    setForm({
      product_name: p.product_name, brand_id: String(p.brand_id || ''),
      category_id: String(p.category_id || ''), model: p.model || '',
      sku: p.sku || '', description: p.description || '',
      status: p.status, image: p.image || '', datasheet: p.datasheet || '',
    })
    // Load full product with spec values
    const res = await fetch(`/api/v1/labs/products/${p.id}`)
    if (res.ok) {
      const full: Product = await res.json()
      const vals: Record<number, any> = {}
      full.spec_values?.forEach(sv => {
        const def = sv.spec_definition
        if (!def) return
        vals[sv.spec_definition_id] = (() => {
          switch (def.data_type) {
            case 'number': return sv.value_number
            case 'decimal': return sv.value_decimal
            case 'boolean': return sv.value_boolean
            case 'multi_select':
            case 'range': return sv.value_json
            default: return sv.value_text
          }
        })()
      })
      setSpecValues(vals)
    }
    setError(null); setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      const specs = catSpecs.map(s => ({ spec_definition_id: s.id, value: specValues[s.id] ?? null }))
      const payload = { ...form, specs }
      const url = editItem ? `/api/v1/labs/products/${editItem.id}` : '/api/v1/labs/products'
      const res = await fetch(url, {
        method: editItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to save'); return }
      setShowModal(false); load()
    } catch { setError('Network error') } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/v1/labs/products/${id}`, { method: 'DELETE' })
    load()
  }

  const setF = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const StatusBadge = ({ status }: { status: string }) => {
    const c = STATUS_COLORS[status] || STATUS_COLORS.Draft
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>
        {status}
      </span>
    )
  }

  // Group catSpecs by group_name for the form
  const specGroups: Record<string, SpecDefinition[]> = {}
  catSpecs.forEach(s => {
    const g = s.group_name || 'General'
    if (!specGroups[g]) specGroups[g] = []
    specGroups[g].push(s)
  })

  return (
    <>
      <Card className="custom-card shadow-sm border-0">
        <Card.Header className="justify-content-between border-bottom-0 pb-0">
          <Card.Title className="fw-bold fs-16">Product Catalog</Card.Title>
          <Button size="sm" variant="primary" className="shadow-sm" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1" />Add Product
          </Button>
        </Card.Header>
        <Card.Body>
          {/* Filters */}
          <Row className="mb-4 gy-2 gx-2 bg-primary-transparent p-3 rounded-3 mx-0 border border-primary-transparent">
            <Col xl={3} md={6}>
              <Form.Select size="sm" className="border-default" value={filterBrand} onChange={e => { setFilterBrand(e.target.value); setPage(1) }}>
                <option value="">All Brands</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Form.Select>
            </Col>
            <Col xl={3} md={6}>
              <Form.Select size="sm" className="border-default" value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1) }}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Form.Select>
            </Col>
            <Col xl={2} md={4}>
              <Form.Select size="sm" className="border-default" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Discontinued">Discontinued</option>
              </Form.Select>
            </Col>
            <Col xl={4} md={8}>
              <InputGroup size="sm">
                <Form.Control placeholder="Search by name, model, SKU..." value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }} className="border-default" />
                <Button variant="primary-light" className="border-default border-start-0 px-3">
                  <i className="bi bi-search" />
                </Button>
              </InputGroup>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <div className="table-responsive">
              <Table className="table table-hover align-middle text-nowrap border-0">
                <thead>
                  <tr>
                    <th className="border-0">Product</th>
                    <th className="border-0">Brand</th>
                    <th className="border-0">Category</th>
                    <th className="border-0">Model / SKU</th>
                    <th className="border-0">Spec Count</th>
                    <th className="border-0 text-center">Status</th>
                    <th className="border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted fs-14">
                        No products found. <Button variant="link" size="sm" onClick={openCreate}>Add one</Button>
                      </td>
                    </tr>
                  ) : products.map(p => (
                    <tr key={p.id} className="border-bottom border-default">
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="avatar avatar-sm bg-primary-transparent text-primary avatar-rounded border border-primary-transparent shadow-sm">
                            <i className="bi bi-cpu fs-14" />
                          </span>
                          <div>
                            <div className="fw-bold fs-13">{p.product_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted fs-13">{p.brand?.name || '—'}</td>
                      <td>
                        {p.category ? (
                          <Badge bg="warning-transparent" text="warning" className="fs-11 border border-default">
                            {p.category.name}
                          </Badge>
                        ) : <span className="text-muted fs-13">—</span>}
                      </td>
                      <td>
                        <div className="fs-12 fw-semibold">{p.model || '—'}</div>
                        {p.sku && <code className="text-secondary fs-11">{p.sku}</code>}
                      </td>
                      <td>
                        <Badge bg="info-transparent" text="info" className="fs-11 border border-default">
                          {p.specs_cache ? Object.keys(p.specs_cache).length : 0} specs
                        </Badge>
                      </td>
                      <td className="text-center"><StatusBadge status={p.status} /></td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-1">
                          <Button variant="teal-light" size="sm"
                            className="btn-icon rounded-pill shadow-sm border-0"
                            onClick={() => router.push(`/labs/products/${p.id}`)}
                            title="View detail">
                            <i className="bi bi-eye-fill" />
                          </Button>
                          <Button variant="primary-light" size="sm" className="btn-icon rounded-pill shadow-sm border-0" onClick={() => openEdit(p)}>
                            <i className="bi bi-pencil-fill" />
                          </Button>
                          <Button variant="danger-light" size="sm" className="btn-icon rounded-pill shadow-sm border-0" onClick={() => handleDelete(p.id)}>
                            <i className="bi bi-trash3" />
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
        <Card.Footer className="border-top-0 d-flex justify-content-end py-3">
          <Pagination className="pagination-sm mb-0 shadow-sm">
            <Pagination.Prev disabled={page === 1} onClick={() => setPage(p => p - 1)} />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => setPage(i + 1)}>{i + 1}</Pagination.Item>
            ))}
            <Pagination.Next disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} />
          </Pagination>
        </Card.Footer>
      </Card>

      {/* Product Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="xl">
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton className="border-bottom-0 pb-0">
            <Modal.Title className="fs-16 fw-bold">
              {editItem ? `Edit: ${editItem.product_name}` : 'New Product'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <div className="alert alert-danger fs-12 py-2">{error}</div>}
            <Row className="gy-3">
              {/* Basic Info */}
              <Col xs={12}>
                <div className="fs-12 fw-bold text-muted text-uppercase border-bottom border-default pb-1 mb-2">Basic Information</div>
              </Col>
              <Col md={6}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Product Name *</Form.Label>
                <Form.Control required value={form.product_name} onChange={e => setF('product_name', e.target.value)} placeholder="e.g. AcuRev 1310" />
              </Col>
              <Col md={3}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Brand</Form.Label>
                <Form.Select value={form.brand_id} onChange={e => setF('brand_id', e.target.value)}>
                  <option value="">— Select Brand —</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Category</Form.Label>
                <Form.Select value={form.category_id} onChange={e => setF('category_id', e.target.value)}>
                  <option value="">— Select Category —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Model</Form.Label>
                <Form.Control value={form.model} onChange={e => setF('model', e.target.value)} placeholder="Model number" />
              </Col>
              <Col md={3}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">SKU</Form.Label>
                <Form.Control value={form.sku} onChange={e => setF('sku', e.target.value)} placeholder="Stock Keeping Unit" />
              </Col>
              <Col md={3}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Status</Form.Label>
                <Form.Select value={form.status} onChange={e => setF('status', e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Discontinued">Discontinued</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Datasheet URL</Form.Label>
                <Form.Control value={form.datasheet} onChange={e => setF('datasheet', e.target.value)} placeholder="https://..." />
              </Col>
              <Col xs={12}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Description</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.description} onChange={e => setF('description', e.target.value)} />
              </Col>

              {/* Dynamic Spec Fields */}
              {catSpecs.length > 0 && (
                <>
                  <Col xs={12}>
                    <div className="fs-12 fw-bold text-muted text-uppercase border-bottom border-default pb-1 mb-1 mt-2">
                      Product Specifications
                      <span className="text-muted fw-normal ms-1 fs-11">({catSpecs.length} fields from category)</span>
                    </div>
                  </Col>
                  {Object.entries(specGroups).map(([group, specs]) => (
                    <React.Fragment key={group}>
                      <Col xs={12}>
                        <div className="fs-11 fw-semibold text-primary text-uppercase mb-1">{group}</div>
                      </Col>
                      {specs.map(s => (
                        <Col key={s.id} md={
                          s.data_type === 'multi_select' || s.data_type === 'select' ? 6 :
                          s.data_type === 'range' ? 6 : 4
                        }>
                          <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">
                            {s.spec_name}
                            {s.unit && <span className="fw-normal ms-1">({s.unit})</span>}
                            {!!s.pivot?.is_required && <span className="text-danger ms-1">*</span>}
                          </Form.Label>
                          <SpecField
                            spec={s}
                            value={specValues[s.id]}
                            onChange={v => setSpecValues(prev => ({ ...prev, [s.id]: v }))}
                          />
                        </Col>
                      ))}
                    </React.Fragment>
                  ))}
                </>
              )}

              {form.category_id && catSpecs.length === 0 && (
                <Col xs={12}>
                  <div className="p-3 bg-warning-transparent rounded-3 border border-warning-transparent fs-12 text-warning">
                    <i className="bi bi-exclamation-triangle me-1" />
                    This category has no spec definitions mapped yet. Go to the <strong>Spec Mapping</strong> tab to assign specs.
                  </div>
                </Col>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-0">
            <Button variant="secondary-light" onClick={() => setShowModal(false)} size="sm">Cancel</Button>
            <Button variant="primary" type="submit" size="sm" disabled={saving}>
              {saving && <Spinner size="sm" className="me-1" />}
              {editItem ? 'Save Changes' : 'Create Product'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}
