'use client'

import React, { Fragment, useState, useEffect } from 'react'
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap'
import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import {
  Student,
  AttendanceStatus,
  getStudentsByClass,
  availableClasses,
  availableSections,
  mockStudents,
} from '@/shared/data/school/attendancedata'
import Image from 'next/image'

interface MarkAttendanceProps {}

const MarkAttendance: React.FC<MarkAttendanceProps> = () => {
  const [selectedClass, setSelectedClass] = useState<string>('10')
  const [selectedSection, setSelectedSection] = useState<string>('A')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceStatus>
  >({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const filtered = getStudentsByClass(selectedClass, selectedSection)
    setStudents(filtered)
    // Initialize attendance with default 'Present' status
    const initialAttendance: Record<string, AttendanceStatus> = {}
    filtered.forEach((student) => {
      initialAttendance[student.studentId] = 'Present'
    })
    setAttendance(initialAttendance)
  }, [selectedClass, selectedSection])

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleBulkAction = (status: AttendanceStatus) => {
    const newAttendance: Record<string, AttendanceStatus> = {}
    students.forEach((student) => {
      newAttendance[student.studentId] = status
    })
    setAttendance(newAttendance)
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('Saving attendance:', {
      class: selectedClass,
      section: selectedSection,
      date: selectedDate,
      attendance,
    })
    setSaving(false)
    alert('Attendance saved successfully!')
  }

  const getStatusColor = (status: AttendanceStatus): string => {
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

  const stats = {
    present: Object.values(attendance).filter((s) => s === 'Present').length,
    absent: Object.values(attendance).filter((s) => s === 'Absent').length,
    late: Object.values(attendance).filter((s) => s === 'Late').length,
    excused: Object.values(attendance).filter((s) => s === 'Excused').length,
    halfDay: Object.values(attendance).filter((s) => s === 'Half Day').length,
    total: students.length,
  }

  return (
    <Fragment>
      <Row className="mb-4">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Select Class & Date</div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Class</Form.Label>
                    <Form.Select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          Class {cls}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Section</Form.Label>
                    <Form.Select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                    >
                      {availableSections.map((sec) => (
                        <option key={sec} value={sec}>
                          Section {sec}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between">
              <div className="card-title">
                Mark Attendance - Class {selectedClass} Section{' '}
                {selectedSection}
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => handleBulkAction('Present')}
                >
                  Mark All Present
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleBulkAction('Absent')}
                >
                  Mark All Absent
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table className="table text-nowrap">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      students.map((student, index) => (
                        <tr key={student.id}>
                          <td>{index + 1}</td>
                          <td>{student.studentId}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {student.avatar ? (
                                <div className="avatar avatar-sm avatar-rounded">
                                  <Image
                                    src={student.avatar}
                                    width={28}
                                    height={28}
                                    alt={student.name}
                                  />
                                </div>
                              ) : (
                                <div className="avatar avatar-sm avatar-rounded bg-primary">
                                  {student.name.charAt(0)}
                                </div>
                              )}
                              <span className="fw-semibold">
                                {student.name}
                              </span>
                            </div>
                          </td>
                          <td>
                            <SpkBadge
                              variant={getStatusColor(
                                attendance[student.studentId] || 'Present'
                              )}
                              Customclass="rounded-pill"
                            >
                              {attendance[student.studentId] || 'Present'}
                            </SpkBadge>
                          </td>
                          <td>
                            <Form.Select
                              size="sm"
                              value={attendance[student.studentId] || 'Present'}
                              onChange={(e) =>
                                handleStatusChange(
                                  student.studentId,
                                  e.target.value as AttendanceStatus
                                )
                              }
                              style={{ width: '150px' }}
                            >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Late">Late</option>
                              <option value="Excused">Excused</option>
                              <option value="Half Day">Half Day</option>
                            </Form.Select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            <Card.Footer>
              <Row>
                <Col md={12}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <span className="text-muted">Summary: </span>
                      <SpkBadge variant="success" Customclass="ms-2">
                        Present: {stats.present}
                      </SpkBadge>
                      <SpkBadge variant="danger" Customclass="ms-2">
                        Absent: {stats.absent}
                      </SpkBadge>
                      <SpkBadge variant="warning" Customclass="ms-2">
                        Late: {stats.late}
                      </SpkBadge>
                      <SpkBadge variant="info" Customclass="ms-2">
                        Excused: {stats.excused}
                      </SpkBadge>
                      <SpkBadge variant="secondary" Customclass="ms-2">
                        Half Day: {stats.halfDay}
                      </SpkBadge>
                    </div>
                    <div>
                      <span className="fw-semibold">
                        Total: {stats.total} students
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default MarkAttendance
