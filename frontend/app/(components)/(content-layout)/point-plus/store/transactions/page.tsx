'use client'

import React, { Fragment, useEffect, useState, useMemo } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons'
import { Card, Col, Row, Pagination, Form, Modal, Button } from 'react-bootstrap'

type Transaction = {
  id: number
  transaction_number: string
  subtotal: number
  discount: number
  tax: number
  total: number
  payment_method: string
  amount_paid: number
  change: number
  status: string
  created_at: string
  items: any[]
}

const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const pageSize = 15

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/point-plus/transactions?per_page=1000')
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.data || data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return transactions.filter(t => 
      t.transaction_number.toLowerCase().includes(q) || 
      t.payment_method.toLowerCase().includes(q)
    )
  }, [transactions, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = pageStart + pageSize
  const paginatedTrx = filtered.slice(pageStart, pageEnd)

  const handleViewDetails = (trx: Transaction) => {
    setSelectedTrx(trx)
    setShowReceipt(true)
  }

  return (
    <Fragment>
      <Seo title="Sales Transactions" />
      <div className="d-flex align-items-center justify-content-between mb-3 page-header-breadcrumb flex-wrap gap-2 mt-4">
        <div>
          <h1 className="page-title fw-medium fs-20 mb-0">Sales Transactions</h1>
          <div className="text-muted fs-12 mt-1">
            History of all retail transactions completed in the store.
          </div>
        </div>
      </div>

      <Card className="custom-card">
        <Card.Header className="justify-content-between">
          <div className="card-title">Activity Log</div>
          <div className="d-flex gap-2">
             <Form.Control
                type="text"
                placeholder="Search transaction #..."
                value={query}
                onChange={e => setQuery(e.target.value)}
             />
             <Button variant="light" className="btn-icon" onClick={fetchTransactions}>
               <i className="ri-refresh-line"></i>
             </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <SpkTables
              tableClass="text-nowrap table-hover mb-0"
              header={[
                { title: 'Date' },
                { title: 'Transaction #' },
                { title: 'Method' },
                { title: 'Subtotal' },
                { title: 'Discount' },
                { title: 'Total' },
                { title: 'Status' },
                { title: 'Actions' },
              ]}
            >
              {loading ? (
                <tr><td colSpan={8} className="text-center p-4">Loading transactions...</td></tr>
              ) : paginatedTrx.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted p-4">No transactions found.</td></tr>
              ) : paginatedTrx.map(t => (
                <tr key={t.id}>
                  <td>
                    <span className="text-muted fs-12">{new Date(t.created_at).toLocaleString()}</span>
                  </td>
                  <td>
                    <div className="font-monospace fw-semibold text-primary">{t.transaction_number}</div>
                  </td>
                  <td>{t.payment_method}</td>
                  <td>{currency.format(t.subtotal)}</td>
                  <td className="text-danger">-{currency.format(t.discount)}</td>
                  <td className="fw-bold text-success">{currency.format(t.total)}</td>
                  <td>
                    <SpkBadge variant="" Customclass="badge bg-success-transparent">
                      {t.status.toUpperCase()}
                    </SpkBadge>
                  </td>
                  <td>
                    <SpkButton 
                      Buttonvariant="primary-light" 
                      Customclass="btn btn-icon btn-sm rounded-circle me-1"
                      onClickfunc={() => handleViewDetails(t)}
                    >
                      <i className="ri-eye-line"></i>
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

      {/* Receipt Details Modal */}
      <Modal show={showReceipt} onHide={() => setShowReceipt(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
           <Modal.Title className="fs-16">Transaction Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <div className="p-3 bg-light rounded font-monospace fs-12 shadow-sm border border-dashed border-primary">
            <div className="text-center mb-3">
              <h5 className="mb-0 fw-bold">POINT+ MART</h5>
              <div>123 Retail Street, City</div>
              <div className="mt-2 border-bottom border-dashed pb-2">
                TRX: {selectedTrx?.transaction_number} <br />
                Date: {selectedTrx && new Date(selectedTrx.created_at).toLocaleString()} <br />
                Cashier: Admin
              </div>
            </div>
            
            <div className="mb-2">
              {selectedTrx?.items?.map((item: any) => (
                <div key={item.id} className="d-flex justify-content-between mb-1">
                  <div style={{ maxWidth: '60%' }}>
                    {item.product?.product_name || 'Deleted Product'} <br/>
                    {item.quantity} x {currency.format(item.price)}
                  </div>
                  <div className="text-end">
                    {currency.format(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-top border-dashed pt-2">
              <div className="d-flex justify-content-between">
                <span>Subtotal</span><span>{currency.format(selectedTrx?.subtotal || 0)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Discount</span><span>-{currency.format(selectedTrx?.discount || 0)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Tax</span><span>+{currency.format(selectedTrx?.tax || 0)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-14 mt-1 pt-1 border-top border-dashed">
                <span>TOTAL</span><span>{currency.format(selectedTrx?.total || 0)}</span>
              </div>
            </div>

            <div className="border-top border-dashed pt-2 mt-2">
              <div className="d-flex justify-content-between">
                <span>Paid ({selectedTrx?.payment_method})</span><span>{currency.format(selectedTrx?.amount_paid || 0)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold">
                <span>Change</span><span>{currency.format(selectedTrx?.change || 0)}</span>
              </div>
            </div>

            <div className="text-center mt-4">
              <i className="ri-checkbox-circle-line fs-24 text-success"></i>
              <div className="mt-1">Transaction Completed</div>
            </div>
          </div>
          <Button variant="primary" className="w-100 mt-3 btn-wave" onClick={() => window.print()}>
            <i className="ri-printer-line me-2"></i>Print Receipt
          </Button>
        </Modal.Body>
      </Modal>

    </Fragment>
  )
}

export default TransactionsPage
