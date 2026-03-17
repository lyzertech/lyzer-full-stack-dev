'use client'

import React, { Fragment, useState, useMemo } from 'react'
import { Card, Col, Form, Row } from 'react-bootstrap'
import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import Spkapexcharts from '@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts'
import {
  mockAttendanceRecords,
  availableClasses,
  availableSections,
  calculateStats,
  AttendanceRecord,
} from '@/shared/data/school/attendancedata'

interface AttendanceReportsProps {}

const AttendanceReports: React.FC<AttendanceReportsProps> = () => {
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  const filteredRecords = useMemo(() => {
    let filtered: AttendanceRecord[] = [...mockAttendanceRecords]

    if (selectedClass) {
      filtered = filtered.filter((r) => r.class === selectedClass)
    }
    if (selectedSection) {
      filtered = filtered.filter((r) => r.section === selectedSection)
    }
    if (dateRange.start) {
      filtered = filtered.filter((r) => r.date >= dateRange.start)
    }
    if (dateRange.end) {
      filtered = filtered.filter((r) => r.date <= dateRange.end)
    }

    return filtered
  }, [selectedClass, selectedSection, dateRange])

  const stats = calculateStats(filteredRecords)

  // Prepare chart data
  const chartSeries = [
    {
      name: 'Attendance',
      data: [
        stats.present,
        stats.absent,
        stats.late,
        stats.excused,
        stats.halfDay,
      ],
    },
  ]

  const chartOptions = {
    chart: {
      type: 'bar' as const,
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['Present', 'Absent', 'Late', 'Excused', 'Half Day'],
    },
    yaxis: {
      title: {
        text: 'Number of Students',
      },
    },
    fill: {
      opacity: 1,
      colors: ['#5bcfc5', '#f72b50', '#ffc107', '#17a2b8', '#6c757d'],
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + ' students'
        },
      },
    },
    colors: ['#5bcfc5', '#f72b50', '#ffc107', '#17a2b8', '#6c757d'],
  }

  // Daily attendance trend (mock data)
  const dailyTrendSeries = [
    {
      name: 'Attendance Rate',
      data: [95, 92, 98, 94, 96, 93, 97, 95, 99, 94, 96, 98, 95, 97, 96],
    },
  ]

  const dailyTrendOptions = {
    chart: {
      type: 'line' as const,
      height: 350,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3,
    },
    xaxis: {
      categories: Array.from({ length: 15 }, (_, i) => `Day ${i + 1}`),
    },
    yaxis: {
      title: {
        text: 'Attendance Rate (%)',
      },
      min: 0,
      max: 100,
    },
    colors: ['#5bcfc5'],
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + '%'
        },
      },
    },
  }

  return (
    <Fragment>
      <Row className="mb-4">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Filter Reports</div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Class</Form.Label>
                    <Form.Select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      <option value="">All Classes</option>
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          Class {cls}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Section</Form.Label>
                    <Form.Select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                    >
                      <option value="">All Sections</option>
                      {availableSections.map((sec) => (
                        <option key={sec} value={sec}>
                          Section {sec}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xl={3} lg={6} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-muted">Total Students</p>
                  <h4 className="mb-0 fw-semibold">{stats.totalStudents}</h4>
                </div>
                <div className="avatar avatar-md bg-primary-transparent">
                  <i className="ri-user-line fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-muted">Present</p>
                  <h4 className="mb-0 fw-semibold text-success">
                    {stats.present}
                  </h4>
                </div>
                <div className="avatar avatar-md bg-success-transparent">
                  <i className="ri-checkbox-circle-line fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-muted">Absent</p>
                  <h4 className="mb-0 fw-semibold text-danger">
                    {stats.absent}
                  </h4>
                </div>
                <div className="avatar avatar-md bg-danger-transparent">
                  <i className="ri-close-circle-line fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-muted">Attendance Rate</p>
                  <h4 className="mb-0 fw-semibold text-primary">
                    {stats.attendanceRate}%
                  </h4>
                </div>
                <div className="avatar avatar-md bg-primary-transparent">
                  <i className="ri-bar-chart-line fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xl={6}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Attendance by Status</div>
            </Card.Header>
            <Card.Body>
              <div id="attendance-status-chart">
                <Spkapexcharts
                  height={350}
                  type="bar"
                  width="100%"
                  chartOptions={chartOptions}
                  chartSeries={chartSeries}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={6}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Daily Attendance Trend</div>
            </Card.Header>
            <Card.Body>
              <div id="daily-trend-chart">
                <Spkapexcharts
                  height={350}
                  type="line"
                  width="100%"
                  chartOptions={dailyTrendOptions}
                  chartSeries={dailyTrendSeries}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Status Breakdown</div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <SpkBadge variant="success" Customclass="rounded-pill">
                      Present
                    </SpkBadge>
                    <div>
                      <h5 className="mb-0">{stats.present}</h5>
                      <span className="text-muted fs-12">
                        {stats.totalStudents > 0
                          ? Math.round(
                              (stats.present / stats.totalStudents) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <SpkBadge variant="danger" Customclass="rounded-pill">
                      Absent
                    </SpkBadge>
                    <div>
                      <h5 className="mb-0">{stats.absent}</h5>
                      <span className="text-muted fs-12">
                        {stats.totalStudents > 0
                          ? Math.round(
                              (stats.absent / stats.totalStudents) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <SpkBadge variant="warning" Customclass="rounded-pill">
                      Late
                    </SpkBadge>
                    <div>
                      <h5 className="mb-0">{stats.late}</h5>
                      <span className="text-muted fs-12">
                        {stats.totalStudents > 0
                          ? Math.round((stats.late / stats.totalStudents) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <SpkBadge variant="info" Customclass="rounded-pill">
                      Excused
                    </SpkBadge>
                    <div>
                      <h5 className="mb-0">{stats.excused}</h5>
                      <span className="text-muted fs-12">
                        {stats.totalStudents > 0
                          ? Math.round(
                              (stats.excused / stats.totalStudents) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default AttendanceReports
