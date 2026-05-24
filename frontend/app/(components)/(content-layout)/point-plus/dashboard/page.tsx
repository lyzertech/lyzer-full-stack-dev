'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row } from 'react-bootstrap'
import dynamic from 'next/dynamic'
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/point-plus/dashboard/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(e => {
        console.error(e)
        setLoading(false)
      })
  }, [])

  if (loading || !data) return <div className="p-5 text-center">Loading Dashboard...</div>

  const chartOptions: any = {
    chart: { type: 'area', height: 320, toolbar: { show: false } },
    colors: ['#4ade80'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: data.sales_chart?.map((c: any) => c.date) || [] },
    yaxis: { labels: { formatter: (val: number) => currency.format(val) } }
  }

  const chartSeries = [{
    name: 'Sales',
    data: data.sales_chart?.map((c: any) => c.total) || []
  }]

  return (
    <Fragment>
      <Seo title="Point+ Dashboard" />
      <div className="d-flex align-items-center justify-content-between mb-3 page-header-breadcrumb mt-4">
        <div>
          <h1 className="page-title fw-medium fs-20 mb-0">Retail Analytics</h1>
          <div className="text-muted fs-12 mt-1">Overview of store performance.</div>
        </div>
      </div>

      <Row>
        <Col xl={3} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fs-12 mb-1">Today's Sales</div>
                  <h4 className="fw-bold mb-0">{currency.format(data.cards.today_sales)}</h4>
                </div>
                <div className="avatar avatar-md bg-success-transparent rounded-circle">
                  <i className="ri-wallet-3-line fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fs-12 mb-1">Today's Transactions</div>
                  <h4 className="fw-bold mb-0">{data.cards.today_transactions}</h4>
                </div>
                <div className="avatar avatar-md bg-primary-transparent rounded-circle">
                  <i className="ri-shopping-cart-2-line fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fs-12 mb-1">Total Products</div>
                  <h4 className="fw-bold mb-0">{data.cards.total_products}</h4>
                </div>
                <div className="avatar avatar-md bg-info-transparent rounded-circle">
                  <i className="ri-box-3-line fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted fs-12 mb-1">Low Stock Alerts</div>
                  <h4 className="fw-bold mb-0 text-danger">{data.cards.low_stock_alerts}</h4>
                </div>
                <div className="avatar avatar-md bg-danger-transparent rounded-circle">
                  <i className="ri-error-warning-line fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={8}>
          <Card className="custom-card">
            <Card.Header><div className="card-title">Sales Trend (Last 7 Days)</div></Card.Header>
            <Card.Body>
              <div id="sales-chart">
                <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={320} />
              </div>
            </Card.Body>
          </Card>

          <Card className="custom-card">
            <Card.Header><div className="card-title">Recent Transactions</div></Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="table table-hover text-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>TRX Number</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_transactions?.map((t: any) => (
                      <tr key={t.id}>
                        <td><span className="font-monospace text-primary">{t.transaction_number}</span></td>
                        <td>{new Date(t.created_at).toLocaleString()}</td>
                        <td>{t.payment_method}</td>
                        <td className="fw-medium text-success">{currency.format(t.total)}</td>
                        <td><span className={`badge bg-${t.status === 'completed' ? 'success' : 'warning'}-transparent`}>{t.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={4}>
          <Card className="custom-card">
            <Card.Header><div className="card-title">Low Stock Items</div></Card.Header>
            <Card.Body className="p-0">
              <ul className="list-group list-group-flush">
                {data.low_stock_products?.length === 0 ? (
                  <li className="list-group-item text-center text-muted p-4">All stocks are healthy</li>
                ) : data.low_stock_products?.map((p: any) => (
                  <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">{p.product_name}</div>
                      <div className="fs-12 text-muted">Min: {p.minimum_stock}</div>
                    </div>
                    <span className="badge bg-danger-transparent fs-14">{p.stock} {p.unit}</span>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Fragment>
  )
}

export default DashboardPage
