'use client'

import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons'
import SpkDropdown from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Modal,
  Offcanvas,
  Pagination,
  Row,
} from 'react-bootstrap'

// ─── Types ────────────────────────────────────────────────────────────────────

type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired'
type QuotationValidity = '7' | '14' | '30' | '45' | '60'

type LineItem = {
  id: string
  product_sku: string
  product_name: string
  unit: string
  qty: number
  unit_price: number
  discount_pct: number
  description?: string
  note: string
}

type Quotation = {
  id: number
  quotation_no: string
  customer_id: number
  customer_name: string
  customer_company: string
  customer_email: string
  sales_owner: string
  status: QuotationStatus
  validity_days: QuotationValidity
  issued_date: string
  expiry_date: string
  subject: string
  notes: string
  terms: string
  items: LineItem[]
  tax_pct: number
  created_at: string
  updated_at: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SALES_LIST = [
  'Bambang Tri',
  'Rizky',
  'Eka',
  'Setia',
  'David',
  'Vicha',
  'Heri',
  'Dika',
]

const STATUS_OPTIONS: QuotationStatus[] = [
  'Draft',
  'Sent',
  'Approved',
  'Rejected',
  'Expired',
]

const STATUS_BADGE: Record<QuotationStatus, string> = {
  Draft: 'secondary-transparent',
  Sent: 'info-transparent',
  Approved: 'success-transparent',
  Rejected: 'danger-transparent',
  Expired: 'warning-transparent',
}

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcLineSubtotal(item: LineItem): number {
  const base = item.qty * item.unit_price
  return base - (base * item.discount_pct) / 100
}

function calcQuotationTotals(items: LineItem[], tax_pct: number) {
  const subtotal = items.reduce((acc, it) => acc + calcLineSubtotal(it), 0)
  const tax = (subtotal * tax_pct) / 100
  const grand = subtotal + tax
  return { subtotal, tax, grand }
}

function genQuotationNo(existing: Quotation[]): string {
  const seq = existing.length + 1
  const pad = String(seq).padStart(4, '0')
  return `QUO-2604-${pad}`
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Blank forms ──────────────────────────────────────────────────────────────

type QuotationForm = {
  customer_id: string
  sales_owner: string
  status: QuotationStatus
  validity_days: QuotationValidity
  issued_date: string
  subject: string
  notes: string
  terms: string
  tax_pct: string
  items: LineItem[]
}

const today = new Date().toISOString().slice(0, 10)

const BLANK_FORM: QuotationForm = {
  customer_id: '',
  sales_owner: '',
  status: 'Draft',
  validity_days: '30',
  issued_date: today,
  subject: '',
  notes: '',
  terms: 'Payment 30 days after invoice. Delivery FOB Jakarta warehouse.',
  tax_pct: '11',
  items: [],
}

const BLANK_LINE = (): LineItem => ({
  id: uid(),
  product_sku: '',
  product_name: '',
  unit: 'pcs',
  qty: 1,
  unit_price: 0,
  discount_pct: 0,
  note: '',
})

// ─── Page Component ───────────────────────────────────────────────────────────

const QuotationPage: React.FC = () => {
  const pageSize = 7
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [dbCustomers, setDbCustomers] = useState<any[]>([])
  const [dbProducts, setDbProducts] = useState<any[]>([])
  const [query, setQuery] = useState('')

  const loadInitialData = async () => {
    try {
      const [qRes, cRes, pRes] = await Promise.all([
        fetch('/api/v1/sales/quotations', { cache: 'no-store' }),
        fetch('/api/v1/sales/customers', { cache: 'no-store' }),
        fetch('/api/v1/sales/products', { cache: 'no-store' }),
      ])
      if (qRes.ok) setQuotations(await qRes.json())
      if (cRes.ok) setDbCustomers(await cRes.json())
      if (pRes.ok) setDbProducts(await pRes.json())
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [salesFilter, setSalesFilter] = useState<string>('All')
  const [currentPage, setCurrentPage] = useState(1)

  // detail offcanvas
  const [selected, setSelected] = useState<Quotation | null>(null)

  // add/edit modal
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Quotation | null>(null)
  const [form, setForm] = useState<QuotationForm>({ ...BLANK_FORM })
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof QuotationForm | 'items', string>>
  >({})
  const [submitting, setSubmitting] = useState(false)

  // preview modal
  const [previewTarget, setPreviewTarget] = useState<Quotation | null>(null)

  // ── Print helper — isolates only the preview div ─────────────────────────
  const handlePrint = () => {
    const styleId = 'print-override'
    let style = document.getElementById(styleId) as HTMLStyleElement | null
    if (!style) {
      style = document.createElement('style')
      style.id = styleId
      document.head.appendChild(style)
    }
    style.textContent = `
      @media print {
        @page { margin: 12mm 14mm; size: A4; }
        html, body { background: #fff !important; }
        body > * { visibility: hidden !important; }
        #quotation-preview-root,
        #quotation-preview-root * { visibility: visible !important; }
        #quotation-preview-root {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          z-index: 99999 !important;
        }
      }
    `
    setTimeout(() => {
      window.print()
      window.addEventListener(
        'afterprint',
        () => {
          style!.textContent = ''
        },
        { once: true },
      )
    }, 80)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return quotations.filter((qt) => {
      const matchQuery =
        q.length === 0 ||
        [
          qt.quotation_no,
          qt.customer_name,
          qt.customer_company,
          qt.subject,
          qt.sales_owner,
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)
      const matchStatus = statusFilter === 'All' || qt.status === statusFilter
      const matchSales = salesFilter === 'All' || qt.sales_owner === salesFilter
      return matchQuery && matchStatus && matchSales
    })
  }, [quotations, query, statusFilter, salesFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const paginatedQuotations = filtered.slice(pageStart, pageStart + pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [query, statusFilter, salesFilter])
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  // ── KPIs ─────────────────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    let totalValue = 0
    let draftCount = 0
    let sentCount = 0
    let approvedCount = 0

    for (const qt of quotations) {
      const { grand } = calcQuotationTotals(qt.items, qt.tax_pct)
      totalValue += grand
      if (qt.status === 'Draft') draftCount++
      if (qt.status === 'Sent') sentCount++
      if (qt.status === 'Approved') approvedCount++
    }
    return {
      totalValue,
      draftCount,
      sentCount,
      approvedCount,
      total: quotations.length,
    }
  }, [quotations])

  // ── Sales filter list ────────────────────────────────────────────────────

  const salesOwnerList = useMemo(() => {
    const set = new Set(quotations.map((q) => q.sales_owner))
    return ['All', ...Array.from(set).sort()]
  }, [quotations])

  // ── Modal open/close ──────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditTarget(null)
    setForm({ ...BLANK_FORM, items: [BLANK_LINE()] })
    setFormErrors({})
    setShowModal(true)
  }

  const openEditModal = (qt: Quotation) => {
    setEditTarget(qt)
    setForm({
      customer_id: String(qt.customer_id),
      sales_owner: qt.sales_owner,
      status: qt.status,
      validity_days: qt.validity_days,
      issued_date: qt.issued_date,
      subject: qt.subject,
      notes: qt.notes,
      terms: qt.terms,
      tax_pct: String(qt.tax_pct),
      items: qt.items.map((it) => ({ ...it })),
    })
    setFormErrors({})
    setShowModal(true)
    setSelected(null)
  }

  // ── Line item mutations ───────────────────────────────────────────────────

  const addLine = () =>
    setForm((f) => ({ ...f, items: [...f.items, BLANK_LINE()] }))

  const removeLine = (id: string) =>
    setForm((f) => ({ ...f, items: f.items.filter((it) => it.id !== id) }))

  const updateLine = (id: string, patch: Partial<LineItem>) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }))

  const pickProduct = (lineId: string, sku: string) => {
    const prod = dbProducts.find((p) => p.sku === sku)
    if (!prod) return
    updateLine(lineId, {
      product_sku: prod.sku,
      product_name: prod.name,
      unit: prod.unit || 'pcs',
      unit_price: prod.selling_price || 0,
      description: prod.description || '',
    })
  }

  const pickCustomer = (custId: string) => {
    const cust = dbCustomers.find((c) => String(c.id) === custId)
    setForm((f) => ({
      ...f,
      customer_id: custId,
      sales_owner: cust ? cust.sales || f.sales_owner : f.sales_owner,
    }))
  }

  // ── Form computed ─────────────────────────────────────────────────────────

  const formTotals = useMemo(() => {
    return calcQuotationTotals(form.items, Number(form.tax_pct) || 0)
  }, [form.items, form.tax_pct])

  // ── Validation & Submit ───────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: typeof formErrors = {}
    if (!form.customer_id) errs.customer_id = 'Customer is required'
    if (!form.subject.trim()) errs.subject = 'Subject is required'
    if (form.items.length === 0)
      errs.items = 'At least one line item is required'
    for (const it of form.items) {
      if (!it.product_sku) {
        errs.items = 'All line items must have a product selected'
        break
      }
      if (it.qty <= 0) {
        errs.items = 'Qty must be > 0 for all items'
        break
      }
    }
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    await new Promise((r) => setTimeout(r, 400)) // simulate API

    const customer = dbCustomers.find((c) => String(c.id) === form.customer_id)!
    const now = new Date().toLocaleString('sv-SE')
    const expiry = addDays(form.issued_date, Number(form.validity_days))

    if (editTarget) {
      const res = await fetch(`/api/v1/sales/quotations/${editTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          customer_name: customer.name,
          customer_company: customer.company,
          customer_email: customer.email,
          sales_owner: form.sales_owner || customer.sales || '',
          status: form.status,
          validity_days: form.validity_days,
          issued_date: form.issued_date,
          expiry_date: expiry,
          subject: form.subject.trim(),
          notes: form.notes.trim(),
          terms: form.terms.trim(),
          tax_pct: Number(form.tax_pct) || 11,
          items: form.items,
        }),
      })
      if (!res.ok) alert('Error: ' + (await res.text()))
    } else {
      const res = await fetch('/api/v1/sales/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          customer_name: customer.name,
          customer_company: customer.company,
          customer_email: customer.email,
          sales_owner: form.sales_owner || customer.sales || '',
          status: form.status,
          validity_days: form.validity_days,
          issued_date: form.issued_date,
          expiry_date: expiry,
          subject: form.subject.trim(),
          notes: form.notes.trim(),
          terms: form.terms.trim(),
          tax_pct: Number(form.tax_pct) || 11,
          items: form.items,
        }),
      })
      if (!res.ok) alert('Error: ' + (await res.text()))
    }

    await loadInitialData()

    setSubmitting(false)
    setShowModal(false)
  }

  const handleStatusChange = async (
    qt: Quotation,
    newStatus: QuotationStatus,
  ) => {
    await fetch(`/api/v1/sales/quotations/${qt.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    await loadInitialData()

    if (selected?.id === qt.id) {
      setSelected((s) => (s ? { ...s, status: newStatus } : s))
    }
  }

  const handleDuplicate = async (qt: Quotation) => {
    await fetch('/api/v1/sales/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: qt.customer_id,
        customer_name: qt.customer_name,
        customer_company: qt.customer_company,
        customer_email: qt.customer_email,
        sales_owner: qt.sales_owner,
        status: 'Draft',
        validity_days: qt.validity_days,
        issued_date: today,
        expiry_date: addDays(today, Number(qt.validity_days)),
        subject: qt.subject,
        notes: qt.notes,
        terms: qt.terms,
        tax_pct: qt.tax_pct,
        items: qt.items.map((it) => ({ ...it, id: undefined })),
      }),
    })

    await loadInitialData()
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Fragment>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center justify-content-between mb-3 page-header-breadcrumb flex-wrap gap-2">
        <div>
          <h1 className="page-title fw-medium fs-20 mb-0">Quotations</h1>
          <div className="text-muted fs-12 mt-1">
            Create, manage, and track sales quotations — from draft to approval.
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
                <i className="ri-download-2-line me-2"></i>Export PDF
              </Dropdown.Item>
            </li>
            <li>
              <Dropdown.Item href="#!">
                <i className="ri-file-excel-line me-2"></i>Export Excel
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
            onClick={openAddModal}
          >
            <i className="ri-add-line me-1"></i>New Quotation
          </SpkButton>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <Row className="mb-3">
        <Col xl={3} md={6} className="mb-3 mb-xl-0">
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fs-12">Total Quotations</div>
                  <div className="fs-18 fw-semibold">{kpis.total}</div>
                  <div className="text-muted fs-11 mt-1">All statuses</div>
                </div>
                <span className="avatar avatar-md bg-primary-transparent">
                  <i className="ri-file-list-3-line fs-18"></i>
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6} className="mb-3 mb-xl-0">
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fs-12">Pipeline Value</div>
                  <div
                    className="fs-18 fw-semibold"
                    style={{ fontSize: '15px' }}
                  >
                    {currency.format(kpis.totalValue)}
                  </div>
                  <div className="text-muted fs-11 mt-1">
                    Incl. tax, all statuses
                  </div>
                </div>
                <span className="avatar avatar-md bg-success-transparent">
                  <i className="ri-money-dollar-circle-line fs-18"></i>
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6} className="mb-3 mb-md-0">
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fs-12">Sent / Pending</div>
                  <div className="fs-18 fw-semibold">{kpis.sentCount}</div>
                  <div className="text-muted fs-11 mt-1">
                    Awaiting customer response
                  </div>
                </div>
                <span className="avatar avatar-md bg-info-transparent">
                  <i className="ri-send-plane-line fs-18"></i>
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
                  <div className="text-muted fs-12">Approved</div>
                  <div className="fs-18 fw-semibold">{kpis.approvedCount}</div>
                  <div className="text-muted fs-11 mt-1">
                    Ready for PO / invoice
                  </div>
                </div>
                <span className="avatar avatar-md bg-warning-transparent">
                  <i className="ri-checkbox-circle-line fs-18"></i>
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Main Table Card ──────────────────────────────────────────────────── */}
      <Card className="custom-card overflow-hidden">
        <Card.Header className="justify-content-between flex-wrap gap-2">
          <div className="card-title">Quotation List</div>
          <div className="d-flex flex-wrap gap-2">
            <Form.Control
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search no., customer, subject, sales..."
              aria-label="Search quotations"
              style={{ minWidth: 220 }}
            />
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              style={{ width: 130 }}
            >
              <option value="All">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Form.Select>
            <Form.Select
              value={salesFilter}
              onChange={(e) => setSalesFilter(e.target.value)}
              aria-label="Filter by sales"
              style={{ width: 150 }}
            >
              {salesOwnerList.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Sales' : s}
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
                { title: 'Quotation No.' },
                { title: 'Customer' },
                { title: 'Subject' },
                { title: 'Value (incl. tax)' },
                { title: 'Status' },
                { title: 'Expiry' },
                { title: 'Sales' },
                { title: 'Actions' },
              ]}
            >
              {paginatedQuotations.map((qt) => {
                const { grand } = calcQuotationTotals(qt.items, qt.tax_pct)
                const isExpired =
                  qt.status !== 'Approved' &&
                  qt.status !== 'Rejected' &&
                  new Date(qt.expiry_date) < new Date()
                return (
                  <tr key={qt.quotation_no}>
                    <td>
                      <div className="lh-1">
                        <div
                          className="fw-semibold text-primary"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelected(qt)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && setSelected(qt)
                          }
                        >
                          {qt.quotation_no}
                        </div>
                        <div className="text-muted fs-12">{qt.issued_date}</div>
                      </div>
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <div className="lh-1">
                        <div
                          className="fw-medium text-truncate"
                          style={{ maxWidth: 200 }}
                        >
                          {qt.customer_company}
                        </div>
                        <div
                          className="text-muted fs-12 text-truncate"
                          style={{ maxWidth: 200 }}
                        >
                          {qt.customer_name}
                        </div>
                      </div>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <div
                        className="text-truncate"
                        style={{ maxWidth: 260 }}
                        title={qt.subject}
                      >
                        {qt.subject}
                      </div>
                      <div className="text-muted fs-12">
                        {qt.items.length} item(s)
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold">
                        {currency.format(grand)}
                      </div>
                    </td>
                    <td>
                      <SpkBadge
                        variant=""
                        Customclass={`badge bg-${STATUS_BADGE[qt.status]}`}
                      >
                        {qt.status}
                      </SpkBadge>
                      {isExpired && (
                        <span className="badge bg-danger-transparent ms-1 fs-10">
                          Overdue
                        </span>
                      )}
                    </td>
                    <td>
                      <div
                        className={`fs-13 ${isExpired ? 'text-danger fw-semibold' : ''}`}
                      >
                        {qt.expiry_date}
                      </div>
                    </td>
                    <td>{qt.sales_owner}</td>
                    <td>
                      <SpkDropdown
                        Togglevariant=""
                        Icon={true}
                        Customtoggleclass="btn btn-icon btn-sm btn-light border no-caret"
                        IconClass="fe fe-more-vertical"
                      >
                        <Dropdown.Item as="li" onClick={() => setSelected(qt)}>
                          <i className="ri-eye-line me-2"></i>View Detail
                        </Dropdown.Item>
                        <Dropdown.Item
                          as="li"
                          onClick={() => setPreviewTarget(qt)}
                        >
                          <i className="ri-file-text-line me-2"></i>Preview PDF
                        </Dropdown.Item>
                        <Dropdown.Item
                          as="li"
                          onClick={() => openEditModal(qt)}
                        >
                          <i className="ri-pencil-line me-2"></i>Edit
                        </Dropdown.Item>
                        <Dropdown.Item
                          as="li"
                          onClick={() => handleDuplicate(qt)}
                        >
                          <i className="ri-file-copy-line me-2"></i>Duplicate
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        {qt.status === 'Draft' && (
                          <Dropdown.Item
                            as="li"
                            className="text-info"
                            onClick={() => handleStatusChange(qt, 'Sent')}
                          >
                            <i className="ri-send-plane-line me-2"></i>Mark as
                            Sent
                          </Dropdown.Item>
                        )}
                        {qt.status === 'Sent' && (
                          <>
                            <Dropdown.Item
                              as="li"
                              className="text-success"
                              onClick={() => handleStatusChange(qt, 'Approved')}
                            >
                              <i className="ri-check-double-line me-2"></i>Mark
                              as Approved
                            </Dropdown.Item>
                            <Dropdown.Item
                              as="li"
                              className="text-danger"
                              onClick={() => handleStatusChange(qt, 'Rejected')}
                            >
                              <i className="ri-close-circle-line me-2"></i>Mark
                              as Rejected
                            </Dropdown.Item>
                          </>
                        )}
                      </SpkDropdown>
                    </td>
                  </tr>
                )
              })}
              {paginatedQuotations.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No quotations found.
                  </td>
                </tr>
              )}
            </SpkTables>
          </div>
        </Card.Body>

        <div className="card-footer border-top-0">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <div>
              Showing{' '}
              <span className="fw-semibold">
                {filtered.length === 0 ? 0 : pageStart + 1}–
                {Math.min(pageStart + pageSize, filtered.length)}
              </span>{' '}
              of <span className="fw-semibold">{filtered.length}</span> filtered
              from <span className="fw-semibold">{quotations.length}</span>
            </div>
            <div className="ms-auto">
              <nav
                aria-label="Quotation pagination"
                className="pagination-style-2"
              >
                <Pagination className="mb-0 flex-wrap">
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Pagination.Prev>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    ),
                  )}
                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
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

      {/* ── Detail Offcanvas ─────────────────────────────────────────────────── */}
      <Offcanvas
        placement="end"
        show={!!selected}
        onHide={() => setSelected(null)}
        style={{ width: 520 }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Quotation Detail</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selected && (
            <div className="d-flex flex-column gap-3">
              {/* Header info */}
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div>
                  <div className="fw-semibold fs-16">
                    {selected.quotation_no}
                  </div>
                  <div className="text-muted fs-12">
                    {selected.issued_date} → {selected.expiry_date}
                  </div>
                </div>
                <SpkBadge
                  variant=""
                  Customclass={`badge bg-${STATUS_BADGE[selected.status]}`}
                >
                  {selected.status}
                </SpkBadge>
              </div>

              {/* Customer & Sales */}
              <Card className="custom-card mb-0">
                <Card.Body className="p-3">
                  <div className="fs-12 text-muted fw-semibold mb-2 text-uppercase">
                    Customer
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Company</span>
                      <span className="fw-medium">
                        {selected.customer_company}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Contact</span>
                      <span className="fw-medium">
                        {selected.customer_name}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Email</span>
                      <span className="fw-medium">
                        {selected.customer_email}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Sales Owner</span>
                      <span className="fw-medium">{selected.sales_owner}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Subject & notes */}
              <Card className="custom-card mb-0">
                <Card.Body className="p-3">
                  <div className="fs-12 text-muted fw-semibold mb-2 text-uppercase">
                    Subject
                  </div>
                  <div className="fw-medium mb-2">{selected.subject}</div>
                  {selected.notes && (
                    <div className="text-muted fs-12 border-top pt-2">
                      {selected.notes}
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Line items */}
              <Card className="custom-card mb-0">
                <Card.Body className="p-3">
                  <div className="fs-12 text-muted fw-semibold mb-2 text-uppercase">
                    Line Items
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {selected.items.map((it, idx) => {
                      const sub = calcLineSubtotal(it)
                      return (
                        <div key={it.id} className="border rounded p-2">
                          <div className="d-flex align-items-start justify-content-between gap-1">
                            <div>
                              <div className="fw-medium fs-13">
                                {it.product_name}
                              </div>
                              <div className="text-muted fs-11">
                                {it.product_sku}
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="fw-semibold fs-13">
                                {currency.format(sub)}
                              </div>
                              <div className="text-muted fs-11">
                                {it.qty} × {currency.format(it.unit_price)}
                                {it.discount_pct > 0 &&
                                  ` − ${it.discount_pct}%`}
                              </div>
                            </div>
                          </div>
                          {it.description && (
                            <div
                              className="text-muted fs-11 mt-1 font-monospace"
                              style={{ whiteSpace: 'pre-wrap' }}
                            >
                              {it.description}
                            </div>
                          )}
                          {it.note && (
                            <div className="text-danger fs-11 mt-1 fst-italic">
                              {it.note}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Card.Body>
              </Card>

              {/* Totals */}
              <Card className="custom-card mb-0">
                <Card.Body className="p-3">
                  {(() => {
                    const { subtotal, tax, grand } = calcQuotationTotals(
                      selected.items,
                      selected.tax_pct,
                    )
                    return (
                      <div className="d-flex flex-column gap-1">
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Subtotal</span>
                          <span className="fw-medium">
                            {currency.format(subtotal)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">
                            PPN {selected.tax_pct}%
                          </span>
                          <span className="fw-medium">
                            {currency.format(tax)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between border-top pt-2 mt-1">
                          <span className="fw-semibold">Grand Total</span>
                          <span className="fw-bold text-primary">
                            {currency.format(grand)}
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                </Card.Body>
              </Card>

              {/* Terms */}
              {selected.terms && (
                <Card className="custom-card mb-0">
                  <Card.Body className="p-3">
                    <div className="fs-12 text-muted fw-semibold mb-1 text-uppercase">
                      Terms & Conditions
                    </div>
                    <div className="text-muted fs-12">{selected.terms}</div>
                  </Card.Body>
                </Card>
              )}

              {/* Actions */}
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant="primary"
                  className="btn-wave flex-fill"
                  onClick={() => openEditModal(selected)}
                >
                  <i className="ri-pencil-line me-2"></i>Edit
                </Button>
                <Button
                  variant="outline-secondary"
                  className="btn-wave flex-fill"
                  onClick={() => {
                    setPreviewTarget(selected)
                    setSelected(null)
                  }}
                >
                  <i className="ri-file-text-line me-2"></i>Preview
                </Button>
                <Button
                  variant="outline-light"
                  className="btn-wave flex-fill"
                  onClick={() => {
                    handleDuplicate(selected)
                    setSelected(null)
                  }}
                >
                  <i className="ri-file-copy-line me-2"></i>Duplicate
                </Button>
              </div>

              {/* Quick status change */}
              {(selected.status === 'Draft' || selected.status === 'Sent') && (
                <div className="d-flex gap-2">
                  {selected.status === 'Draft' && (
                    <Button
                      variant="info"
                      size="sm"
                      className="btn-wave flex-fill"
                      onClick={() => handleStatusChange(selected, 'Sent')}
                    >
                      <i className="ri-send-plane-line me-1"></i>Mark as Sent
                    </Button>
                  )}
                  {selected.status === 'Sent' && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        className="btn-wave flex-fill"
                        onClick={() => handleStatusChange(selected, 'Approved')}
                      >
                        <i className="ri-check-double-line me-1"></i>Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="btn-wave flex-fill"
                        onClick={() => handleStatusChange(selected, 'Rejected')}
                      >
                        <i className="ri-close-circle-line me-1"></i>Reject
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editTarget ? `Edit ${editTarget.quotation_no}` : 'New Quotation'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              {/* Left column: customer + meta */}
              <Col lg={5}>
                <div className="d-flex flex-column gap-3">
                  {/* Customer */}
                  <Form.Group>
                    <Form.Label>
                      Customer <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={form.customer_id}
                      onChange={(e) => pickCustomer(e.target.value)}
                      isInvalid={!!formErrors.customer_id}
                    >
                      <option value="">— Select Customer —</option>
                      {dbCustomers.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.company} ({c.name})
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.customer_id}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Sales owner */}
                  <Form.Group>
                    <Form.Label>Sales Owner</Form.Label>
                    <Form.Select
                      value={form.sales_owner}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sales_owner: e.target.value }))
                      }
                    >
                      <option value="">— Select Sales —</option>
                      {SALES_LIST.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Subject */}
                  <Form.Group>
                    <Form.Label>
                      Subject / Title <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      value={form.subject}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, subject: e.target.value }))
                      }
                      placeholder="e.g. Supply of Power Meters – Project Name"
                      isInvalid={!!formErrors.subject}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.subject}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Date + validity */}
                  <Row className="g-2">
                    <Col>
                      <Form.Group>
                        <Form.Label>Issued Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={form.issued_date}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              issued_date: e.target.value,
                            }))
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label>Valid For</Form.Label>
                        <Form.Select
                          value={form.validity_days}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              validity_days: e.target
                                .value as QuotationValidity,
                            }))
                          }
                        >
                          <option value="7">7 days</option>
                          <option value="14">14 days</option>
                          <option value="30">30 days</option>
                          <option value="45">45 days</option>
                          <option value="60">60 days</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Status */}
                  <Row className="g-2">
                    <Col>
                      <Form.Group>
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          value={form.status}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              status: e.target.value as QuotationStatus,
                            }))
                          }
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label>PPN (%)</Form.Label>
                        <Form.Control
                          type="number"
                          min={0}
                          max={100}
                          value={form.tax_pct}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, tax_pct: e.target.value }))
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Notes */}
                  <Form.Group>
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={form.notes}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      placeholder="Internal notes or customer-facing remarks..."
                    />
                  </Form.Group>

                  {/* Terms */}
                  <Form.Group>
                    <Form.Label>Terms & Conditions</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={form.terms}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, terms: e.target.value }))
                      }
                    />
                  </Form.Group>
                </div>
              </Col>

              {/* Right column: line items */}
              <Col lg={7}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <Form.Label className="mb-0 fw-semibold">
                    Line Items <span className="text-danger">*</span>
                  </Form.Label>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="btn-wave"
                    onClick={addLine}
                  >
                    <i className="ri-add-line me-1"></i>Add Item
                  </Button>
                </div>

                {formErrors.items && (
                  <div className="text-danger fs-12 mb-2">
                    {formErrors.items}
                  </div>
                )}

                <div
                  className="d-flex flex-column gap-2"
                  style={{ maxHeight: 420, overflowY: 'auto' }}
                >
                  {form.items.map((it, idx) => {
                    const sub = calcLineSubtotal(it)
                    const matchedProduct = dbProducts.find(
                      (p) => p.sku === it.product_sku,
                    )
                    return (
                      <Card key={it.id} className="custom-card mb-0 border">
                        <Card.Body className="p-2">
                          <Row className="g-2 align-items-end">
                            <Col xs={12}>
                              <Form.Label className="mb-1 fs-12 text-muted">
                                Item #{idx + 1}
                              </Form.Label>
                              <Form.Select
                                value={it.product_sku}
                                onChange={(e) =>
                                  pickProduct(it.id, e.target.value)
                                }
                                size="sm"
                              >
                                <option value="">— Select Product —</option>
                                {dbProducts.map((p) => (
                                  <option key={p.sku} value={p.sku}>
                                    [{p.sku}] {p.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Col>
                            <Col xs={12}>
                              <Form.Label className="mb-1 fs-12 text-muted">
                                Description
                              </Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={4}
                                size="sm"
                                placeholder="Edit description..."
                                value={it.description || ''}
                                onChange={(e) =>
                                  updateLine(it.id, {
                                    description: e.target.value,
                                  })
                                }
                              />
                            </Col>
                            <Col xs={4}>
                              <Form.Label className="mb-1 fs-12 text-muted">
                                Qty
                              </Form.Label>
                              <Form.Control
                                type="number"
                                size="sm"
                                min={1}
                                value={it.qty}
                                onChange={(e) =>
                                  updateLine(it.id, {
                                    qty: Number(e.target.value) || 1,
                                  })
                                }
                              />
                            </Col>
                            <Col xs={4}>
                              <Form.Label className="mb-1 fs-12 text-muted">
                                Unit Price
                              </Form.Label>
                              <Form.Control
                                type="number"
                                size="sm"
                                min={0}
                                value={it.unit_price}
                                onChange={(e) =>
                                  updateLine(it.id, {
                                    unit_price: Number(e.target.value) || 0,
                                  })
                                }
                              />
                            </Col>
                            <Col xs={4}>
                              <Form.Label className="mb-1 fs-12 text-muted">
                                Disc %
                              </Form.Label>
                              <Form.Control
                                type="number"
                                size="sm"
                                min={0}
                                max={100}
                                value={it.discount_pct}
                                onChange={(e) =>
                                  updateLine(it.id, {
                                    discount_pct: Number(e.target.value) || 0,
                                  })
                                }
                              />
                            </Col>
                            <Col xs={12}>
                              <Form.Control
                                size="sm"
                                placeholder="Line note (optional)"
                                value={it.note}
                                onChange={(e) =>
                                  updateLine(it.id, { note: e.target.value })
                                }
                              />
                            </Col>
                            <Col
                              xs={12}
                              className="d-flex align-items-center justify-content-between"
                            >
                              <span className="fw-semibold text-primary fs-13">
                                {currency.format(sub)}
                              </span>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="btn-icon btn-wave"
                                onClick={() => removeLine(it.id)}
                                title="Remove line"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )
                  })}

                  {form.items.length === 0 && (
                    <div className="text-center text-muted py-4 border rounded">
                      No items yet. Click <strong>Add Item</strong> to start.
                    </div>
                  )}
                </div>

                {/* Summary */}
                {form.items.length > 0 && (
                  <Card className="custom-card mt-3 mb-0">
                    <Card.Body className="p-3">
                      <div className="d-flex flex-column gap-1">
                        <div className="d-flex justify-content-between fs-13">
                          <span className="text-muted">Subtotal</span>
                          <span>{currency.format(formTotals.subtotal)}</span>
                        </div>
                        <div className="d-flex justify-content-between fs-13">
                          <span className="text-muted">
                            PPN {form.tax_pct}%
                          </span>
                          <span>{currency.format(formTotals.tax)}</span>
                        </div>
                        <div className="d-flex justify-content-between border-top pt-2 mt-1">
                          <span className="fw-semibold">Grand Total</span>
                          <span className="fw-bold text-primary fs-15">
                            {currency.format(formTotals.grand)}
                          </span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-light"
              className="btn-wave"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="btn-wave"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="ri-save-line me-2"></i>
                  {editTarget ? 'Update Quotation' : 'Create Quotation'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ── PDF Preview Modal ────────────────────────────────────────────────── */}
      <Modal
        show={!!previewTarget}
        onHide={() => setPreviewTarget(null)}
        size="lg"
        data-bs-theme="light"
      >
        <Modal.Header closeButton className="bg-white text-dark">
          <Modal.Title>
            <i className="ri-file-text-line me-2 text-primary"></i>
            Quotation Preview — {previewTarget?.quotation_no}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-white text-dark">
          {previewTarget &&
            (() => {
              const { subtotal, tax, grand } = calcQuotationTotals(
                previewTarget.items,
                previewTarget.tax_pct,
              )

              // Always light-palette badge — never reads CSS vars
              const statusColors: Record<
                QuotationStatus,
                { bg: string; fg: string }
              > = {
                Draft: { bg: '#f1f5f9', fg: '#475569' },
                Sent: { bg: '#dbeafe', fg: '#1d4ed8' },
                Approved: { bg: '#dcfce7', fg: '#15803d' },
                Rejected: { bg: '#fee2e2', fg: '#b91c1c' },
                Expired: { bg: '#fef9c3', fg: '#92400e' },
              }
              const sc = statusColors[previewTarget.status]

              // Shared text tokens — updated for formal look
              const T = {
                dark: '#000000',
                mid: '#1e293b',
                muted: '#475569',
                faint: '#e23232',
                border: '#000000',
                accent: '#000000',
                bgPaper: '#ffffff',
                bgStripe: '#ffffff',
                bgBillTo: '#ffffff',
                bgTotals: '#e5e7eb',
              }

              const numFormat = new Intl.NumberFormat('id-ID', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })

              const cellStyle = (
                align: 'left' | 'right' = 'left',
              ): React.CSSProperties => ({
                padding: '6px 10px',
                textAlign: align,
                color: '#000',
                borderColor: '#000',
                background: 'transparent',
              })

              return (
                <div id="quotation-preview-root">
                  <div
                    id="quotation-preview-print"
                    style={{
                      fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
                      fontSize: 13,
                      color: T.dark,
                      background: T.bgPaper,
                      borderRadius: 8,
                      padding: '36px 40px',
                    }}
                  >
                    {/* ── Company header (new formal style) ───────────────────── */}
                    {/* Top row: centered company name + logo on right */}
                    <div
                      style={{
                        position: 'relative',
                        marginBottom: 4,
                        textAlign: 'center',
                      }}
                    >
                      {/* Company logo top-right */}
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: -20,
                          width: 80,
                          height: 72,
                        }}
                      >
                        <img
                          src="/aii-ori.png"
                          alt="Company Logo"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                      {/* Company name + title */}
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 17,
                          color: T.dark,
                          letterSpacing: 0.5,
                        }}
                      >
                        PT. AMPTRON INSTRUMINDO
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: T.dark,
                          letterSpacing: 2,
                          marginTop: 2,
                        }}
                      >
                        OFFICIAL QUOTATION
                      </div>
                    </div>

                    {/* ── Info table (To / Attn / Sales / Date etc.) ────────────── */}
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: 12,
                        marginTop: 18,
                        marginBottom: 18,
                        borderTop: `1.5px solid ${T.dark}`,
                        borderBottom: `1.5px solid ${T.dark}`,
                      }}
                    >
                      <tbody>
                        {[
                          {
                            left: {
                              label: 'To',
                              value: previewTarget.customer_company,
                            },
                            right: {
                              label: 'Sales',
                              value: previewTarget.sales_owner,
                            },
                          },
                          {
                            left: {
                              label: 'Attn.',
                              value: previewTarget.customer_name,
                            },
                            right: {
                              label: 'Date',
                              value: previewTarget.issued_date
                                ? new Date(
                                  previewTarget.issued_date,
                                ).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })
                                : '',
                            },
                          },
                          {
                            left: { label: 'CC.', value: '' },
                            right: {
                              label: 'Your Ref No.',
                              value: previewTarget.notes || '',
                            },
                          },
                          {
                            left: { label: 'Tel/Fax', value: '' },
                            right: {
                              label: 'Our Ref No.',
                              value: previewTarget.quotation_no,
                            },
                          },
                          {
                            left: {
                              label: 'Re.',
                              value: previewTarget.subject,
                            },
                            right: { label: 'Pages', value: '1' },
                          },
                        ].map((row, i) => (
                          <tr key={i}>
                            {/* LEFT label */}
                            <td
                              style={{
                                padding: '2px 8px',
                                width: 60,
                                color: T.dark,
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                verticalAlign: 'top',
                              }}
                            >
                              {row.left.label}
                            </td>
                            <td
                              style={{
                                padding: '2px 2px',
                                width: 12,
                                color: T.dark,
                                verticalAlign: 'top',
                              }}
                            >
                              :
                            </td>
                            <td
                              style={{
                                padding: '2px 8px',
                                color: T.dark,
                                verticalAlign: 'top',
                                fontWeight: 600,
                              }}
                            >
                              {row.left.value}
                            </td>
                            {/* RIGHT label */}
                            <td
                              style={{
                                padding: '2px 8px',
                                width: 100,
                                color: T.dark,
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                verticalAlign: 'top',
                              }}
                            >
                              {row.right.label}
                            </td>
                            <td
                              style={{
                                padding: '2px 2px',
                                width: 12,
                                color: T.dark,
                                verticalAlign: 'top',
                              }}
                            >
                              :
                            </td>
                            <td
                              style={{
                                padding: '2px 8px',
                                color: T.dark,
                                verticalAlign: 'top',
                              }}
                            >
                              {row.right.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* ── Intro paragraph ───────────────────────────────────────── */}
                    <div
                      style={{ fontSize: 12, color: T.dark, marginBottom: 18 }}
                    >
                      <div style={{ marginBottom: 4 }}>Dear Sir/Madam,</div>
                      <div>
                        With reference to your inquiry, we are pleased to submit
                        our offer as follows:
                      </div>
                    </div>

                    {/* ── Line items table ─────────────────────────────────────── */}
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: 12,
                        marginBottom: 0,
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: '#f8fafc',
                            borderTop: '1.5px solid #000',
                            borderBottom: '1.5px solid #000',
                          }}
                        >
                          {(
                            [
                              { label: '#', w: 28, align: 'left' },
                              {
                                label: 'Description',
                                w: 'auto',
                                align: 'left',
                              },
                              { label: 'Unit', w: 54, align: 'left' },
                              { label: 'Qty', w: 46, align: 'right' },
                              { label: 'Unit Price', w: 120, align: 'right' },
                              { label: 'Disc', w: 46, align: 'right' },
                              { label: 'Subtotal', w: 130, align: 'right' },
                            ] as {
                              label: string
                              w: number | string
                              align: 'left' | 'right'
                            }[]
                          ).map((h) => (
                            <th
                              key={h.label}
                              style={{
                                width: h.w,
                                textAlign: h.align,
                                padding: '8px 10px',
                                color: '#000',
                                fontWeight: 700,
                                fontSize: 11,
                                background: 'transparent',
                              }}
                            >
                              {h.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewTarget.items.map((it, idx) => (
                          <tr
                            key={it.id}
                            style={{
                              background:
                                idx % 2 === 0 ? '#ffffff' : T.bgStripe,
                              borderBottom: `1px solid ${T.border}`,
                            }}
                          >
                            <td
                              style={{
                                ...cellStyle(),
                                color: T.muted,
                                verticalAlign: 'top',
                              }}
                            >
                              {idx + 1}
                            </td>
                            <td
                              style={{ ...cellStyle(), verticalAlign: 'top' }}
                            >
                              <div style={{ fontWeight: 600, color: T.dark }}>
                                {it.product_name}
                              </div>
                              {it.description && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: T.muted,
                                    marginTop: 4,
                                    whiteSpace: 'pre-wrap',
                                  }}
                                >
                                  {it.description}
                                </div>
                              )}
                              {it.note && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: T.faint,
                                    marginTop: 2,
                                    fontStyle: 'italic',
                                  }}
                                >
                                  {it.note}
                                </div>
                              )}
                            </td>
                            <td
                              style={{
                                ...cellStyle(),
                                color: T.muted,
                                verticalAlign: 'top',
                              }}
                            >
                              {it.unit}
                            </td>
                            <td
                              style={{
                                ...cellStyle('right'),
                                verticalAlign: 'top',
                              }}
                            >
                              {it.qty}
                            </td>
                            <td
                              style={{
                                ...cellStyle('right'),
                                verticalAlign: 'top',
                              }}
                            >
                              {numFormat.format(it.unit_price)}
                            </td>
                            <td
                              style={{
                                ...cellStyle('right'),
                                color: it.discount_pct > 0 ? '#059669' : '#000',
                                verticalAlign: 'top',
                              }}
                            >
                              {it.discount_pct > 0
                                ? `−${it.discount_pct}%`
                                : '—'}
                            </td>
                            <td
                              style={{
                                ...cellStyle('right'),
                                fontWeight: 600,
                                verticalAlign: 'top',
                              }}
                            >
                              {numFormat.format(calcLineSubtotal(it))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} style={{ padding: 0 }}></td>
                          <td
                            colSpan={2}
                            style={{
                              ...cellStyle('right'),
                              fontWeight: 700,
                              borderTop: '1.5px solid #000',
                            }}
                          >
                            Sub-Total
                          </td>
                          <td
                            style={{
                              ...cellStyle('right'),
                              fontWeight: 600,
                              borderTop: '1.5px solid #000',
                            }}
                          >
                            {numFormat.format(subtotal)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={4} style={{ padding: 0 }}></td>
                          <td
                            colSpan={2}
                            style={{ ...cellStyle('right'), fontWeight: 700 }}
                          >
                            PPN {previewTarget.tax_pct}%
                          </td>
                          <td
                            style={{ ...cellStyle('right'), fontWeight: 600 }}
                          >
                            {numFormat.format(tax)}
                          </td>
                        </tr>
                        <tr style={{ background: '#e5e7eb' }}>
                          <td colSpan={4} style={{ padding: 0 }}></td>
                          <td
                            colSpan={2}
                            style={{
                              ...cellStyle('right'),
                              fontWeight: 700,
                              borderTop: '1.5px solid #000',
                              borderBottom: '1.5px solid #000',
                            }}
                          >
                            Total
                          </td>
                          <td
                            style={{
                              ...cellStyle('right'),
                              fontWeight: 700,
                              borderTop: '1.5px solid #000',
                              borderBottom: '1.5px solid #000',
                            }}
                          >
                            {numFormat.format(grand)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>

                    {/* ── Terms & Conditions & Signature section ──────────────── */}
                    <div style={{ display: 'flex', marginTop: 32, gap: 40 }}>
                      {/* Left side: Conditions */}
                      <div style={{ flex: 1, fontSize: 11 }}>
                        <table
                          style={{
                            borderCollapse: 'collapse',
                            marginBottom: 20,
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ width: 80, padding: '2px 0' }}>
                                Prices
                              </td>
                              <td style={{ padding: '2px 0' }}>
                                : Loco Jakarta
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: '2px 0' }}>Payment</td>
                              <td style={{ padding: '2px 0' }}>
                                : Cash Before Delivery
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: '2px 0' }}>Lead Time</td>
                              <td style={{ padding: '2px 0' }}>
                                : 3-5 working days after payment received
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: '2px 0' }}>Validity</td>
                              <td style={{ padding: '2px 0' }}>
                                : {previewTarget.validity_days} Days
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <div
                          style={{
                            fontWeight: 700,
                            textDecoration: 'underline',
                            marginBottom: 4,
                          }}
                        >
                          Other Sales Conditions:
                        </div>
                        <ol style={{ paddingLeft: 18, margin: 0 }}>
                          <li>
                            Standard 12 month limited hardware warranty against
                            manufacturing defects &amp; poor workmanship
                          </li>
                          <li>
                            Price is for supply &amp; delivery of parts only
                            unless otherwise stated
                          </li>
                          <li>
                            No order cancellations are allowed for any reason
                            after order has been placed
                          </li>
                        </ol>
                      </div>

                      {/* Right side: Message & Signature placeholder */}
                      <div style={{ width: 300, fontSize: 11 }}>
                        <p>
                          Hope you will find this offer is in compliance with
                          your requirement.
                        </p>
                        <p>
                          Should you need any further clarification and/or
                          information, please do not hesitate to contact us.
                        </p>
                        <p style={{ marginTop: 20 }}>Your faithfully,</p>

                        <div style={{ marginTop: 40, textAlign: 'center' }}>
                          <div
                            style={{
                              fontStyle: 'italic',
                              textDecoration: 'underline',
                              fontWeight: 700,
                              marginBottom: 15,
                            }}
                          >
                            - computer generated, no signature required -
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 12 }}>
                            {previewTarget.sales_owner.toUpperCase()} -
                            0818830818
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Document footer ─────────────────────────────────────── */}
                    <div
                      style={{
                        marginTop: 40,
                        borderTop: '1px solid #000',
                        paddingTop: 10,
                        textAlign: 'center',
                        fontSize: 10,
                        fontWeight: 600,
                        lineHeight: 1.5,
                        color: '#000',
                      }}
                    >
                      <div>
                        Komplek Rukan Taman Meruya Blok N 15 - 16, Meruya Utara,
                        Kembangan, Jakarta Barat 11620, INDONESIA
                      </div>
                      <div>T: (+62-21) 585 5055, 586 0826, 586 0828</div>
                      <div>
                        Email: bisnis@amptron-indo.com &nbsp;&nbsp; Website :
                        www.amptron-indo.com
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-light"
            className="btn-wave"
            onClick={() => setPreviewTarget(null)}
          >
            Close
          </Button>
          <Button variant="primary" className="btn-wave" onClick={handlePrint}>
            <i className="ri-printer-line me-2"></i>Print / Save PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}

export default QuotationPage
