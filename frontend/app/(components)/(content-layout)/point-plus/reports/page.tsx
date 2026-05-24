'use client'

import React, { Fragment } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row, Button } from 'react-bootstrap'

const ReportsPage: React.FC = () => {

  return (
    <Fragment>
      <Seo title="Reports" />
      <div className="d-flex align-items-center justify-content-between mb-3 page-header-breadcrumb mt-4">
        <div>
          <h1 className="page-title fw-medium fs-20 mb-0">Analytics & Reports</h1>
          <div className="text-muted fs-12 mt-1">Export your store data and view extended reports.</div>
        </div>
      </div>

      <Row>
        <Col xl={4} md={6}>
          <Card className="custom-card">
            <Card.Body className="text-center p-5">
              <i className="ri-file-chart-line fs-50 text-primary mb-3"></i>
              <h5 className="fw-semibold mb-2">Sales Report</h5>
              <p className="text-muted mb-4 fs-12">Export daily, monthly, and yearly transaction records.</p>
              <Button variant="outline-primary" className="btn-wave">Generate Report</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4} md={6}>
          <Card className="custom-card">
            <Card.Body className="text-center p-5">
              <i className="ri-bar-chart-box-line fs-50 text-success mb-3"></i>
              <h5 className="fw-semibold mb-2">Best Selling Products</h5>
              <p className="text-muted mb-4 fs-12">Analyze top performing products by quantity and revenue.</p>
              <Button variant="outline-success" className="btn-wave">Generate Report</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4} md={6}>
          <Card className="custom-card">
            <Card.Body className="text-center p-5">
              <i className="ri-database-2-line fs-50 text-info mb-3"></i>
              <h5 className="fw-semibold mb-2">Inventory Valuation</h5>
              <p className="text-muted mb-4 fs-12">View current asset value based on purchase vs selling price.</p>
              <Button variant="outline-info" className="btn-wave">Generate Report</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Fragment>
  )
}

export default ReportsPage
