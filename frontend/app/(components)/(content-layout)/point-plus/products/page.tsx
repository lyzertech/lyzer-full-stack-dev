'use client'

import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons'
import SpkDropdown from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import Link from 'next/link'
import React, { Fragment, useEffect, useMemo, useState, useRef } from 'react'
import {
  Card,
  Col,
  Dropdown,
  Form,
  Offcanvas,
  Pagination,
  Row,
  Button
} from 'react-bootstrap'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

type Product = {
  id: number
  barcode: string
  sku: string | null
  product_name: string
  brand: string | null
  unit: string
  purchase_price: number
  selling_price: number
  stock: number
  minimum_stock: number
  description?: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

type ProductForm = {
  barcode: string
  sku: string
  product_name: string
  brand: string
  unit: string
  purchase_price: string
  selling_price: string
  stock: string
  minimum_stock: string
  description: string
  status: 'active' | 'inactive'
}

const stockBadgeClass: Record<StockStatus, string> = {
  'In Stock': 'success-transparent',
  'Low Stock': 'warning-transparent',
  'Out of Stock': 'danger-transparent',
}

const initialForm: ProductForm = {
  barcode: '',
  sku: '',
  product_name: '',
  brand: '',
  unit: 'PCS',
  purchase_price: '0',
  selling_price: '0',
  stock: '0',
  minimum_stock: '0',
  description: '',
  status: 'active',
}

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function getStockStatus(product: Product): StockStatus {
  if (product.stock <= 0) return 'Out of Stock'
  if (product.stock <= product.minimum_stock) return 'Low Stock'
  return 'In Stock'
}

const ProductsPage: React.FC = () => {
  const pageSize = 10
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScanTimeRef = useRef<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(initialForm)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (isScanning && showAddForm) {
      setCameraError(null)
      const html5QrCode = new Html5Qrcode("reader-add-product")
      scannerRef.current = html5QrCode

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          useBarCodeDetectorIfSupported: true,
        },
        (decodedText) => {
          const now = Date.now()
          if (now - lastScanTimeRef.current < 1500) return
          lastScanTimeRef.current = now
          
          setForm(p => ({ ...p, barcode: decodedText }))
          setIsScanning(false) // Stop scanning once barcode is found
        },
        () => {}
      ).catch((err) => {
        setCameraError("Camera failed. Please check permissions.")
        html5QrCode.start(
          { facingMode: "user" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => { 
             const now = Date.now()
             if (now - lastScanTimeRef.current < 1500) return
             lastScanTimeRef.current = now
             setForm(p => ({ ...p, barcode: decodedText }))
             setIsScanning(false)
          },
          () => {}
        ).catch(() => setCameraError("Camera completely failed to start."))
      })
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(console.error)
      }
    }
  }, [isScanning, showAddForm])

  // Stop scanner when offcanvas is closed
  useEffect(() => {
    if (!showAddForm && isScanning) {
      setIsScanning(false)
    }
  }, [showAddForm])

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/v1/point-plus/products', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (data && Array.isArray(data.data)) {
        setProducts(data.data as Product[])
      } else if (Array.isArray(data)) {
        setProducts(data as Product[])
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchQuery =
        q.length === 0 ||
        [p.barcode, p.sku, p.product_name, p.brand, p.unit]
          .join(' ')
          .toLowerCase()
          .includes(q)
      return matchQuery
    })
  }, [query, products])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const paginatedProducts = filtered.slice(pageStart, pageEnd)

  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const kpis = useMemo(() => {
    let activeCount = 0
    let lowStockCount = 0
    let outOfStockCount = 0
    let totalStockUnits = 0

    for (const p of filtered) {
      if (p.status === 'active') activeCount++
      const status = getStockStatus(p)
      if (status === 'Low Stock') lowStockCount++
      if (status === 'Out of Stock') outOfStockCount++
      totalStockUnits += p.stock
    }

    return { activeCount, lowStockCount, outOfStockCount, totalStockUnits }
  }, [filtered])

  const submitAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    try {
      const payload = {
        barcode: form.barcode.trim(),
        sku: form.sku.trim() || null,
        product_name: form.product_name.trim(),
        brand: form.brand.trim() || null,
        unit: form.unit.trim() || 'PCS',
        description: form.description.trim() || null,
        purchase_price: Number(form.purchase_price || 0),
        selling_price: Number(form.selling_price || 0),
        stock: Number(form.stock || 0),
        minimum_stock: Number(form.minimum_stock || 0),
        status: form.status,
      }

      const res = await fetch('/api/v1/point-plus/products', {
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
          <h1 className="page-title fw-medium fs-20 mb-0">Point+ Product Master</h1>
          <div className="text-muted fs-12 mt-1">
            Manage your retail items, scan barcodes, and track inventory stock levels.
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
                <i className="ri-barcode-line me-2"></i>Print Barcodes
              </Dropdown.Item>
            </li>
            <li>
              <Dropdown.Item onClick={loadProducts}>
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
                  <div className="text-muted fs-12">Total Stock Items</div>
                  <div className="fs-18 fw-semibold">
                    {kpis.totalStockUnits}
                  </div>
                </div>
                <span className="avatar avatar-md bg-info-transparent">
                  <i className="ri-database-2-line fs-18"></i>
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="custom-card overflow-hidden">
        <Card.Header className="justify-content-between flex-wrap gap-2">
          <div className="card-title">Products Directory</div>
          <div className="d-flex flex-wrap gap-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <i className="ri-barcode-line text-muted"></i>
              </span>
              <Form.Control
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                className="border-0 bg-light"
                placeholder="Scan or Search..."
                aria-label="Search products"
                autoFocus
              />
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <SpkTables
              tableClass="text-nowrap table-hover"
              header={[
                { title: 'Item details' },
                { title: 'Barcode' },
                { title: 'Stock' },
                { title: 'Selling Price' },
                { title: 'Status' },
                { title: 'Actions' },
              ]}
            >
              {paginatedProducts.map((p) => {
                const stockStatus = getStockStatus(p)
                return (
                  <tr key={p.id}>
                    <td style={{ maxWidth: 280 }}>
                      <div className="lh-1">
                        <div
                          className="fw-semibold text-truncate"
                          style={{ maxWidth: 280 }}
                        >
                          {p.product_name}
                        </div>
                        <div
                          className="text-muted fs-12 text-truncate mt-1"
                          style={{ maxWidth: 280 }}
                        >
                          {p.brand ? `${p.brand} • ` : ''}{p.unit}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-monospace fs-12">{p.barcode}</div>
                    </td>
                    <td>
                      <div className="lh-1">
                        <div className="fw-semibold">
                          {p.stock}
                        </div>
                        <SpkBadge
                          variant=""
                          Customclass={`badge bg-${stockBadgeClass[stockStatus]} mt-1`}
                        >
                          {stockStatus}
                        </SpkBadge>
                      </div>
                    </td>
                    <td>
                      <div className="fw-medium text-success">
                        {currency.format(p.selling_price)}
                      </div>
                    </td>
                    <td>
                      <SpkBadge
                        variant=""
                        Customclass={`badge bg-${p.status === 'active' ? 'success' : 'light text-muted'}-transparent`}
                      >
                        {p.status === 'active' ? 'Active' : 'Inactive'}
                      </SpkBadge>
                    </td>
                    <td>
                      <SpkButton
                        Buttonvariant="primary-light"
                        Customclass="btn btn-icon btn-sm rounded-circle me-2"
                        onClickfunc={() => setSelected(p)}
                      >
                        <i className="ri-eye-line"></i>
                      </SpkButton>
                      <SpkButton
                        Buttonvariant="info-light"
                        Customclass="btn btn-icon btn-sm rounded-circle"
                      >
                        <i className="ri-pencil-line"></i>
                      </SpkButton>
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
                  <div className="fw-semibold fs-16">{selected.product_name}</div>
                  <div className="text-muted fs-12 font-monospace mt-1">
                    <i className="ri-barcode-line me-1"></i>{selected.barcode}
                  </div>
                </div>
                <SpkBadge
                  variant=""
                  Customclass={`badge bg-${selected.status === 'active' ? 'success' : 'light text-muted'}-transparent`}
                >
                  {selected.status === 'active' ? 'Active' : 'Inactive'}
                </SpkBadge>
              </div>

              <Card className="custom-card mb-0">
                <Card.Body className="p-3">
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Brand</span>
                      <span className="fw-medium">{selected.brand || '-'}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">SKU</span>
                      <span className="fw-medium">{selected.sku || '-'}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Unit</span>
                      <span className="fw-medium">{selected.unit}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="custom-card mb-0 bg-primary-transparent border-primary">
                <Card.Body className="p-3">
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Selling Price</span>
                      <span className="fw-bold fs-16 text-primary">
                        {currency.format(selected.selling_price)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Purchase Price</span>
                      <span className="fw-medium">
                        {currency.format(selected.purchase_price)}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="custom-card mb-0">
                <Card.Body className="p-3">
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Current Stock</span>
                      <span className={`fw-bold ${selected.stock <= selected.minimum_stock ? 'text-danger' : 'text-success'}`}>
                        {selected.stock}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Minimum Stock</span>
                      <span className="fw-medium">{selected.minimum_stock}</span>
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

              <div className="d-flex gap-2 mt-auto">
                <Link href="#!" className="btn btn-primary btn-wave flex-fill">
                  <i className="ri-pencil-line me-2"></i>Edit
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
          <Offcanvas.Title>Add New Product</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form
            onSubmit={submitAddProduct}
            className="d-flex flex-column gap-3"
          >
            <Row className="g-3">
              <Col md={12}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Form.Label className="mb-0">Barcode *</Form.Label>
                  <Button 
                    variant={isScanning ? "danger" : "primary-light"} 
                    size="sm"
                    className="btn-wave"
                    onClick={() => setIsScanning(!isScanning)}
                  >
                    <i className={`ri-${isScanning ? 'close' : 'camera'}-line align-middle`} />
                  </Button>
                </div>
                <div className={`mb-3 ${isScanning ? '' : 'd-none'}`}>
                  {cameraError && <div className="alert alert-danger text-center p-2 fs-12">{cameraError}</div>}
                  <div className="d-flex justify-content-center bg-light rounded p-2">
                    <div id="reader-add-product" style={{ width: '100%', maxWidth: '300px', overflow: 'hidden', borderRadius: '8px' }}></div>
                  </div>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="ri-barcode-box-line"></i></span>
                  <Form.Control
                    required
                    autoFocus
                    placeholder="Scan barcode..."
                    value={form.barcode}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, barcode: e.target.value }))
                    }
                  />
                </div>
              </Col>
              <Col md={12}>
                <Form.Label>Product Name *</Form.Label>
                <Form.Control
                  required
                  placeholder="E.g. Indomie Goreng"
                  value={form.product_name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, product_name: e.target.value }))
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Brand</Form.Label>
                <Form.Control
                  placeholder="E.g. Indofood"
                  value={form.brand}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, brand: e.target.value }))
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>SKU</Form.Label>
                <Form.Control
                  placeholder="Optional SKU"
                  value={form.sku}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sku: e.target.value }))
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Unit</Form.Label>
                <Form.Select
                  value={form.unit}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      unit: e.target.value,
                    }))
                  }
                >
                  <option value="PCS">PCS</option>
                  <option value="PACK">PACK</option>
                  <option value="BOX">BOX</option>
                  <option value="CARTON">CARTON</option>
                  <option value="KG">KG</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, stock: e.target.value }))
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Purchase Price</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">Rp</span>
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.purchase_price}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, purchase_price: e.target.value }))
                    }
                  />
                </div>
              </Col>
              <Col md={6}>
                <Form.Label>Selling Price *</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">Rp</span>
                  <Form.Control
                    required
                    type="number"
                    min={0}
                    value={form.selling_price}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, selling_price: e.target.value }))
                    }
                  />
                </div>
              </Col>
              <Col md={6}>
                <Form.Label>Minimum Stock Alert</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={form.minimum_stock}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, minimum_stock: e.target.value }))
                  }
                />
              </Col>
              <Col md={12}>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
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
                  label="Product is active"
                  checked={form.status === 'active'}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.checked ? 'active' : 'inactive' }))
                  }
                />
              </Col>
            </Row>

            {formError ? (
              <div className="text-danger fs-12 mt-2">{formError}</div>
            ) : null}

            <div className="d-flex gap-2 mt-3">
              <SpkButton
                Buttonvariant="primary"
                Buttontype="submit"
                Customclass="btn btn-wave flex-fill"
                Disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Product'}
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
