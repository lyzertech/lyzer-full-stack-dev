'use client'

import React, { Fragment, useState } from 'react'
import { Card, Col, Nav, Row, Tab } from 'react-bootstrap'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import MarkAttendance from './MarkAttendance'
import AttendanceReports from './AttendanceReports'
import AttendanceHistory from './AttendanceHistory'

interface AttendanceProps {}

const Attendance: React.FC<AttendanceProps> = () => {
  const [activeTab, setActiveTab] = useState<string>('mark')

  return (
    <Fragment>
      <Seo title="Attendance" />

      <Pageheader
        title="School"
        subtitle="Attendance"
        currentpage="Attendance Management"
        activepage="Attendance"
      />

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Attendance Management</div>
            </Card.Header>
            <Card.Body>
              <Tab.Container
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || 'mark')}
              >
                <Nav variant="tabs" className="nav-tabs-custom" role="tablist">
                  <Nav.Item>
                    <Nav.Link eventKey="mark">
                      <i className="ri-checkbox-circle-line me-1 align-middle"></i>
                      Mark Attendance
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="reports">
                      <i className="ri-bar-chart-line me-1 align-middle"></i>
                      Reports & Statistics
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="history">
                      <i className="ri-history-line me-1 align-middle"></i>
                      Attendance History
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content className="p-4">
                  <Tab.Pane eventKey="mark">
                    <MarkAttendance />
                  </Tab.Pane>
                  <Tab.Pane eventKey="reports">
                    <AttendanceReports />
                  </Tab.Pane>
                  <Tab.Pane eventKey="history">
                    <AttendanceHistory />
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default Attendance
