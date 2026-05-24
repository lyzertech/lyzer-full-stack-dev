'use client'

import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons'
import SpkDropdown from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import Link from 'next/link'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import {
  Card,
  Col,
  Dropdown,
  Form,
  Offcanvas,
  Pagination,
  Row,
} from 'react-bootstrap'

type ProductType = 'Goods' | 'Service' | 'Bundle'
type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

type Product = {
  id: number
  sku: string
  brand: string
  name: string
  code: string
  model: string
  type: ProductType
  unit: string
  cost_price: number
  selling_price: number
  stock_qty: number
  description?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

type ProductForm = {
  sku: string
  brand: string
  name: string
  code: string
  model: string
  type: ProductType
  unit: string
  description: string
  selling_price: string
  stock_qty: string
  is_active: boolean
}

const stockBadgeClass: Record<StockStatus, string> = {
  'In Stock': 'success-transparent',
  'Low Stock': 'warning-transparent',
  'Out of Stock': 'danger-transparent',
}

const initialForm: ProductForm = {
  sku: '',
  brand: '',
  name: '',
  code: '',
  model: '',
  type: 'Goods',
  unit: 'pcs',
  description: '',
  selling_price: '',
  stock_qty: '0',
  is_active: true,
}

const brandOptions = [
  'Accuenergy',
  'Rishabh',
  'Camille Bauer',
  'Alan',
  'Monarch',
  'EMH',
  'Dold',
  'Leipole',
]

/** Maps a brand name to its SKU prefix */
const BRAND_PREFIX: Record<string, string> = {
  Accuenergy: 'Accu',
  Rishabh: 'Rish',
  'Camille Bauer': 'CB',
  Alan: 'Alan',
  Monarch: 'Mon',
  EMH: 'Emh',
  Dold: 'Dold',
  Leipole: 'Lei',
}

/** Generates the next SKU for a brand based on existing product list */
function generateSku(brand: string, existingProducts: Product[]): string {
  const prefix = BRAND_PREFIX[brand]
  if (!prefix) return ''
  const count = existingProducts.filter((p) => p.brand === brand).length
  const seq = String(count + 1).padStart(3, '0')
  return `${prefix}${seq}`
}

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function getStockStatus(product: Product): StockStatus {
  if (product.type === 'Service') return 'In Stock'
  if (product.stock_qty <= 0) return 'Out of Stock'
  if (product.stock_qty <= 3) return 'Low Stock'
  return 'In Stock'
}

const ProductsPage: React.FC = () => {
  const pageSize = 7
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [brandFilter, setBrandFilter] = useState<string>('All')
  const [selected, setSelected] = useState<Product | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(initialForm)
  const [currentPage, setCurrentPage] = useState(1)

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/v1/sales/products', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data)) setProducts(data as Product[])
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const brands = useMemo(() => {
    const uniq = new Set(products.map((p) => p.brand))
    return ['All', ...Array.from(uniq).sort((a, b) => a.localeCompare(b))]
  }, [products])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchQuery =
        q.length === 0 ||
        [p.sku, p.brand, p.name, p.code, p.model, p.type, p.unit]
          .join(' ')
          .toLowerCase()
          .includes(q)
      const matchType = typeFilter === 'All' ? true : p.type === typeFilter
      const matchBrand = brandFilter === 'All' ? true : p.brand === brandFilter
      return matchQuery && matchType && matchBrand
    })
  }, [query, typeFilter, brandFilter, products])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const paginatedProducts = filtered.slice(pageStart, pageEnd)

  useEffect(() => {
    setCurrentPage(1)
  }, [query, typeFilter, brandFilter])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const kpis = useMemo(() => {
    let activeCount = 0
    let lowStockCount = 0
    let outOfStockCount = 0
    let totalStockUnits = 0

    for (const p of filtered) {
      if (p.is_active) activeCount++
      const status = getStockStatus(p)
      if (status === 'Low Stock') lowStockCount++
      if (status === 'Out of Stock') outOfStockCount++
      if (p.type !== 'Service') totalStockUnits += p.stock_qty
    }

    return { activeCount, lowStockCount, outOfStockCount, totalStockUnits }
  }, [filtered])

  const submitAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    try {
      const payload = {
        sku: form.sku.trim(),
        brand: form.brand.trim() || null,
        name: form.name.trim(),
        code: form.code.trim(),
        model: form.model.trim() || null,
        type: form.type,
        unit: form.unit.trim() || null,
        description: form.description.trim() || null,
        selling_price: Number(form.selling_price || 0),
        stock_qty: Number(form.stock_qty || 0),
        is_active: form.is_active,
      }

      const res = await fetch('/api/v1/sales/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        const message =
          body?.message ||
          body?.error ||
          (body?.errors ? Object.values(body.errors).flat().join(' ') : null) ||
          'Failed to create product.'
        setFormError(message)
        return
      }

      setShowAddForm(false)
      setForm(initialForm)
      await loadProducts()
    } catch (error) {
      setFormError('Failed to create product.')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Fragment>
      <div className="d-flex align-items-center justify-content-between mb-3 page-header-breadcrumb flex-wrap gap-2">
        <div>
          <h1 className="page-title fw-medium fs-20 mb-0">Product Catalog</h1>
          <div className="text-muted fs-12 mt-1">
            Sample UI for sales product master data with stock, selling price,
            and details panel.
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <SpkDropdown
            Togglevariant=""
            Toggletext="Actions"
            Arrowicon={true}
            IconClass="ri-arrow-down-s-line align-middle ms-1 d-inline-block"
            Customtoggleclass="btn btn-outline-light btn-wave waves-effect waves-light no-caret"
          >
            <li>
              <Dropdown.Item href="#!">
                <i className="ri-download-2-line me-2"></i>Export CSV
              </Dropdown.Item>
            </li>
            <li>
              <Dropdown.Item href="#!">
                <i className="ri-price-tag-3-line me-2"></i>Price update
              </Dropdown.Item>
            </li>
            <li>
              <Dropdown.Item href="#!">
                <i className="ri-refresh-line me-2"></i>Refresh
              </Dropdown.Item>
            </li>
          </SpkDropdown>
          <SpkButton
            Buttonvariant="primary"
            Customclass="btn btn-wave"
            onClickfunc={() => setShowAddForm(true)}
          >
            <i className="ri-add-line me-1"></i>Add Product
          </SpkButton>
        </div>
      </div>

      <Row className="mb-3">
        <Col xl={3} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fs-12">Total Products</div>
                  <div className="fs-18 fw-semibold">{filtered.length}</div>
                </div>
                <span className="avatar avatar-md bg-primary-transparent">
                  <i className="ri-box-3-line fs-18"></i>
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fs-12">Active Products</div>
                  <div className="fs-18 fw-semibold">{kpis.activeCount}</div>
                </div>
                <span className="avatar avatar-md bg-success-transparent">
                  <i className="ri-checkbox-circle-line fs-18"></i>
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fs-12">Low/Out Stock</div>
                  <div className="fs-18 fw-semibold">
                    {kpis.lowStockCount + kpis.outOfStockCount}
                  </div>
                </div>
                <span className="avatar avatar-md bg-warning-transparent">
                  <i className="ri-error-warning-line fs-18"></i>
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fs-12">Total Stock Units</div>
                  <div className="fs-18 fw-semibold">
                    {kpis.totalStockUnits}
                  </div>
                </div>
                <span className="avatar avatar-md bg-info-transparent">
                  <i className="ri-wallet-3-line fs-18"></i>
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="custom-card overflow-hidden">
        <Card.Header className="justify-content-between flex-wrap gap-2">
          <div className="card-title">Products</div>
          <div className="d-flex flex-wrap gap-2">
            <Form.Control
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search SKU, name, brand, code, model..."
              aria-label="Search products"
            />
            <Form.Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter product type"
            >
              <option value="All">All Types</option>
              <option value="Goods">Goods</option>
              <option value="Service">Service</option>
              <option value="Bundle">Bundle</option>
            </Form.Select>
            <Form.Select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              aria-label="Filter by brand"
            >
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </Form.Select>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <SpkTables
              tableClass="text-nowrap table-hover"
              header={[
                { title: 'Product' },
                { title: 'Stock' },
                { title: 'Selling Price' },
                { title: 'Status' },
                { title: 'Actions' },
              ]}
            >
              {paginatedProducts.map((p) => {
                const stockStatus = getStockStatus(p)
                return (
                  <tr key={p.sku}>
                    <td style={{ maxWidth: 280 }}>
                      <div className="lh-1">
                        <div
                          className="fw-semibold text-truncate"
                          style={{ maxWidth: 280 }}
                        >
                          {p.name}
                        </div>
                        <div
                          className="text-muted fs-12 text-truncate"
                          style={{ maxWidth: 280 }}
                        >
                          {p.sku} • {p.brand} • {p.model}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="lh-1">
                        <div className="fw-semibold">
                          {p.type === 'Service'
                            ? 'N/A'
                            : `${p.stock_qty} ${p.unit}`}
                        </div>
                        <SpkBadge
                          variant=""
                          Customclass={`badge bg-${stockBadgeClass[stockStatus]}`}
                        >
                          {stockStatus}
                        </SpkBadge>
                      </div>
                    </td>
                    <td>
                      <div className="fw-medium">
                        {currency.format(p.selling_price)}
                      </div>
                    </td>
                    <td>
                      <SpkBadge
                        variant=""
                        Customclass={`badge bg-${p.is_active ? 'success' : 'light text-muted'}-transparent`}
                      >
                        {p.is_active ? 'Active' : 'Inactive'}
                      </SpkBadge>
                    </td>
                    <td>
                      <SpkDropdown
                        Togglevariant=""
                        Icon={true}
                        Customtoggleclass="btn btn-icon btn-sm btn-light border no-caret"
                        IconClass="fe fe-more-vertical"
                      >
                        <Dropdown.Item as="li" onClick={() => setSelected(p)}>
                          <i className="ri-eye-line me-2"></i>View detail
                        </Dropdown.Item>
                        <Dropdown.Item as="li" href="#!">
                          <i className="ri-pencil-line me-2"></i>Edit
                        </Dropdown.Item>
                        <Dropdown.Item
                          as="li"
                          href="#!"
                          className="text-danger"
                        >
                          <i className="ri-delete-bin-line me-2"></i>Archive
                        </Dropdown.Item>
                      </SpkDropdown>
                    </td>
                  </tr>
                )
              })}
            </SpkTables>
          </div>
        </Card.Body>

        <div className="card-footer border-top-0">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <div>
              Showing{' '}
              <span className="fw-semibold">
                {filtered.length === 0 ? 0 : pageStart + 1}-
                {Math.min(pageEnd, filtered.length)}
              </span>{' '}
              of <span className="fw-semibold">{filtered.length}</span> filtered
              from <span className="fw-semibold">{products.length}</span>
            </div>
            <div className="ms-auto">
              <nav
                aria-label="Product pagination"
                className="pagination-style-2"
              >
                <Pagination className="mb-0 flex-wrap">
                  <Pagination.Prev
                    disabled={currentPage === 1 || filtered.length === 0}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                  >
                    Prev
                  </Pagination.Prev>
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <Pagination.Item
                      key={page}
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={
                      currentPage === totalPages || filtered.length === 0
                    }
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                  >
                    Next
                  </Pagination.Next>
                </Pagination>
              </nav>
            </div>
          </div>
        </div>
      </Card>

      <Offcanvas
        placement="end"
        show={!!selected}
        onHide={() => setSelected(null)}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Product Details</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selected ? (
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div>
                  <div className="fw-semibold fs-16">{selected.name}</div>
                  <div className="text-muted fs-12">
                    {selected.sku} • {selected.code}
                  </div>
                </div>
                <SpkBadge
                  variant=""
                  Customclass={`badge bg-${selected.is_active ? 'success' : 'light text-muted'}-transparent`}
                >
                  {selected.is_active ? 'Active' : 'Inactive'}
                </SpkBadge>
              </div>

              <Card className="custom-card mb-0">
                <Card.Body className="p-3">
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Brand</span>
                      <span className="fw-medium">{selected.brand}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Model</span>
                      <span className="fw-medium">{selected.model}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Type</span>
                      <span className="fw-medium">{selected.type}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Unit</span>
                      <span className="fw-medium">{selected.unit}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="custom-card mb-0">
                <Card.Body className="p-3">
                  <div className="text-muted fs-12 mb-1">Description</div>
                  <div className="fw-medium fs-14" style={{ whiteSpace: 'pre-wrap' }}>
                    {selected.description || <span className="text-muted fs-12 fst-italic">No description available.</span>}
                  </div>
                </Card.Body>
              </Card>

              <Card className="custom-card mb-0">
                <Card.Body className="p-3">
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Selling Price</span>
                      <span className="fw-medium">
                        {currency.format(selected.selling_price)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Stock Qty</span>
                      <span className="fw-medium">
                        {selected.type === 'Service'
                          ? 'N/A'
                          : selected.stock_qty}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <div className="d-flex gap-2">
                <Link href="#!" className="btn btn-primary btn-wave flex-fill">
                  <i className="ri-pencil-line me-2"></i>Edit
                </Link>
                <Link
                  href="#!"
                  className="btn btn-outline-light btn-wave flex-fill"
                >
                  <i className="ri-file-copy-line me-2"></i>Duplicate
                </Link>
              </div>
            </div>
          ) : null}
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas
        placement="end"
        show={showAddForm}
        onHide={() => setShowAddForm(false)}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Add Product</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form
            onSubmit={submitAddProduct}
            className="d-flex flex-column gap-3"
          >
            <Row className="g-2">
              <Col md={12}>
                <Form.Label>Code *</Form.Label>
                <Form.Control
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, code: e.target.value }))
                  }
                />
              </Col>
              <Col md={12}>
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Brand</Form.Label>
                <Form.Select
                  value={form.brand}
                  onChange={(e) => {
                    const brand = e.target.value
                    const autoSku = generateSku(brand, products)
                    setForm((p) => ({ ...p, brand, sku: autoSku }))
                  }}
                >
                  <option value="">Select Brand</option>
                  {brandOptions.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Model</Form.Label>
                <Form.Control
                  value={form.model}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, model: e.target.value }))
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={form.type}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      type: e.target.value as ProductType,
                    }))
                  }
                >
                  <option value="Goods">Goods</option>
                  <option value="Service">Service</option>
                  <option value="Bundle">Bundle</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Unit</Form.Label>
                <Form.Control
                  value={form.unit}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, unit: e.target.value }))
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Selling Price *</Form.Label>
                <Form.Control
                  required
                  type="number"
                  min={0}
                  value={form.selling_price}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, selling_price: e.target.value }))
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Stock Qty</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={form.stock_qty}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, stock_qty: e.target.value }))
                  }
                />
              </Col>
              <Col md={12}>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </Col>
              <Col md={12}>
                <Form.Check
                  id="product-is-active"
                  type="switch"
                  label="Active product"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, is_active: e.target.checked }))
                  }
                />
              </Col>
            </Row>

            {formError ? (
              <div className="text-danger fs-12">{formError}</div>
            ) : null}

            <div className="d-flex gap-2">
              <SpkButton
                Buttonvariant="primary"
                Buttontype="submit"
                Customclass="btn btn-wave flex-fill"
                Disabled={submitting}
              >
                Save Product
              </SpkButton>
              <SpkButton
                Buttonvariant="outline-light"
                Customclass="btn btn-wave flex-fill"
                onClickfunc={() => setShowAddForm(false)}
              >
                Cancel
              </SpkButton>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </Fragment>
  )
}

export default ProductsPage
