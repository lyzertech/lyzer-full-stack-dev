'use client'

import React, { Fragment, useState, useEffect, useRef, useMemo } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row, Button, Form, Modal, InputGroup } from 'react-bootstrap'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

type Product = {
  id: number
  barcode: string
  sku: string | null
  product_name: string
  selling_price: number
  stock: number
  unit: string
}

type CartItem = {
  product: Product
  quantity: number
  discount: number
}

const POSPage: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  
  const [transactionDiscount, setTransactionDiscount] = useState<number>(0)
  const [taxRate, setTaxRate] = useState<number>(0) // E.g., 0.11 for 11%
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash')
  const [amountPaid, setAmountPaid] = useState<number>(0)
  
  const [checkoutModal, setCheckoutModal] = useState(false)
  const [receiptModal, setReceiptModal] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScanTimeRef = useRef<number>(0)

  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

  useEffect(() => {
    fetchProducts()
    
    // Global keyboard listener for fast workflow
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 to focus search/barcode input
      if (e.key === 'F2') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      // F9 to checkout
      if (e.key === 'F9' && cart.length > 0) {
        e.preventDefault()
        setCheckoutModal(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cart])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/v1/point-plus/products?per_page=1000') // Fetch all for local search in this phase
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.data)) {
          setProducts(data.data)
        } else if (Array.isArray(data)) {
          setProducts(data)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode)
    if (product) {
      addToCart(product)
    } else {
      // Optional: show toast for not found
      console.warn('Product not found:', barcode)
    }
  }

  useEffect(() => {
    if (isScanning) {
      setCameraError(null)
      const html5QrCode = new Html5Qrcode("reader")
      scannerRef.current = html5QrCode

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 300, height: 150 },
          useBarCodeDetectorIfSupported: true,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E, Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_128
          ],
        },
        (decodedText) => {
          const now = Date.now()
          if (now - lastScanTimeRef.current < 1500) return
          lastScanTimeRef.current = now
          handleScan(decodedText)
        },
        () => {}
      ).catch((err) => {
        setCameraError("Camera failed. Please check permissions.")
        html5QrCode.start(
          { facingMode: "user" },
          { fps: 10, qrbox: { width: 300, height: 150 } },
          (decodedText) => { 
             const now = Date.now()
             if (now - lastScanTimeRef.current < 1500) return
             lastScanTimeRef.current = now
             handleScan(decodedText)
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
  }, [isScanning, products])

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('Insufficient stock!')
          return prev
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      if (product.stock < 1) {
        alert('Insufficient stock!')
        return prev
      }
      return [{ product, quantity: 1, discount: 0 }, ...prev]
    })
  }

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const newCart = [...prev]
      const item = newCart[index]
      const newQ = item.quantity + delta
      if (newQ > item.product.stock) {
         alert('Insufficient stock!')
         return prev
      }
      if (newQ <= 0) {
        newCart.splice(index, 1)
      } else {
        item.quantity = newQ
      }
      return newCart
    })
  }

  const updateItemDiscount = (index: number, discount: number) => {
    setCart(prev => {
      const newCart = [...prev]
      newCart[index].discount = discount
      return newCart
    })
  }

  const removeFromCart = (index: number) => {
    setCart(prev => {
      const newCart = [...prev]
      newCart.splice(index, 1)
      return newCart
    })
  }

  const cartTotals = useMemo(() => {
    let subtotal = 0
    cart.forEach(item => {
      subtotal += (item.product.selling_price - item.discount) * item.quantity
    })
    const tax = (subtotal - transactionDiscount) * taxRate
    const total = subtotal - transactionDiscount + tax
    return { subtotal, tax, total }
  }, [cart, transactionDiscount, taxRate])

  const handleCheckout = async () => {
    try {
      const payload = {
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        discount: transactionDiscount,
        tax: cartTotals.tax,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.selling_price,
          discount: item.discount
        }))
      }

      const res = await fetch('/api/v1/point-plus/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Checkout failed')
        return
      }

      const transaction = await res.json()
      setLastTransaction(transaction)
      setCheckoutModal(false)
      setCart([])
      setTransactionDiscount(0)
      setAmountPaid(0)
      setReceiptModal(true)
      fetchProducts() // Refresh stock
    } catch (error) {
      console.error(error)
      alert('Checkout failed')
    }
  }

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return
    const product = products.find(p => p.barcode === searchQuery || p.sku === searchQuery || p.product_name.toLowerCase() === searchQuery.toLowerCase())
    if (product) {
      addToCart(product)
      setSearchQuery('')
    } else {
      alert('Product not found')
    }
  }

  return (
    <Fragment>
      <Seo title="Point+ POS" />
      <div className="d-flex align-items-center justify-content-between mb-3 page-header-breadcrumb flex-wrap gap-2 mt-4">
        <div>
          <h1 className="page-title fw-medium fs-20 mb-0">POS / Cashier</h1>
          <div className="text-muted fs-12 mt-1">
            Fast checkout interface. Press F2 to search, F9 to checkout.
          </div>
        </div>
      </div>
      
      <Row>
        <Col xl={8}>
          <Card className="custom-card mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center py-2">
              <div className="card-title mb-0">Input Items</div>
              <Button 
                variant={isScanning ? "danger" : "primary-light"} 
                onClick={() => setIsScanning(!isScanning)}
                className="btn-wave btn-sm"
              >
                <i className={`ri-${isScanning ? 'close' : 'camera'}-line me-1 align-middle`} />
                {isScanning ? 'Stop Camera' : 'Camera Scanner'}
              </Button>
            </Card.Header>
            <Card.Body className="py-3">
              <div className={`mb-3 ${isScanning ? '' : 'd-none'}`}>
                {cameraError && <div className="alert alert-danger text-center p-2 fs-12">{cameraError}</div>}
                <div className="d-flex justify-content-center">
                  <div id="reader" style={{ width: '100%', maxWidth: '300px', overflow: 'hidden', borderRadius: '8px' }}></div>
                </div>
              </div>
              
              <Form onSubmit={handleManualSearch}>
                <InputGroup>
                  <InputGroup.Text><i className="ri-barcode-line"></i></InputGroup.Text>
                  <Form.Control
                    ref={searchInputRef}
                    placeholder="Scan barcode or enter product name/SKU (F2)"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                    className="form-control-lg bg-light border-0"
                  />
                  <Button type="submit" variant="primary">Add</Button>
                </InputGroup>
              </Form>
            </Card.Body>
          </Card>

          <Card className="custom-card">
            <Card.Header className="py-2"><div className="card-title mb-0">Current Order</div></Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                <table className="table table-hover text-nowrap table-bordered mb-0">
                  <thead className="table-light position-sticky top-0">
                    <tr>
                      <th className="w-50">Item</th>
                      <th>Price</th>
                      <th className="text-center">Qty</th>
                      <th>Disc</th>
                      <th>Total</th>
                      <th className="text-center"><i className="ri-settings-4-line"></i></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length === 0 ? (
                      <tr><td colSpan={6} className="text-center p-4 text-muted">Cart is empty. Scan or search to add items.</td></tr>
                    ) : cart.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-semibold">{item.product.product_name}</div>
                          <div className="text-muted fs-12 font-monospace">{item.product.barcode}</div>
                        </td>
                        <td className="align-middle">{currency.format(item.product.selling_price)}</td>
                        <td className="align-middle text-center">
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <Button variant="light" size="sm" className="btn-icon rounded-circle" onClick={() => updateQuantity(index, -1)}>-</Button>
                            <span className="fw-bold px-2">{item.quantity}</span>
                            <Button variant="light" size="sm" className="btn-icon rounded-circle" onClick={() => updateQuantity(index, 1)}>+</Button>
                          </div>
                        </td>
                        <td className="align-middle">
                          <Form.Control
                            type="number"
                            size="sm"
                            style={{ width: '80px' }}
                            value={item.discount || ''}
                            onChange={(e) => updateItemDiscount(index, Number(e.target.value))}
                            placeholder="Rp 0"
                          />
                        </td>
                        <td className="align-middle fw-medium text-success">
                          {currency.format((item.product.selling_price - item.discount) * item.quantity)}
                        </td>
                        <td className="align-middle text-center">
                          <Button variant="danger-light" size="sm" className="btn-icon rounded-circle" onClick={() => removeFromCart(index)}>
                            <i className="ri-delete-bin-line"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="custom-card bg-primary-transparent border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fs-18 fw-medium text-primary">Total Amount</span>
                <span className="fs-24 fw-bold text-primary">{currency.format(cartTotals.total)}</span>
              </div>
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="d-flex justify-content-between text-muted">
                  <span>Subtotal</span>
                  <span>{currency.format(cartTotals.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between text-muted align-items-center">
                  <span>Discount</span>
                  <Form.Control
                    type="number"
                    size="sm"
                    className="bg-white"
                    style={{ width: '100px', textAlign: 'right' }}
                    value={transactionDiscount || ''}
                    onChange={(e) => setTransactionDiscount(Number(e.target.value))}
                  />
                </div>
                <div className="d-flex justify-content-between text-muted align-items-center">
                  <span>Tax Rate</span>
                  <Form.Select size="sm" className="bg-white" style={{ width: '100px' }} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))}>
                    <option value={0}>0%</option>
                    <option value={0.11}>11%</option>
                  </Form.Select>
                </div>
              </div>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100 btn-wave fs-18 fw-bold" 
                disabled={cart.length === 0}
                onClick={() => setCheckoutModal(true)}
              >
                PAY NOW (F9)
              </Button>
              <Button 
                variant="outline-danger" 
                className="w-100 mt-2 btn-wave"
                disabled={cart.length === 0}
                onClick={() => { setCart([]); setTransactionDiscount(0) }}
              >
                Cancel Order
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Checkout Modal */}
      <Modal show={checkoutModal} onHide={() => setCheckoutModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title className="fs-16">Payment Checkout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div className="text-muted fs-12">Amount to Pay</div>
            <div className="fs-24 fw-bold text-primary">{currency.format(cartTotals.total)}</div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {['Cash', 'QRIS', 'Transfer', 'Debit/Credit'].map(method => (
                <Button 
                  key={method}
                  variant={paymentMethod === method ? "primary" : "outline-light"}
                  className="flex-fill"
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </Button>
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Amount Paid (Cash)</Form.Label>
            <Form.Control
              type="number"
              size="lg"
              autoFocus
              className="text-end fw-bold"
              value={amountPaid || ''}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
            />
            {amountPaid > 0 && amountPaid - cartTotals.total >= 0 && paymentMethod === 'Cash' && (
              <div className="d-flex justify-content-between mt-2 text-success fw-bold">
                <span>Change:</span>
                <span>{currency.format(amountPaid - cartTotals.total)}</span>
              </div>
            )}
          </Form.Group>
          
          <Button 
            variant="success" 
            size="lg" 
            className="w-100 btn-wave"
            disabled={(paymentMethod === 'Cash' && amountPaid < cartTotals.total)}
            onClick={handleCheckout}
          >
            Confirm Payment
          </Button>
        </Modal.Body>
      </Modal>

      {/* Receipt Modal */}
      <Modal show={receiptModal} onHide={() => setReceiptModal(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
        <Modal.Body className="pt-0">
          <div id="receipt-print-area" className="p-3 bg-light rounded font-monospace fs-12">
            <div className="text-center mb-3">
              <h5 className="mb-0 fw-bold">POINT+ MART</h5>
              <div>123 Retail Street, City</div>
              <div className="mt-2 border-bottom border-dashed pb-2">
                TRX: {lastTransaction?.transaction_number} <br />
                Date: {new Date(lastTransaction?.created_at).toLocaleString()} <br />
                Cashier: Admin
              </div>
            </div>
            
            <div className="mb-2">
              {lastTransaction?.items.map((item: any) => (
                <div key={item.id} className="d-flex justify-content-between mb-1">
                  <div style={{ maxWidth: '60%' }}>
                    {item.product.product_name} <br/>
                    {item.quantity} x {item.price}
                  </div>
                  <div className="text-end">
                    {item.subtotal}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-top border-dashed pt-2">
              <div className="d-flex justify-content-between">
                <span>Subtotal</span><span>{lastTransaction?.subtotal}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Discount</span><span>-{lastTransaction?.discount}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Tax</span><span>+{lastTransaction?.tax}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-14 mt-1 pt-1 border-top border-dashed">
                <span>TOTAL</span><span>{lastTransaction?.total}</span>
              </div>
            </div>

            <div className="border-top border-dashed pt-2 mt-2">
              <div className="d-flex justify-content-between">
                <span>Paid ({lastTransaction?.payment_method})</span><span>{lastTransaction?.amount_paid}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold">
                <span>Change</span><span>{lastTransaction?.change}</span>
              </div>
            </div>

            <div className="text-center mt-4">
              <i className="ri-qr-code-line fs-24"></i>
              <div className="mt-1">Thank you for shopping!</div>
            </div>
          </div>
          <Button variant="primary" className="w-100 mt-3 btn-wave" onClick={() => {
             // In a real app, send to printer or open print window
             window.print()
          }}>
            <i className="ri-printer-line me-2"></i>Print Receipt
          </Button>
        </Modal.Body>
      </Modal>

    </Fragment>
  )
}

export default POSPage
