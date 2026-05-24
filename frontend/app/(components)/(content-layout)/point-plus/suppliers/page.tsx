'use client'

import React, { Fragment, useEffect, useState, useMemo } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons'
import { Card, Col, Row, Pagination, Form, Offcanvas } from 'react-bootstrap'

type Supplier = {
  id: number
  supplier_name: string
  company: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  created_at: string
}

const initialForm = {
  supplier_name: '',
  company: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
}

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/v1/point-plus/suppliers?per_page=1000')
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.data)) {
          setSuppliers(data.data)
        } else if (Array.isArray(data)) {
          setSuppliers(data)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return suppliers.filter(s => 
      s.supplier_name.toLowerCase().includes(q) || 
      (s.company && s.company.toLowerCase().includes(q))
    )
  }, [suppliers, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const paginatedSuppliers = filtered.slice(pageStart, pageEnd)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/point-plus/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.message || body.error || 'Failed to save supplier')
        return
      }

      setShowForm(false)
      setForm(initialForm)
      fetchSuppliers()
    } catch (e) {
      setError('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Fragment>
      <Seo title="Suppliers" />
      <div className="d-flex align-items-center justify-content-between mb-3 page-header-breadcrumb flex-wrap gap-2 mt-4">
        <div>
          <h1 className="page-title fw-medium fs-20 mb-0">Supplier Management</h1>
          <div className="text-muted fs-12 mt-1">
            Manage your vendors and suppliers for purchasing.
          </div>
        </div>
        <SpkButton variant="primary" Customclass="btn btn-wave" onClickfunc={() => setShowForm(true)}>
          <i className="ri-add-line me-1"></i>Add Supplier
        </SpkButton>
      </div>

      <Card className="custom-card">
        <Card.Header className="justify-content-between">
          <div className="card-title">Suppliers List</div>
          <div className="d-flex gap-2">
             <Form.Control
                type="text"
                placeholder="Search name or company..."
                value={query}
                onChange={e => setQuery(e.target.value)}
             />
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <SpkTables
              tableClass="text-nowrap table-hover mb-0"
              header={[
                { title: 'Supplier Name' },
                { title: 'Company' },
                { title: 'Contact' },
                { title: 'Address' },
                { title: 'Actions' },
              ]}
            >
              {paginatedSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted p-4">No suppliers found.</td>
                </tr>
              ) : paginatedSuppliers.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="fw-semibold">{s.supplier_name}</div>
                  </td>
                  <td>{s.company || '-'}</td>
                  <td>
                    <div className="fs-12"><i className="ri-phone-line me-1 text-muted"></i>{s.phone || '-'}</div>
                    <div className="fs-12"><i className="ri-mail-line me-1 text-muted"></i>{s.email || '-'}</div>
                  </td>
                  <td>
                    <span className="text-muted fs-12 text-wrap" style={{ maxWidth: 200, display: 'inline-block' }}>
                      {s.address || '-'}
                    </span>
                  </td>
                  <td>
                    <SpkButton Buttonvariant="info-light" Customclass="btn btn-icon btn-sm rounded-circle me-1">
                      <i className="ri-pencil-line"></i>
                    </SpkButton>
                  </td>
                </tr>
              ))}
            </SpkTables>
          </div>
        </Card.Body>
        <Card.Footer className="border-top-0 d-flex align-items-center justify-content-between">
            <div>
              Showing <span className="fw-semibold">{filtered.length === 0 ? 0 : pageStart + 1}-{Math.min(pageEnd, filtered.length)}</span> of <span className="fw-semibold">{filtered.length}</span> records
            </div>
            <Pagination className="mb-0">
              <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Pagination.Item key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>
                  {p}
                </Pagination.Item>
              ))}
              <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
            </Pagination>
        </Card.Footer>
      </Card>

      <Offcanvas placement="end" show={showForm} onHide={() => setShowForm(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Add Supplier</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label>Supplier Name *</Form.Label>
              <Form.Control required value={form.supplier_name} onChange={e => setForm({...form, supplier_name: e.target.value})} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Company</Form.Label>
              <Form.Control value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </Form.Group>

            {error && <div className="text-danger fs-12">{error}</div>}

            <div className="mt-3">
              <SpkButton Buttontype="submit" variant="primary" Customclass="w-100 btn-wave" Disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Supplier'}
              </SpkButton>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

    </Fragment>
  )
}

export default SuppliersPage
