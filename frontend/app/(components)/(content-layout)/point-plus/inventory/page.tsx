'use client'

import React, { Fragment, useEffect, useState, useMemo } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import { Card, Col, Row, Pagination, Form } from 'react-bootstrap'

type Product = {
  id: number
  barcode: string
  product_name: string
  unit: string
}

type StockMovement = {
  id: number
  product_id: number
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reference_type: string | null
  reference_id: string | null
  notes: string | null
  created_at: string
  product: Product
}

const InventoryPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15

  const fetchMovements = async () => {
    try {
      const res = await fetch('/api/v1/point-plus/stock-movements?per_page=1000')
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.data)) {
          setMovements(data.data)
        } else if (Array.isArray(data)) {
          setMovements(data)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchMovements()
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return movements.filter(m => {
      const matchSearch = q === '' || m.product?.product_name.toLowerCase().includes(q) || m.product?.barcode.includes(q) || m.reference_type?.toLowerCase().includes(q)
      const matchType = typeFilter === 'All' || m.type === typeFilter
      return matchSearch && matchType
    })
  }, [movements, query, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const paginatedMovements = filtered.slice(pageStart, pageEnd)

  useEffect(() => {
    setCurrentPage(1)
  }, [query, typeFilter])

  return (
    <Fragment>
      <Seo title="Inventory Movement" />
      <div className="d-flex align-items-center justify-content-between mb-3 page-header-breadcrumb flex-wrap gap-2 mt-4">
        <div>
          <h1 className="page-title fw-medium fs-20 mb-0">Inventory Movements</h1>
          <div className="text-muted fs-12 mt-1">
            Track historical stock changes including Sales, Purchases, Returns, and Adjustments.
          </div>
        </div>
      </div>

      <Card className="custom-card">
        <Card.Header className="justify-content-between">
          <div className="card-title">Movement Logs</div>
          <div className="d-flex gap-2">
             <Form.Control
                type="text"
                placeholder="Search product or ref..."
                value={query}
                onChange={e => setQuery(e.target.value)}
             />
             <Form.Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="All">All Types</option>
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
                <option value="adjustment">Adjustment</option>
             </Form.Select>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <SpkTables
              tableClass="text-nowrap table-hover mb-0"
              header={[
                { title: 'Date' },
                { title: 'Product' },
                { title: 'Type' },
                { title: 'Quantity' },
                { title: 'Reference' },
                { title: 'Notes' },
              ]}
            >
              {paginatedMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted p-4">No movement records found.</td>
                </tr>
              ) : paginatedMovements.map(m => (
                <tr key={m.id}>
                  <td>
                    <span className="text-muted fs-12">{new Date(m.created_at).toLocaleString()}</span>
                  </td>
                  <td>
                    <div className="fw-semibold">{m.product?.product_name || 'Unknown'}</div>
                    <div className="fs-12 text-muted font-monospace">{m.product?.barcode}</div>
                  </td>
                  <td>
                    <SpkBadge 
                      variant="" 
                      Customclass={`badge bg-${m.type === 'in' ? 'success' : m.type === 'out' ? 'danger' : 'warning'}-transparent`}
                    >
                      {m.type.toUpperCase()}
                    </SpkBadge>
                  </td>
                  <td>
                    <span className={`fw-bold ${m.type === 'in' ? 'text-success' : m.type === 'out' ? 'text-danger' : 'text-warning'}`}>
                      {m.type === 'in' ? '+' : m.type === 'out' ? '-' : ''}{m.quantity} {m.product?.unit}
                    </span>
                  </td>
                  <td>
                    <div className="fw-medium">{m.reference_type || '-'}</div>
                    <div className="fs-12 text-muted">{m.reference_id || ''}</div>
                  </td>
                  <td>
                    <span className="text-muted fs-12">{m.notes || '-'}</span>
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

    </Fragment>
  )
}

export default InventoryPage
