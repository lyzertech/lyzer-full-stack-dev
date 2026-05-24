'use client'

import React, { Fragment } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row, Form, Button } from 'react-bootstrap'

const SettingsPage: React.FC = () => {

  return (
    <Fragment>
      <Seo title="Store Settings" />
      <div className="d-flex align-items-center justify-content-between mb-3 page-header-breadcrumb mt-4">
        <div>
          <h1 className="page-title fw-medium fs-20 mb-0">Store Settings</h1>
          <div className="text-muted fs-12 mt-1">Configure your receipt printing and general store preferences.</div>
        </div>
      </div>

      <Row>
        <Col xl={6}>
          <Card className="custom-card">
            <Card.Header><div className="card-title">General Preferences</div></Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Store Name</Form.Label>
                  <Form.Control defaultValue="POINT+ MART" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Store Address</Form.Label>
                  <Form.Control as="textarea" rows={2} defaultValue="123 Retail Street, City" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Default Tax Rate (%)</Form.Label>
                  <Form.Control type="number" defaultValue="11" />
                </Form.Group>
                <Button variant="primary">Save Changes</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="custom-card">
            <Card.Header><div className="card-title">Hardware & Printing</div></Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Thermal Printer Model</Form.Label>
                  <Form.Select>
                    <option>Generic ESC/POS (80mm)</option>
                    <option>Generic ESC/POS (58mm)</option>
                    <option>Epson TM Series</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check type="switch" label="Auto-print receipt on checkout" defaultChecked />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check type="switch" label="Enable barcode scanner beep sound" defaultChecked />
                </Form.Group>
                <Button variant="primary">Save Hardware Config</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Fragment>
  )
}

export default SettingsPage
