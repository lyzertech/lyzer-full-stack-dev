'use client'

import React, { Fragment } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row } from 'react-bootstrap'
import Link from 'next/link'

const REPORT_TYPES = [
  {
    title: 'Fleet Overview',
    description: 'Summary of all vehicles, statuses, and utilization metrics.',
    icon: 'ri-car-fill',
    color: 'primary',
    href: '/vehicle/dashboard',
  },
  {
    title: 'Work Order Report',
    description: 'All maintenance work orders, costs, and completion rates by period.',
    icon: 'ri-file-list-3-fill',
    color: 'info',
    href: '/vehicle/work-orders',
  },
  {
    title: 'Fuel Consumption',
    description: 'Fuel usage, cost per vehicle, and efficiency (KM/L) trends.',
    icon: 'ri-gas-station-fill',
    color: 'warning',
    href: '/vehicle/fuel-logs',
  },
  {
    title: 'Maintenance Reminders',
    description: 'Overdue, upcoming, and completed service reminders.',
    icon: 'ri-alarm-warning-fill',
    color: 'danger',
    href: '/vehicle/reminders',
  },
  {
    title: 'Sparepart Inventory',
    description: 'Current stock levels, low stock alerts, and movement history.',
    icon: 'ri-tools-fill',
    color: 'success',
    href: '/vehicle/spareparts',
  },
  {
    title: 'Inspection Reports',
    description: 'Vehicle health scores and inspection checklist results.',
    icon: 'ri-clipboard-fill',
    color: 'secondary',
    href: '/vehicle/inspections',
  },
]

export default function ReportsPage() {
  return (
    <Fragment>
      <Seo title="Vehicle Reports" />
      <Pageheader title="Vehicle" subtitle="Reports" currentpage="Reports" activepage="Fleet Management" />

      <Row className="g-3">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title mb-0">
                <i className="ri-bar-chart-2-fill me-2 text-primary" />
                Fleet Reports & Analytics
              </div>
            </Card.Header>
            <Card.Body>
              <p className="text-muted fs-14 mb-4">
                Access detailed reports for each area of your fleet management system. Click on a report type to view the data.
              </p>
              <Row className="g-3">
                {REPORT_TYPES.map((r) => (
                  <Col key={r.title} xl={4} md={6}>
                    <Link href={r.href} className="text-decoration-none">
                      <Card className={`custom-card border-2 border-${r.color} border-opacity-25 h-100`}
                        style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease', cursor: 'pointer' }}>
                        <Card.Body className="d-flex align-items-start gap-3 p-4">
                          <div className={`avatar avatar-lg bg-${r.color}-transparent rounded-2 flex-shrink-0`}>
                            <i className={`${r.icon} fs-24 text-${r.color}`} />
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">{r.title}</h6>
                            <p className="text-muted fs-12 mb-0">{r.description}</p>
                          </div>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}
