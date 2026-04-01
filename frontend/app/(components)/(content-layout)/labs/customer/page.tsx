'use client'

import React, { Fragment } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row } from 'react-bootstrap'

const CustomerList: React.FC = () => {
  return (
    <Fragment>
      <Seo title="Customer List" />
      <Pageheader
        title="Labs"
        subtitle="Customer Management"
        currentpage="Customer List"
        activepage="Customer List"
      />

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Customer List</div>
            </Card.Header>
            <Card.Body>
              {/* Empty state or table placeholder */}
              <div className="text-center p-5 text-muted">
                <p>Customer List Table Integration will go here.</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default CustomerList
