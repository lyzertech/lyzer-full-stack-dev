'use client'

import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons'
import SpkDropdown from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import {
  aggregateStatusCounts,
  prospekYesPercent,
  salesTeamFromRows,
  type VisitReportAiiRow,
  type VisitReportStatus,
} from '@/shared/data/sales/visitReportAiiSample'
import Link from 'next/link'
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Card,
  Col,
  Dropdown,
  Form,
  Modal,
  Nav,
  Pagination,
  Row,
  Tab,
} from 'react-bootstrap'

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_ORDER: VisitReportStatus[] = [
  'Completed',
  'Checked',
  'Reviewed',
  'Submitted',
  'Planned',
  'Cancelled',
]

const statusBadgeClass: Record<VisitReportStatus, string> = {
  Completed: 'success-transparent',
  Checked: 'danger-transparent',
  Reviewed: 'warning-transparent',
  Submitted: 'primary-transparent',
  Planned: 'info-transparent',
  Cancelled: 'light text-muted',
}

const statusDotClass: Record<VisitReportStatus, string> = {
  Completed: 'success',
  Checked: 'danger',
  Reviewed: 'warning',
  Submitted: 'primary',
  Planned: 'info',
  Cancelled: 'secondary',
}

const prospekBadgeClass: Record<string, string> = {
  Yes: 'success-transparent',
  No: 'danger-transparent',
  Unknown: 'light text-muted',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseVisitDate(iso: string): Date {
  return new Date(iso.replace(' ', 'T'))
}

function salesInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function getPaginationItems(
  current: number,
  total: number,
): (number | 'ellipsis')[] {
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const items: (number | 'ellipsis')[] = []
  const showLeft = current <= 4
  const showRight = current >= total - 3

  if (showLeft) {
    for (let i = 1; i <= Math.min(5, total); i++) items.push(i)
    if (total > 5) {
      items.push('ellipsis', total)
    }
  } else if (showRight) {
    items.push(1, 'ellipsis')
    for (let i = total - 4; i <= total; i++) items.push(i)
  } else {
    items.push(
      1,
      'ellipsis',
      current - 1,
      current,
      current + 1,
      'ellipsis',
      total,
    )
  }
  return items
}

// ─── Modal form shape (mirrors migration columns) ─────────────────────────────

interface VisitReportForm {
  customer_name: string
  sales: string
  office: 'AII' | 'SEP'
  location: string
  contact_person: string
  visit_date: string
  visit_time: string
  purpose: string
}

const EMPTY_FORM: VisitReportForm = {
  customer_name: '',
  sales: '',
  office: 'AII',
  location: '',
  contact_person: '',
  visit_date: '',
  visit_time: '',
  purpose: '',
}

const SALES_OPTIONS = ['David', 'Vicha', 'Heri Go', 'Dika'] as const

const COMPANY_OPTIONS = [
  'Schneider Electric Indonesia, PT',
  'Yokogawa Indonesia, PT',
  'Enindo Orbitama, PT',
  'Intimuara Electrindo, PT',
  'Enercon Indonesia, PT',
  'ABB Sakti Industri, PT',
  'Siemens Indonesia, PT',
  'Honeywell Indonesia, PT',
] as const

const CONTACT_OPTIONS = [
  'Alam Wiguna',
  'Joko Susanto',
  'Ardian Asril',
  'Rifan',
  'Oki',
  'Ari Wibowo',
  'Budi Hartono',
  'Sari Wulandari',
] as const

// 08:00 – 17:00 in 30-minute steps
const VISIT_TIME_OPTIONS: string[] = Array.from({ length: 19 }, (_, i) => {
  const totalMins = 8 * 60 + i * 30
  const h = String(Math.floor(totalMins / 60)).padStart(2, '0')
  const m = String(totalMins % 60).padStart(2, '0')
  return `${h}:${m}`
})

// ─── Main component ───────────────────────────────────────────────────────────

const VisitReportAiiPage: React.FC = () => {
  const pageSizeOptions = [7, 10, 25, 50]
  const [visitRows, setVisitRows] = useState<VisitReportAiiRow[]>([])
  const [pageSize, setPageSize] = useState(7)
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filterTab, setFilterTab] = useState<'custom' | 'quick'>('custom')

  const [yearFrom, setYearFrom] = useState<string>('All')
  const [yearTo, setYearTo] = useState<string>('All')
  const [monthFrom, setMonthFrom] = useState<string>('All')
  const [monthTo, setMonthTo] = useState<string>('All')
  const [salesName, setSalesName] = useState<string>('All')

  const [applied, setApplied] = useState({
    yearFrom: 'All',
    yearTo: 'All',
    monthFrom: 'All',
    monthTo: 'All',
    salesName: 'All',
  })

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<VisitReportForm>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof VisitReportForm, string>>
  >({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  const salesOptions = useMemo(
    () => ['All', 'David', 'Vicha', 'Heri Go', 'Dika'],
    [],
  )

  const yearOptions = ['All', '2024', '2025', '2026']
  const monthOptions = [
    'All',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
  ]

  useEffect(() => {
    let isMounted = true

    const loadVisitReports = async () => {
      try {
        const res = await fetch('/api/sales/visit-reports', {
          cache: 'no-store',
        })
        if (!res.ok) return
        const data = await res.json()
        if (isMounted && Array.isArray(data)) {
          setVisitRows(data as VisitReportAiiRow[])
        }
      } catch (error) {
        console.error('Failed to load visit reports:', error)
      }
    }

    loadVisitReports()
    return () => {
      isMounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return visitRows.filter((row) => {
      const matchQuery =
        q.length === 0 ||
        [
          row.idVisitReport,
          row.sales,
          row.company,
          row.contactPerson,
          row.meetingPoint,
          row.purpose,
          row.status,
          row.prospek,
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)

      if (!matchQuery) return false

      if (applied.salesName !== 'All' && row.sales !== applied.salesName) {
        return false
      }

      const d = parseVisitDate(row.visitDateTime)
      const y = d.getFullYear()
      const m = d.getMonth() + 1

      if (applied.yearFrom !== 'All' && y < Number(applied.yearFrom)) {
        return false
      }
      if (applied.yearTo !== 'All' && y > Number(applied.yearTo)) {
        return false
      }
      if (applied.monthFrom !== 'All' && m < Number(applied.monthFrom)) {
        return false
      }
      if (applied.monthTo !== 'All' && m > Number(applied.monthTo)) {
        return false
      }

      return true
    })
  }, [query, applied, visitRows])

  const sortedRows = useMemo(() => {
    return [...filtered].sort(
      (a, b) =>
        parseVisitDate(b.visitDateTime).getTime() -
        parseVisitDate(a.visitDateTime).getTime(),
    )
  }, [filtered])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const pageRows = sortedRows.slice(pageStart, pageEnd)

  useEffect(() => {
    setCurrentPage(1)
  }, [query, applied, pageSize])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const statusCounts = useMemo(
    () => aggregateStatusCounts(filtered),
    [filtered],
  )

  const team = useMemo(() => salesTeamFromRows(filtered), [filtered])
  const prospekPct = useMemo(() => prospekYesPercent(filtered), [filtered])

  const applyFilters = () => {
    setApplied({
      yearFrom,
      yearTo,
      monthFrom,
      monthTo,
      salesName,
    })
  }

  const applyQuick = (preset: 'month' | 'q1' | 'year') => {
    setFilterTab('quick')
    if (preset === 'month') {
      setYearFrom('2026')
      setYearTo('2026')
      setMonthFrom('4')
      setMonthTo('4')
      setApplied({
        yearFrom: '2026',
        yearTo: '2026',
        monthFrom: '4',
        monthTo: '4',
        salesName,
      })
    } else if (preset === 'q1') {
      setYearFrom('2026')
      setYearTo('2026')
      setMonthFrom('1')
      setMonthTo('3')
      setApplied({
        yearFrom: '2026',
        yearTo: '2026',
        monthFrom: '1',
        monthTo: '3',
        salesName,
      })
    } else {
      setYearFrom('2026')
      setYearTo('2026')
      setMonthFrom('All')
      setMonthTo('All')
      setApplied({
        yearFrom: '2026',
        yearTo: '2026',
        monthFrom: 'All',
        monthTo: 'All',
        salesName,
      })
    }
  }

  // ─── Modal helpers ──────────────────────────────────────────────────────────

  const openModal = () => {
    setForm(EMPTY_FORM)
    setFormErrors({})
    setSubmitError(null)
    setShowModal(true)
    // focus first input after modal animates in
    setTimeout(() => firstInputRef.current?.focus(), 300)
  }

  const closeModal = () => {
    if (submitting) return
    setShowModal(false)
  }

  const setField = useCallback(
    <K extends keyof VisitReportForm>(key: K, value: VisitReportForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
      setFormErrors((prev) => ({ ...prev, [key]: undefined }))
    },
    [],
  )

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof VisitReportForm, string>> = {}
    if (!form.customer_name.trim())
      errors.customer_name = 'Customer name is required.'
    if (!form.sales.trim()) errors.sales = 'Sales name is required.'
    if (!form.visit_date) errors.visit_date = 'Visit date is required.'
    if (!form.purpose.trim()) errors.purpose = 'Purpose is required.'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        sales: form.sales.trim(),
        office: form.office,
        location: form.location.trim() || null,
        contact_person: form.contact_person || null,
        visit_date: form.visit_date || null,
        visit_time: form.visit_time ? `${form.visit_time}:00` : null,
        purpose: form.purpose.trim() || null,
      }

      const res = await fetch('/api/sales/visit-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) {
        const detail =
          typeof json?.message === 'string'
            ? json.message
            : typeof json?.error === 'string'
              ? json.error
              : 'Failed to create visit report.'
        setSubmitError(detail)
        return
      }

      // Prepend to local state so it appears immediately at the top
      if (json?.data) {
        setVisitRows((prev) => [json.data as VisitReportAiiRow, ...prev])
      }

      setShowModal(false)
    } catch (err) {
      console.error(err)
      setSubmitError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <Fragment>
      <div className="d-flex align-items-center justify-content-between mb-3 page-header-breadcrumb flex-wrap gap-2">
        <div>
          <h1 className="page-title fw-medium fs-20 mb-0">
            Sales Visit Report — AII
          </h1>
          <div className="text-muted fs-12 mt-1">
            Track field visits, follow-ups, and pipeline health for the AII
            office.
          </div>
        </div>
      </div>

      <Row className="gy-3 mb-3">
        <Col xxl={5} lg={6}>
          <Card className="custom-card h-100">
            <Card.Header className="py-2">
              <div className="card-title mb-0 fs-14">Sales Visit Report</div>
            </Card.Header>
            <Card.Body className="py-3">
              <div className="d-flex flex-column gap-3">
                {team.map((m) => (
                  <div
                    key={m.name}
                    className="d-flex align-items-center justify-content-between gap-2"
                  >
                    <div className="d-flex align-items-center gap-2 min-w-0">
                      <span
                        className={`avatar avatar-md avatar-rounded bg-${m.colorClass}-transparent`}
                      >
                        {salesInitials(m.name)}
                      </span>
                      <span className="fw-medium text-truncate">{m.name}</span>
                    </div>
                    <span className="fw-semibold text-primary">
                      {m.visitCount}
                    </span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xxl={4} lg={6}>
          <Row className="g-2 h-100">
            <Col sm={6}>
              <Card className="custom-card h-100">
                <Card.Body className="py-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted fs-12">Total Visit Report</div>
                      <div className="fs-22 fw-semibold">{filtered.length}</div>
                    </div>
                    <span className="avatar avatar-lg bg-primary-transparent">
                      <i className="ri-macbook-line fs-22"></i>
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6}>
              <Card className="custom-card h-100">
                <Card.Body className="py-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted fs-12">Prospek Results</div>
                      <div className="fs-22 fw-semibold text-success">
                        {prospekPct}%
                      </div>
                    </div>
                    <span className="avatar avatar-lg bg-success-transparent">
                      <i className="ri-pie-chart-2-line fs-22"></i>
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12}>
              <Card className="custom-card mb-0">
                <Card.Body className="py-3">
                  <div className="text-muted fs-12 mb-2">
                    Status distribution
                  </div>
                  <div className="d-flex flex-wrap gap-2 justify-content-between">
                    {STATUS_ORDER.map((st) => (
                      <div
                        key={st}
                        className="text-center px-1"
                        style={{ minWidth: 72 }}
                      >
                        <div
                          className={`rounded-circle mx-auto mb-1 d-flex align-items-center justify-content-center bg-${statusDotClass[st]}-transparent`}
                          style={{ width: 44, height: 44 }}
                        >
                          <span
                            className={`fw-semibold text-${statusDotClass[st]}`}
                          >
                            {statusCounts[st]}
                          </span>
                        </div>
                        <div className="fs-11 text-muted text-truncate">
                          {st}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col xxl={3}>
          <Card className="custom-card h-100">
            <Card.Header className="py-2 border-bottom-0 pb-0">
              <Tab.Container
                activeKey={filterTab}
                onSelect={(k) =>
                  setFilterTab((k as 'custom' | 'quick') ?? 'custom')
                }
              >
                <Nav variant="pills" className="nav-pills-primary mb-2 fs-12">
                  <Nav.Item>
                    <Nav.Link
                      eventKey="custom"
                      onClick={() => setFilterTab('custom')}
                    >
                      Custom
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="quick"
                      onClick={() => setFilterTab('quick')}
                    >
                      Quick filters
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Tab.Container>
            </Card.Header>
            <Card.Body className="pt-0">
              {filterTab === 'custom' ? (
                <div className="d-flex flex-column gap-2">
                  <Row className="g-2">
                    <Col xs={6}>
                      <Form.Label className="fs-11 text-muted mb-1">
                        Year From
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        value={yearFrom}
                        onChange={(e) => setYearFrom(e.target.value)}
                      >
                        {yearOptions.map((y) => (
                          <option key={y} value={y}>
                            {y === 'All' ? 'All' : y}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col xs={6}>
                      <Form.Label className="fs-11 text-muted mb-1">
                        Year To
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        value={yearTo}
                        onChange={(e) => setYearTo(e.target.value)}
                      >
                        {yearOptions.map((y) => (
                          <option key={`to-${y}`} value={y}>
                            {y === 'All' ? 'All' : y}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col xs={6}>
                      <Form.Label className="fs-11 text-muted mb-1">
                        Month From
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        value={monthFrom}
                        onChange={(e) => setMonthFrom(e.target.value)}
                      >
                        {monthOptions.map((m) => (
                          <option key={m} value={m}>
                            {m === 'All' ? 'All' : m}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col xs={6}>
                      <Form.Label className="fs-11 text-muted mb-1">
                        Month To
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        value={monthTo}
                        onChange={(e) => setMonthTo(e.target.value)}
                      >
                        {monthOptions.map((m) => (
                          <option key={`mto-${m}`} value={m}>
                            {m === 'All' ? 'All' : m}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                  <div>
                    <Form.Label className="fs-11 text-muted mb-1">
                      Sales name
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      value={salesName}
                      onChange={(e) => setSalesName(e.target.value)}
                    >
                      {salesOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  <SpkButton
                    Buttonvariant="primary"
                    Customclass="btn btn-wave w-100"
                    onClickfunc={applyFilters}
                  >
                    Apply filter
                  </SpkButton>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  <div className="text-muted fs-12">
                    Preset ranges for the AII sample dataset (2026).
                  </div>
                  <SpkButton
                    Buttonvariant="outline-primary"
                    Customclass="btn btn-wave"
                    onClickfunc={() => applyQuick('month')}
                  >
                    This month (Apr 2026)
                  </SpkButton>
                  <SpkButton
                    Buttonvariant="outline-primary"
                    Customclass="btn btn-wave"
                    onClickfunc={() => applyQuick('q1')}
                  >
                    Q1 2026
                  </SpkButton>
                  <SpkButton
                    Buttonvariant="outline-primary"
                    Customclass="btn btn-wave"
                    onClickfunc={() => applyQuick('year')}
                  >
                    Full year 2026
                  </SpkButton>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Main table card ── */}
      <Card className="custom-card overflow-hidden">
        <Card.Header className="justify-content-between flex-wrap gap-2">
          <div className="card-title mb-0">Visit Report</div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <SpkDropdown
              Togglevariant=""
              Toggletext="Export"
              Arrowicon={true}
              IconClass="ri-arrow-down-s-line align-middle ms-1 d-inline-block"
              Customtoggleclass="btn btn-primary-light btn-wave no-caret"
            >
              <Dropdown.Item as="li" href="#!">
                <i className="ri-file-excel-2-line me-2"></i>Excel
              </Dropdown.Item>
              <Dropdown.Item as="li" href="#!">
                <i className="ri-file-text-line me-2"></i>CSV
              </Dropdown.Item>
            </SpkDropdown>
            <SpkButton
              Buttonvariant="primary"
              Customclass="btn btn-wave"
              onClickfunc={openModal}
            >
              <i className="ri-add-line me-1"></i> Add New Visit Report
            </SpkButton>
          </div>
        </Card.Header>

        <Card.Header className="border-top border-block-start-dashed py-2">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted fs-12">Show</span>
              <Form.Select
                size="sm"
                style={{ width: 72 }}
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Form.Select>
              <span className="text-muted fs-12">entries</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted fs-12">Search:</span>
              <Form.Control
                type="search"
                size="sm"
                style={{ minWidth: 200 }}
                placeholder="Search reports..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <SpkTables
              tableClass="text-nowrap table-hover"
              header={[
                { title: 'Sales' },
                { title: 'Company' },
                { title: 'Meeting point — tandem' },
                { title: 'Visit date & time' },
                { title: 'Purpose' },
                { title: 'Follow up date' },
                { title: 'Status' },
                { title: 'Prospek' },
                { title: 'Action' },
              ]}
            >
              {pageRows.map((row: VisitReportAiiRow) => (
                <tr key={row.idVisitReport}>
                  <td className="fw-medium">{row.sales}</td>
                  <td style={{ maxWidth: 280 }}>
                    <div className="fw-semibold text-truncate">
                      {row.company}
                    </div>
                    <div className="text-muted fs-12 text-truncate">
                      ({row.contactPerson})
                    </div>
                  </td>
                  <td className="text-truncate" style={{ maxWidth: 200 }}>
                    {row.meetingPoint}
                  </td>
                  <td>{row.visitDateTime}</td>
                  <td className="text-truncate" style={{ maxWidth: 200 }}>
                    {row.purpose}
                  </td>
                  <td>{row.followUpDate ?? '—'}</td>
                  <td>
                    <SpkBadge
                      variant=""
                      Customclass={`badge bg-${statusBadgeClass[row.status]}`}
                    >
                      {row.status}
                    </SpkBadge>
                  </td>
                  <td>
                    <SpkBadge
                      variant=""
                      Customclass={`badge bg-${prospekBadgeClass[row.prospek] ?? 'light'}`}
                    >
                      {row.prospek}
                    </SpkBadge>
                  </td>
                  <td>
                    <Link
                      href="#!"
                      scroll={false}
                      className="btn btn-icon btn-sm btn-light border"
                      aria-label="Edit visit report"
                    >
                      <i className="ri-pencil-line"></i>
                    </Link>
                  </td>
                </tr>
              ))}
            </SpkTables>
          </div>
        </Card.Body>

        <div className="card-footer border-top-0">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <div className="text-muted fs-12">
              Showing{' '}
              <span className="fw-semibold text-defaulttextcolor">
                {filtered.length === 0 ? 0 : pageStart + 1}
              </span>{' '}
              to{' '}
              <span className="fw-semibold text-defaulttextcolor">
                {Math.min(pageEnd, filtered.length)}
              </span>{' '}
              of{' '}
              <span className="fw-semibold text-defaulttextcolor">
                {filtered.length}
              </span>{' '}
              entries
            </div>
            <div className="ms-auto">
              <nav aria-label="Visit report pagination">
                <Pagination className="mb-0 flex-wrap pagination-style-2">
                  <Pagination.Prev
                    disabled={currentPage === 1 || filtered.length === 0}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Pagination.Prev>
                  {getPaginationItems(currentPage, totalPages).map(
                    (item, idx) =>
                      item === 'ellipsis' ? (
                        <Pagination.Ellipsis key={`e-${idx}`} disabled />
                      ) : (
                        <Pagination.Item
                          key={item}
                          active={item === currentPage}
                          onClick={() => setCurrentPage(item)}
                        >
                          {item}
                        </Pagination.Item>
                      ),
                  )}
                  <Pagination.Next
                    disabled={
                      currentPage === totalPages || filtered.length === 0
                    }
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

      {/* ── Add New Visit Report Modal ── */}
      <Modal
        show={showModal}
        onHide={closeModal}
        size="lg"
        backdrop={submitting ? 'static' : true}
        keyboard={!submitting}
        centered
      >
        <Modal.Header closeButton={!submitting}>
          <Modal.Title className="fs-16 fw-semibold">
            <i className="ri-add-circle-line me-2 text-primary"></i>
            Add New Visit Report
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit} noValidate>
          <Modal.Body>
            {submitError && (
              <div className="alert alert-danger py-2 fs-12 mb-3" role="alert">
                <i className="ri-error-warning-line me-1"></i>
                {submitError}
              </div>
            )}

            {/* Row 1 — Customer & Sales */}
            <Row className="g-3 mb-3">
              <Col md={8}>
                <Form.Label className="fs-12 fw-semibold mb-1">
                  Customer / Company <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  ref={firstInputRef as React.Ref<HTMLSelectElement>}
                  size="sm"
                  value={form.customer_name}
                  onChange={(e) => setField('customer_name', e.target.value)}
                  isInvalid={!!formErrors.customer_name}
                >
                  <option value="">— select company —</option>
                  {COMPANY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.customer_name}
                </Form.Control.Feedback>
              </Col>
              <Col md={4}>
                <Form.Label className="fs-12 fw-semibold mb-1">
                  Office
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={form.office}
                  onChange={(e) =>
                    setField('office', e.target.value as 'AII' | 'SEP')
                  }
                >
                  <option value="AII">AII</option>
                  <option value="SEP">SEP</option>
                </Form.Select>
              </Col>
            </Row>

            {/* Row 2 — Sales person & Contact person */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Label className="fs-12 fw-semibold mb-1">
                  Sales <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={form.sales}
                  onChange={(e) => setField('sales', e.target.value)}
                  isInvalid={!!formErrors.sales}
                >
                  <option value="">— select sales —</option>
                  {SALES_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.sales}
                </Form.Control.Feedback>
              </Col>
              <Col md={6}>
                <Form.Label className="fs-12 fw-semibold mb-1">
                  Contact Person
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={form.contact_person}
                  onChange={(e) => setField('contact_person', e.target.value)}
                >
                  <option value="">— select contact —</option>
                  {CONTACT_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {/* Row 3 — Location */}
            <Row className="g-3 mb-3">
              <Col md={12}>
                <Form.Label className="fs-12 fw-semibold mb-1">
                  Meeting Point - Tandem
                </Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="e.g. Customer site, Office, Online meeting"
                  value={form.location}
                  onChange={(e) => setField('location', e.target.value)}
                />
              </Col>
            </Row>

            {/* Row 4 — Purpose */}
            <div className="mb-3">
              <Form.Label className="fs-12 fw-semibold mb-1">
                Purpose <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                size="sm"
                placeholder="e.g. Follow up project, Product demo…"
                value={form.purpose}
                onChange={(e) => setField('purpose', e.target.value)}
                isInvalid={!!formErrors.purpose}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.purpose}
              </Form.Control.Feedback>
            </div>

            {/* Row 5 — Visit date & time */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Label className="fs-12 fw-semibold mb-1">
                  Visit Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={form.visit_date}
                  onChange={(e) => setField('visit_date', e.target.value)}
                  isInvalid={!!formErrors.visit_date}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.visit_date}
                </Form.Control.Feedback>
              </Col>
              <Col md={6}>
                <Form.Label className="fs-12 fw-semibold mb-1">
                  Visit Time
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={form.visit_time}
                  onChange={(e) => setField('visit_time', e.target.value)}
                >
                  <option value="">— select time —</option>
                  {VISIT_TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <SpkButton
              Buttonvariant="secondary"
              Customclass="btn btn-wave"
              onClickfunc={closeModal}
            >
              Cancel
            </SpkButton>
            <SpkButton Buttonvariant="primary" Customclass="btn btn-wave">
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Saving…
                </>
              ) : (
                <>
                  <i className="ri-save-line me-1"></i>Save Report
                </>
              )}
            </SpkButton>
          </Modal.Footer>
        </Form>
      </Modal>
    </Fragment>
  )
}

export default VisitReportAiiPage
