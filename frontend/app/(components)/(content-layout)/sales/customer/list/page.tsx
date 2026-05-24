'use client'

import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons'
import SpkDropdown from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import Link from 'next/link'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import {
  ButtonGroup,
  Card,
  Col,
  Dropdown,
  Form,
  Offcanvas,
  Pagination,
  Row,
  Modal,
} from 'react-bootstrap'

type CustomerStatus = 'Active' | 'Inactive' | 'Prospect' | 'Blacklisted'

type Customer = {
  id: number
  customer_code: string
  name: string
  email?: string | null
  sales?: string | null
  area?: string | null
  address?: string | null
  phone_number?: string | null
  mobile_phone?: string | null
  company?: string | null
  position?: string | null
  category?: string | null
  status: CustomerStatus
  created_at: string
  updated_at: string
}

const statusBadgeClass: Record<CustomerStatus, string> = {
  Active: 'success-transparent',
  Inactive: 'light text-muted',
  Prospect: 'warning-transparent',
  Blacklisted: 'danger-transparent',
}

const statusDotClass: Record<CustomerStatus, string> = {
  Active: 'success',
  Inactive: 'secondary',
  Prospect: 'warning',
  Blacklisted: 'danger',
}

const seedCustomers: Customer[] = [
  {
    id: 1,
    customer_code: 'CUST-000001',
    name: 'Budi Santoso',
    email: 'purchasing@sinarabadi.co.id',
    sales: 'Bambang Tri',
    area: 'Jakarta',
    address: 'Jl. Gatot Subroto No. 88, Jakarta Selatan',
    phone_number: '021-555-0123',
    mobile_phone: '+62 812-3456-7890',
    company: 'PT Sinar Abadi',
    position: 'Purchasing Manager',
    status: 'Active',
    created_at: '2026-04-12 09:10',
    updated_at: '2026-04-14 17:42',
  },
  {
    id: 2,
    customer_code: 'CUST-000002',
    name: 'Dewi Lestari',
    email: 'owner@majubersama.id',
    sales: 'Setia',
    area: 'Bandung',
    address: 'Jl. Asia Afrika No. 12, Bandung',
    phone_number: '022-777-2010',
    mobile_phone: '+62 813-0022-7788',
    company: 'CV Maju Bersama',
    position: 'Owner',
    status: 'Prospect',
    created_at: '2026-04-11 14:22',
    updated_at: '2026-04-13 10:01',
  },
  {
    id: 3,
    customer_code: 'CUST-000003',
    name: 'Rizky Pratama',
    email: 'admin@nusantaralogistik.com',
    sales: 'Eka',
    area: 'Surabaya',
    address: 'Rungkut Industrial Park, Surabaya',
    phone_number: '031-909-1144',
    mobile_phone: '+62 811-9922-1100',
    company: 'PT Nusantara Logistik',
    position: 'Operations Lead',
    status: 'Inactive',
    created_at: '2026-03-30 08:05',
    updated_at: '2026-04-02 16:12',
  },
  {
    id: 4,
    customer_code: 'CUST-000004',
    name: 'Siti Aisyah',
    email: null,
    sales: 'Rizky',
    area: 'Semarang',
    address: 'Jl. Pandanaran No. 3, Semarang',
    phone_number: null,
    mobile_phone: '+62 852-1000-4001',
    company: 'UD Sentosa Teknik',
    position: 'Admin',
    status: 'Blacklisted',
    created_at: '2026-02-19 11:40',
    updated_at: '2026-03-01 09:00',
  },
  {
    id: 5,
    customer_code: 'CUST-000005',
    name: 'Andi Wijaya',
    email: 'andi.wijaya@megajaya.co.id',
    sales: 'David',
    area: 'Tangerang',
    address: 'Jl. MH Thamrin No. 10, Tangerang',
    phone_number: '021-880-3344',
    mobile_phone: '+62 812-9911-2233',
    company: 'PT Mega Jaya Sentosa',
    position: 'Procurement',
    status: 'Active',
    created_at: '2026-04-09 10:25',
    updated_at: '2026-04-15 08:10',
  },
  {
    id: 6,
    customer_code: 'CUST-000006',
    name: 'Maya Putri',
    email: 'maya.putri@tirtautama.id',
    sales: 'Vicha',
    area: 'Bekasi',
    address: 'Kawasan Industri Jababeka, Cikarang',
    phone_number: '021-902-1188',
    mobile_phone: '+62 813-6600-1122',
    company: 'PT Tirta Utama',
    position: 'Admin Purchasing',
    status: 'Prospect',
    created_at: '2026-04-10 15:02',
    updated_at: '2026-04-14 12:30',
  },
  {
    id: 7,
    customer_code: 'CUST-000007',
    name: 'Heri Saputra',
    email: 'hsaputra@bintangmulia.com',
    sales: 'Heri',
    area: 'Bogor',
    address: 'Jl. Pajajaran No. 21, Bogor',
    phone_number: '0251-778-0909',
    mobile_phone: '+62 811-2020-3030',
    company: 'PT Bintang Mulia',
    position: 'Operations',
    status: 'Active',
    created_at: '2026-03-28 09:45',
    updated_at: '2026-04-12 18:05',
  },
  {
    id: 8,
    customer_code: 'CUST-000008',
    name: 'Dika Pranata',
    email: 'dika@citraniaga.id',
    sales: 'Dika',
    area: 'Depok',
    address: 'Jl. Margonda Raya No. 50, Depok',
    phone_number: '021-772-3001',
    mobile_phone: '+62 852-7777-0101',
    company: 'CV Citra Niaga',
    position: 'Owner',
    status: 'Prospect',
    created_at: '2026-04-08 11:12',
    updated_at: '2026-04-13 09:40',
  },
  {
    id: 9,
    customer_code: 'CUST-000009',
    name: 'Rani Oktavia',
    email: 'rani.oktavia@samudera.co.id',
    sales: 'Bambang Tri',
    area: 'Medan',
    address: 'Jl. Sisingamangaraja No. 7, Medan',
    phone_number: '061-800-1212',
    mobile_phone: '+62 811-3300-2211',
    company: 'PT Samudera Nusantara',
    position: 'Finance & Admin',
    status: 'Inactive',
    created_at: '2026-03-05 13:00',
    updated_at: '2026-03-20 17:15',
  },
  {
    id: 10,
    customer_code: 'CUST-000010',
    name: 'Fajar Hidayat',
    email: 'fajar@suryaagung.id',
    sales: 'Setia',
    area: 'Palembang',
    address: 'Jl. Jend. Sudirman No. 99, Palembang',
    phone_number: '0711-445-778',
    mobile_phone: '+62 813-9001-4455',
    company: 'PT Surya Agung',
    position: 'Purchasing Supervisor',
    status: 'Active',
    created_at: '2026-02-27 08:30',
    updated_at: '2026-04-01 10:10',
  },
  {
    id: 11,
    customer_code: 'CUST-000011',
    name: 'Nadia Salsabila',
    email: 'nadia@langgengsejahtera.co.id',
    sales: 'Eka',
    area: 'Yogyakarta',
    address: 'Jl. Malioboro No. 18, Yogyakarta',
    phone_number: '0274-660-220',
    mobile_phone: '+62 812-4400-8899',
    company: 'PT Langgeng Sejahtera',
    position: 'Admin',
    status: 'Prospect',
    created_at: '2026-04-06 16:40',
    updated_at: '2026-04-14 09:05',
  },
  {
    id: 12,
    customer_code: 'CUST-000012',
    name: 'David Gunawan',
    email: 'd.gunawan@karyautama.id',
    sales: 'Rizky',
    area: 'Denpasar',
    address: 'Jl. Teuku Umar No. 2, Denpasar',
    phone_number: '0361-330-889',
    mobile_phone: '+62 811-8881-2200',
    company: 'PT Karya Utama',
    position: 'Warehouse',
    status: 'Active',
    created_at: '2026-03-18 10:05',
    updated_at: '2026-04-10 14:55',
  },
  {
    id: 13,
    customer_code: 'CUST-000013',
    name: 'Sari Nuraini',
    email: 'sari@mitrateknik.co.id',
    sales: 'David',
    area: 'Makassar',
    address: 'Jl. AP Pettarani No. 25, Makassar',
    phone_number: '0411-700-212',
    mobile_phone: '+62 852-1100-7788',
    company: 'PT Mitra Teknik',
    position: 'Engineering Admin',
    status: 'Inactive',
    created_at: '2026-01-22 09:10',
    updated_at: '2026-03-12 11:00',
  },
  {
    id: 14,
    customer_code: 'CUST-000014',
    name: 'Vicha Amelia',
    email: 'vicha@bajamandiri.id',
    sales: 'Vicha',
    area: 'Batam',
    address: 'Batam Center, Kepulauan Riau',
    phone_number: '0778-220-909',
    mobile_phone: '+62 813-2222-0909',
    company: 'CV Baja Mandiri',
    position: 'Sales Admin',
    status: 'Prospect',
    created_at: '2026-04-03 12:15',
    updated_at: '2026-04-15 07:40',
  },
  {
    id: 15,
    customer_code: 'CUST-000015',
    name: 'Setiawan Aditya',
    email: 'setiawan@primafood.co.id',
    sales: 'Heri',
    area: 'Malang',
    address: 'Jl. Ijen No. 1, Malang',
    phone_number: '0341-560-221',
    mobile_phone: '+62 811-5511-3300',
    company: 'PT Prima Food',
    position: 'Procurement Lead',
    status: 'Active',
    created_at: '2026-03-02 14:50',
    updated_at: '2026-04-11 09:20',
  },
  {
    id: 16,
    customer_code: 'CUST-000016',
    name: 'Eka Wulandari',
    email: 'eka@jayamakmur.id',
    sales: 'Dika',
    area: 'Pontianak',
    address: 'Jl. Ahmad Yani No. 15, Pontianak',
    phone_number: '0561-333-1010',
    mobile_phone: '+62 852-6611-9900',
    company: 'UD Jaya Makmur',
    position: 'Admin',
    status: 'Blacklisted',
    created_at: '2026-02-10 10:10',
    updated_at: '2026-03-05 08:00',
  },
]

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

const CATEGORY_LIST = [
  'End-User',
  'Panel Maker',
  'System Integrator',
  'EPC',
  'Supplier/Trader',
  'Consultant',
  'Contractor',
  'Data Center',
]

const STATUS_OPTIONS: CustomerStatus[] = [
  'Active',
  'Prospect',
  'Inactive',
  'Blacklisted',
]

const STATUS_VARIANT: Record<CustomerStatus, string> = {
  Active: 'success',
  Prospect: 'warning',
  Inactive: 'secondary',
  Blacklisted: 'danger',
}

const BLANK_FORM = {
  name: '',
  email: '',
  company: '',
  position: '',
  phone_number: '',
  mobile_phone: '',
  area: '',
  address: '',
  sales: '',
  category: '',
  status: 'Active' as CustomerStatus,
}

const CustomerListPage: React.FC = () => {
  const pageSize = 7
  const [customers, setCustomers] = useState<Customer[]>([])
  const [query, setQuery] = useState('')
  const [salesFilter, setSalesFilter] = useState<string>('All')
  const [areaFilter, setAreaFilter] = useState<string>('All')
  const [selected, setSelected] = useState<Customer | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ ...BLANK_FORM })
  const [addErrors, setAddErrors] = useState<Partial<typeof BLANK_FORM>>({})
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadCustomers = async () => {
      try {
        const res = await fetch('/api/v1/sales/customers', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (isMounted && Array.isArray(data)) {
          setCustomers(data as Customer[])
        }
      } catch (error) {
        console.error('Failed to load sales customers:', error)
      }
    }

    loadCustomers()
    return () => {
      isMounted = false
    }
  }, [])

  const areas = useMemo(() => {
    const uniq = new Set(
      customers.map((c) => c.area).filter(Boolean) as string[],
    )
    return ['All', ...Array.from(uniq).sort((a, b) => a.localeCompare(b))]
  }, [customers])

  const salesOwners = useMemo(() => {
    const uniq = new Set(
      customers.map((c) => c.sales).filter(Boolean) as string[],
    )
    return ['All', ...Array.from(uniq).sort((a, b) => a.localeCompare(b))]
  }, [customers])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return customers.filter((c) => {
      const matchQuery =
        q.length === 0 ||
        [
          c.customer_code,
          c.name,
          c.email ?? '',
          c.company ?? '',
          c.area ?? '',
          c.sales ?? '',
          c.phone_number ?? '',
          c.mobile_phone ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)

      const matchSales =
        salesFilter === 'All' ? true : (c.sales ?? '') === salesFilter
      const matchArea =
        areaFilter === 'All' ? true : (c.area ?? '') === areaFilter
      return matchQuery && matchSales && matchArea
    })
  }, [query, salesFilter, areaFilter, customers])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const paginatedCustomers = filtered.slice(pageStart, pageEnd)

  useEffect(() => {
    setCurrentPage(1)
  }, [query, salesFilter, areaFilter])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const counts = useMemo(() => {
    const base = {
      All: customers.length,
      Active: 0,
      Inactive: 0,
      Prospect: 0,
      Blacklisted: 0,
    }
    for (const c of customers) base[c.status]++
    return base
  }, [customers])

  const trackerCounts = useMemo(() => {
    const sepOwners = new Set(['Bambang Tri', 'Rizky', 'Eka', 'Setia'])
    const aiiOwners = new Set(['David', 'Vicha', 'Heri', 'Dika'])
    let sep = 0
    let aii = 0

    for (const customer of customers) {
      const salesName = customer.sales ?? ''
      if (sepOwners.has(salesName)) sep++
      if (aiiOwners.has(salesName)) aii++
    }

    return { sep, aii }
  }, [customers])

  const customerDistribution = useMemo(() => {
    const distributionMap = new Map<string, number>()
    for (const customer of customers) {
      const salesName = customer.sales ?? 'Unassigned'
      distributionMap.set(salesName, (distributionMap.get(salesName) ?? 0) + 1)
    }

    return Array.from(distributionMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    )
  }, [customers])

  const openAddModal = () => {
    setAddForm({ ...BLANK_FORM })
    setAddErrors({})
    setShowAddModal(true)
  }

  const validateAddForm = () => {
    const errs: Partial<typeof BLANK_FORM> = {}
    if (!addForm.name.trim()) errs.name = 'Name is required'
    if (!addForm.company.trim()) errs.company = 'Company is required'
    return errs
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateAddForm()
    if (Object.keys(errs).length > 0) {
      setAddErrors(errs)
      return
    }
    setAddLoading(true)
    try {
      const payload = {
        name: addForm.name.trim(),
        email: addForm.email.trim() || null,
        company: addForm.company.trim() || null,
        position: addForm.position.trim() || null,
        phone_number: addForm.phone_number.trim() || null,
        mobile_phone: addForm.mobile_phone.trim() || null,
        area: addForm.area.trim() || null,
        address: addForm.address.trim() || null,
        sales: addForm.sales || null,
        category: addForm.category || null,
        status: addForm.status,
      }

      const res = await fetch('/api/v1/sales/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data?.details?.errors) {
          const serverErrs: Partial<typeof BLANK_FORM> = {}
          for (const [field, messages] of Object.entries(
            data.details.errors as Record<string, string[]>,
          )) {
            ;(serverErrs as Record<string, string>)[field] = (messages as string[])[0]
          }
          setAddErrors(serverErrs)
        } else {
          alert(data?.error ?? 'Failed to save customer.')
        }
        return
      }

      setCustomers((prev) => [data as Customer, ...prev])
      setShowAddModal(false)
    } catch (err) {
      console.error('handleAddCustomer error:', err)
      alert('Network error — please try again.')
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <Fragment>
      <div className="d-flex align-items-center justify-content-between mb-3 page-header-breadcrumb flex-wrap gap-2">
        <div>
          <h1 className="page-title fw-medium fs-20 mb-0">Customer List</h1>
          <div className="text-muted fs-12 mt-1">
            Build pipeline faster: qualify prospects, keep contacts clean, and
            always know who owns the account.
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
                <i className="ri-upload-2-line me-2"></i>Import
              </Dropdown.Item>
            </li>
            <li>
              <Dropdown.Item href="#!">
                <i className="ri-refresh-line me-2"></i>Refresh
              </Dropdown.Item>
            </li>
          </SpkDropdown>
        </div>
      </div>

      <Row className="mb-3">
        <Col xl={4} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fs-12">Total Customers</div>
                  <div className="fs-18 fw-semibold">{counts.All}</div>
                </div>
                <span className="avatar avatar-md bg-primary-transparent">
                  <i className="ri-contacts-line fs-18"></i>
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <div className="text-muted fs-12">Customer Tracker</div>
                  <div className="fs-18 fw-semibold">
                    {trackerCounts.sep + trackerCounts.aii}
                  </div>
                </div>
                <span className="avatar avatar-md bg-info-transparent">
                  <i className="ri-git-branch-line fs-18"></i>
                </span>
              </div>
              <div className="d-flex align-items-center justify-content-between fs-12">
                <span className="text-muted">SEP</span>
                <span className="fw-semibold">{trackerCounts.sep}</span>
              </div>
              <div className="d-flex align-items-center justify-content-between fs-12 mt-1">
                <span className="text-muted">AII</span>
                <span className="fw-semibold">{trackerCounts.aii}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4} md={12}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <div className="text-muted fs-12">Customer Distribution</div>
                  <div className="fs-18 fw-semibold">
                    {customerDistribution.length}
                  </div>
                </div>
                <span className="avatar avatar-md bg-warning-transparent">
                  <i className="ri-pie-chart-line fs-18"></i>
                </span>
              </div>
              <div className="d-flex flex-column gap-1">
                {customerDistribution.map(([salesName, total]) => (
                  <div
                    key={salesName}
                    className="d-flex align-items-center justify-content-between fs-12"
                  >
                    <span className="text-muted">{salesName}</span>
                    <span className="fw-semibold">{total}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="custom-card overflow-hidden">
        <Card.Header className="justify-content-between">
          <div className="card-title">Customers</div>
          <div className="d-flex flex-wrap gap-2">
            <Form.Control
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className=""
              type="text"
              placeholder="Search name, code, email, company, phone..."
              aria-label="Search customers"
            />
            <Form.Select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              aria-label="Filter by area"
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Form.Select>
            <SpkDropdown
              Id="salesDropdown"
              Togglevariant=""
              Toggletext={salesFilter === 'All' ? 'Sales' : salesFilter}
              Arrowicon={true}
              IconClass="ri-arrow-down-s-line align-middle ms-1 d-inline-block"
              Customtoggleclass="btn btn-outline-light btn-wave waves-effect waves-light no-caret"
            >
              {salesOwners.map((owner) => (
                <li key={owner}>
                  <Dropdown.Item
                    onClick={() => setSalesFilter(owner)}
                    className="d-flex align-items-center justify-content-between"
                  >
                    <span>
                      <i className="ri-user-3-line me-2"></i>
                      {owner}
                    </span>
                  </Dropdown.Item>
                </li>
              ))}
            </SpkDropdown>
            <SpkButton
              Buttonvariant="primary"
              Customclass="btn btn-wave"
              onClick={openAddModal}
            >
              <i className="ri-user-add-line me-2"></i>Add Customer
            </SpkButton>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <SpkTables
              tableClass="text-nowrap table-hover"
              header={[
                { title: 'Company' },
                { title: 'Customer' },
                { title: 'Area' },
                { title: 'Sales' },
                { title: 'Actions' },
              ]}
            >
              {paginatedCustomers.map((c) => (
                <tr key={c.customer_code}>
                  <td className="text-truncate" style={{ maxWidth: 240 }}>
                    <div className="lh-1">
                      <div
                        className="fw-semibold text-truncate"
                        style={{ maxWidth: 240 }}
                      >
                        {c.company ?? '--'}
                      </div>
                      <div
                        className="text-muted fs-12 text-truncate"
                        style={{ maxWidth: 240 }}
                      >
                        {c.customer_code}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="avatar avatar-sm avatar-rounded bg-primary-transparent">
                        {c.name.trim().slice(0, 2).toUpperCase()}
                      </span>
                      <div className="lh-1">
                        <Link
                          href="#!"
                          scroll={false}
                          className="fw-semibold d-block text-truncate"
                          style={{ maxWidth: 220 }}
                        >
                          {c.name}
                        </Link>
                        <span
                          className="fs-12 text-muted d-block text-truncate"
                          style={{ maxWidth: 220 }}
                        >
                          {c.email ?? '--'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="text-truncate" style={{ maxWidth: 260 }}>
                    <div className="lh-1">
                      <div
                        className="fw-medium text-truncate"
                        style={{ maxWidth: 260 }}
                      >
                        {c.area ?? '--'}
                      </div>
                      <div
                        className="text-muted fs-12 text-truncate"
                        style={{ maxWidth: 260 }}
                      >
                        {c.address ?? '--'}
                      </div>
                    </div>
                  </td>
                  <td>{c.sales ?? '--'}</td>
                  <td>
                    <SpkDropdown
                      Togglevariant=""
                      Icon={true}
                      Customtoggleclass="btn btn-icon btn-sm btn-light border no-caret"
                      IconClass="fe fe-more-vertical"
                    >
                      <Dropdown.Item as="li" onClick={() => setSelected(c)}>
                        <i className="ri-eye-line me-2"></i>View
                      </Dropdown.Item>
                      <Dropdown.Item as="li" href="#!">
                        <i className="ri-pencil-line me-2"></i>Edit
                      </Dropdown.Item>
                      <Dropdown.Item as="li" href="#!" className="text-danger">
                        <i className="ri-delete-bin-line me-2"></i>Delete
                      </Dropdown.Item>
                    </SpkDropdown>
                  </td>
                </tr>
              ))}
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
              from <span className="fw-semibold">{customers.length}</span>
            </div>
            <div className="ms-auto">
              <nav aria-label="Page navigation" className="pagination-style-2">
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
          <Offcanvas.Title>Customer Details</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selected ? (
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div>
                  <div className="fw-semibold fs-16">{selected.name}</div>
                  <div className="text-muted fs-12">
                    {selected.customer_code}
                  </div>
                </div>
                <SpkBadge
                  variant=""
                  Customclass={`badge bg-${statusBadgeClass[selected.status]}`}
                >
                  {selected.status}
                </SpkBadge>
              </div>

              <Card className="custom-card mb-0">
                <Card.Body className="p-3">
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Sales Owner</span>
                      <span className="fw-medium">
                        {selected.sales ?? '--'}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Area</span>
                      <span className="fw-medium">{selected.area ?? '--'}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Company</span>
                      <span className="fw-medium">
                        {selected.company ?? '--'}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Position</span>
                      <span className="fw-medium">
                        {selected.position ?? '--'}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="custom-card mb-0">
                <Card.Body className="p-3">
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Email</span>
                      <span className="fw-medium">
                        {selected.email ?? '--'}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Phone</span>
                      <span className="fw-medium">
                        {selected.phone_number ?? '--'}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Mobile</span>
                      <span className="fw-medium">
                        {selected.mobile_phone ?? '--'}
                      </span>
                    </div>
                    <div className="d-flex flex-column gap-1">
                      <span className="text-muted">Address</span>
                      <div className="fw-medium">
                        {selected.address ?? '--'}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <div className="d-flex gap-2">
                <SpkButton
                  Buttonvariant="primary"
                  Customclass="btn btn-wave flex-fill"
                >
                  <i className="ri-pencil-line me-2"></i>Edit
                </SpkButton>
                <SpkButton
                  Buttonvariant="outline-light"
                  Customclass="btn btn-wave flex-fill"
                >
                  <i className="ri-phone-line me-2"></i>Call
                </SpkButton>
              </div>
            </div>
          ) : null}
        </Offcanvas.Body>
      </Offcanvas>

      {/* ── Add Customer Modal ── */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-16 fw-semibold">
            <i className="ri-user-add-line me-2"></i>Add New Customer
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddCustomer} noValidate>
          <Modal.Body>
            <Row className="g-3">
              {/* Name */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium fs-14">
                    Full Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Budi Santoso"
                    isInvalid={!!addErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {addErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {/* Email */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium fs-14">Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="e.g. purchasing@company.id"
                  />
                </Form.Group>
              </Col>
              {/* Company */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium fs-14">
                    Company <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    value={addForm.company}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, company: e.target.value }))
                    }
                    placeholder="e.g. PT Sinar Abadi"
                    isInvalid={!!addErrors.company}
                  />
                  <Form.Control.Feedback type="invalid">
                    {addErrors.company}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {/* Position */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium fs-14">Position</Form.Label>
                  <Form.Control
                    value={addForm.position}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, position: e.target.value }))
                    }
                    placeholder="e.g. Purchasing Manager"
                  />
                </Form.Group>
              </Col>
              {/* Phone */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium fs-14">Phone</Form.Label>
                  <Form.Control
                    value={addForm.phone_number}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        phone_number: e.target.value,
                      }))
                    }
                    placeholder="e.g. 021-555-0123"
                  />
                </Form.Group>
              </Col>
              {/* Mobile */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium fs-14">Mobile</Form.Label>
                  <Form.Control
                    value={addForm.mobile_phone}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        mobile_phone: e.target.value,
                      }))
                    }
                    placeholder="e.g. +62 812-3456-7890"
                  />
                </Form.Group>
              </Col>
              {/* Area */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium fs-14">Area</Form.Label>
                  <Form.Control
                    value={addForm.area}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, area: e.target.value }))
                    }
                    placeholder="e.g. Jakarta"
                  />
                </Form.Group>
              </Col>
              {/* Sales Owner — fixed dropdown */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium fs-14">
                    Sales Owner
                  </Form.Label>
                  <Form.Select
                    value={addForm.sales}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, sales: e.target.value }))
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
              </Col>
              {/* Address */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-medium fs-14">Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={addForm.address}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, address: e.target.value }))
                    }
                    placeholder="e.g. Jl. Gatot Subroto No. 88, Jakarta Selatan"
                  />
                </Form.Group>
              </Col>
              {/* Category Customer — last field */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-medium fs-14">
                    Category Customer
                  </Form.Label>
                  <Form.Select
                    value={addForm.category}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, category: e.target.value }))
                    }
                  >
                    <option value="">-- Select a Category --</option>
                    {CATEGORY_LIST.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <SpkButton
              Buttonvariant="outline-light"
              Customclass="btn btn-wave"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </SpkButton>
            <SpkButton
              Buttonvariant="primary"
              Customclass="btn btn-wave"
              type="submit"
              disabled={addLoading}
            >
              {addLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <i className="ri-save-line me-2"></i>Save Customer
                </>
              )}
            </SpkButton>
          </Modal.Footer>
        </Form>
      </Modal>
    </Fragment>
  )
}

export default CustomerListPage
