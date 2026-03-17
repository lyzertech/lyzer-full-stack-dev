'use client'

import React, { Fragment, useState, useMemo } from 'react'
import { Card, Col, Form, Row, Pagination } from 'react-bootstrap'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import {
  mockAttendanceRecords,
  availableClasses,
  availableSections,
  AttendanceRecord,
} from '@/shared/data/school/attendancedata'
import Image from 'next/image'

interface AttendanceHistoryProps {}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = () => {
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 10

  const filteredRecords = useMemo(() => {
    let filtered: AttendanceRecord[] = [...mockAttendanceRecords]

    if (selectedClass) {
      filtered = filtered.filter((r) => r.class === selectedClass)
    }
    if (selectedSection) {
      filtered = filtered.filter((r) => r.section === selectedSection)
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.studentName.toLowerCase().includes(term) ||
          r.studentId.toLowerCase().includes(term) ||
          r.date.includes(term)
      )
    }

    return filtered.sort((a, b) => {
      // Sort by date descending
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [selectedClass, selectedSection, searchTerm])

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Present':
        return 'success'
      case 'Absent':
        return 'danger'
      case 'Late':
        return 'warning'
      case 'Excused':
        return 'info'
      case 'Half Day':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <Fragment>
      <Row className="mb-4">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Filter & Search</div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Class</Form.Label>
                    <Form.Select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value)
                        setCurrentPage(1)
                      }}
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
                      onChange={(e) => {
                        setSelectedSection(e.target.value)
                        setCurrentPage(1)
                      }}
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
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Search</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by student name, ID, or date..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between">
              <div className="card-title">
                Attendance History ({filteredRecords.length} records)
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <SpkTables
                  tableClass="text-nowrap table-hover"
                  header={[
                    { title: 'Date' },
                    { title: 'Student ID' },
                    { title: 'Student Name' },
                    { title: 'Class' },
                    { title: 'Section' },
                    { title: 'Status' },
                    { title: 'Check In' },
                    { title: 'Check Out' },
                    { title: 'Remarks' },
                    { title: 'Marked By' },
                  ]}
                >
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-4">
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record) => (
                      <tr key={record.id}>
                        <td>
                          <span className="fw-semibold">{record.date}</span>
                        </td>
                        <td>{record.studentId}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar avatar-sm avatar-rounded bg-primary">
                              {record.studentName.charAt(0)}
                            </div>
                            <span className="fw-semibold">
                              {record.studentName}
                            </span>
                          </div>
                        </td>
                        <td>Class {record.class}</td>
                        <td>Section {record.section}</td>
                        <td>
                          <SpkBadge
                            variant={getStatusColor(record.status)}
                            Customclass="rounded-pill"
                          >
                            {record.status}
                          </SpkBadge>
                        </td>
                        <td>
                          {record.checkInTime ? (
                            <span className="text-success">
                              {record.checkInTime}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {record.checkOutTime ? (
                            <span className="text-info">
                              {record.checkOutTime}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {record.remarks ? (
                            <span className="text-muted">{record.remarks}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div>
                            <span className="d-block fw-semibold">
                              {record.markedBy}
                            </span>
                            <span className="fs-11 text-muted">
                              {new Date(record.markedAt).toLocaleString()}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </SpkTables>
              </div>
            </Card.Body>
            {totalPages > 1 && (
              <Card.Footer>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredRecords.length
                    )}{' '}
                    of {filteredRecords.length} entries
                  </div>
                  <div>
                    <Pagination className="mb-0">
                      <Pagination.Prev
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                      >
                        Prev
                      </Pagination.Prev>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Pagination.Item
                            key={page}
                            active={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Pagination.Item>
                        )
                      )}
                      <Pagination.Next
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        Next
                      </Pagination.Next>
                    </Pagination>
                  </div>
                </div>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default AttendanceHistory
