'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons'
import { Card, Col, Row, Form, Offcanvas, Modal, Button } from 'react-bootstrap'

const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

const PurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [supplierId, setSupplierId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState<any[]>([])

  const fetchPurchases = async () => {
    try {
      const res = await fetch('/api/v1/point-plus/purchases?per_page=1000')
      if (res.ok) {
        const data = await res.json()
        setPurchases(data.data || data)
      }
    } catch (e) { console.error(e) }
  }

  const fetchDependencies = async () => {
    try {
      const [supRes, prodRes] = await Promise.all([
        fetch('/api/v1/point-plus/suppliers?per_page=1000'),
        fetch('/api/v1/point-plus/products?per_page=1000')
      ])
      if (supRes.ok) {
        const supData = await supRes.json()
        setSuppliers(supData.data || supData)
      }
      if (prodRes.ok) {
        const prodData = await prodRes.json()
        setProducts(prodData.data || prodData)
      }
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    fetchPurchases()
    fetchDependencies()
  }, [])

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, price: 0 }])
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return alert('Add at least one item')
    
    setSubmitting(true)
    try {
      const payload = {
        supplier_id: supplierId,
        invoice_number: invoiceNumber,
        purchase_date: purchaseDate,
        items: items.map(i => ({
          product_id: i.product_id,
          quantity: Number(i.quantity),
          price: Number(i.price)
        }))
      }

      const res = await fetch('/api/v1/point-plus/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to record purchase')
        return
      }

      setShowAddForm(false)
      setSupplierId('')
      setInvoiceNumber('')
      setItems([])
      fetchPurchases()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Fragment>
      <Seo title="Purchasing" />
      <div className="d-flex align-items-center justify-content-between mb-3 page-header-breadcrumb flex-wrap gap-2 mt-4">
        <div>
          <h1 className="page-title fw-medium fs-20 mb-0">Purchase System</h1>
          <div className="text-muted fs-12 mt-1">
            Manage purchase orders, goods receiving, and invoice recording.
          </div>
        </div>
        <SpkButton variant="primary" Customclass="btn btn-wave" onClickfunc={() => setShowAddForm(true)}>
          <i className="ri-add-line me-1"></i>New Purchase Order
        </SpkButton>
      </div>

      <Card className="custom-card">
        <Card.Header>
          <div className="card-title">Purchase History</div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <SpkTables
              tableClass="text-nowrap table-hover mb-0"
              header={[
                { title: 'Date' },
                { title: 'Invoice No' },
                { title: 'Supplier' },
                { title: 'Total Items' },
                { title: 'Total Amount' },
                { title: 'Status' },
              ]}
            >
              {purchases.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-4">No purchases found.</td></tr>
              ) : purchases.map(p => (
                <tr key={p.id}>
                  <td>{p.purchase_date}</td>
                  <td><div className="font-monospace text-primary fw-medium">{p.invoice_number || '-'}</div></td>
                  <td>{p.supplier?.supplier_name || '-'}</td>
                  <td>{p.items?.reduce((acc: number, curr: any) => acc + curr.quantity, 0) || 0}</td>
                  <td className="fw-semibold text-danger">{currency.format(p.total)}</td>
                  <td>
                    <span className={`badge bg-${p.status === 'completed' ? 'success' : 'warning'}-transparent`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </SpkTables>
          </div>
        </Card.Body>
      </Card>

      <Offcanvas placement="end" show={showAddForm} onHide={() => setShowAddForm(false)} style={{ width: '600px' }}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Record New Purchase</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3 h-100">
            <Row className="g-3">
              <Col md={12}>
                <Form.Label>Supplier *</Form.Label>
                <Form.Select required value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                  <option value="">Select Supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Invoice Number</Form.Label>
                <Form.Control value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>Purchase Date *</Form.Label>
                <Form.Control type="date" required value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
              </Col>
            </Row>

            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">Purchase Items</Form.Label>
                <Button variant="outline-primary" size="sm" onClick={addItem}>+ Add Item</Button>
              </div>
              
              {items.map((item, index) => (
                <Card className="custom-card mb-2 bg-light border" key={index}>
                  <Card.Body className="p-3">
                    <Row className="g-2">
                      <Col md={12}>
                        <Form.Select required value={item.product_id} onChange={e => updateItem(index, 'product_id', e.target.value)}>
                          <option value="">Select Product...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
                        </Form.Select>
                      </Col>
                      <Col md={5}>
                        <Form.Control type="number" min={1} required placeholder="Qty" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
                      </Col>
                      <Col md={5}>
                        <Form.Control type="number" min={0} required placeholder="Unit Price" value={item.price} onChange={e => updateItem(index, 'price', e.target.value)} />
                      </Col>
                      <Col md={2}>
                        <Button variant="danger" className="w-100" onClick={() => removeItem(index)}><i className="ri-delete-bin-line"></i></Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
              {items.length === 0 && <div className="text-muted fs-12 text-center p-3 border border-dashed rounded">No items added yet.</div>}
            </div>

            <div className="mt-auto pt-3 border-top">
              <div className="d-flex justify-content-between mb-3 fw-bold fs-18">
                <span>Total Amount:</span>
                <span className="text-primary">{currency.format(items.reduce((acc, curr) => acc + (Number(curr.price) * Number(curr.quantity)), 0))}</span>
              </div>
              <Button type="submit" variant="primary" className="w-100 btn-wave btn-lg" disabled={submitting}>
                {submitting ? 'Recording...' : 'Confirm & Receive Goods'}
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

    </Fragment>
  )
}

export default PurchasesPage
