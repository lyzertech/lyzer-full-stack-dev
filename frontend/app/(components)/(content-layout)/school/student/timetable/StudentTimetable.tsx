'use client'

import React, { Fragment, useState, useMemo } from 'react'
import { Card, Col, Form, Row, Table } from 'react-bootstrap'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'

interface StudentTimetableProps {}

interface TimetableSlot {
  subject: string
  teacher: string
  room: string
}

interface TimetableData {
  [grade: string]: {
    [room: string]: {
      [day: string]: {
        [timeSlot: string]: TimetableSlot
      }
    }
  }
}

const StudentTimetable: React.FC<StudentTimetableProps> = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>('1')
  const [selectedRoom, setSelectedRoom] = useState<string>('1')

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  const timeSlots = [
    { time: '07:00 - 07:45', period: '1' },
    { time: '07:45 - 08:30', period: '2' },
    { time: '08:30 - 09:15', period: '3' },
    { time: '09:15 - 10:00', period: '4' },
    { time: '10:00 - 10:30', period: 'Break' },
    { time: '10:30 - 11:15', period: '5' },
    { time: '11:15 - 12:00', period: '6' },
    { time: '12:00 - 12:45', period: '7' },
    { time: '12:45 - 13:30', period: 'Lunch' },
    { time: '13:30 - 14:15', period: '8' },
    { time: '14:15 - 15:00', period: '9' },
  ]

  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'Indonesian',
    'Social Studies',
    'Physical Education',
    'Arts',
    'Religion',
    'Computer Science',
    'Music',
  ]

  const teachers = [
    'Mr. Ahmad Fauzi',
    'Ms. Siti Rahmawati',
    'Mr. Budi Santoso',
    'Ms. Dewi Lestari',
    'Mr. Rizky Pratama',
    'Ms. Nina Wulandari',
    'Mr. Agus Setiawan',
    'Ms. Fitri Handayani',
  ]

  // Generate mock timetable data
  const generateTimetableData = (): TimetableData => {
    const data: TimetableData = {}

    for (let grade = 1; grade <= 6; grade++) {
      data[grade.toString()] = {}
      for (let room = 1; room <= 10; room++) {
        data[grade.toString()][room.toString()] = {}
        days.forEach((day) => {
          data[grade.toString()][room.toString()][day] = {}
          timeSlots.forEach((slot) => {
            if (slot.period === 'Break' || slot.period === 'Lunch') {
              data[grade.toString()][room.toString()][day][slot.period] = {
                subject: slot.period,
                teacher: '',
                room: '',
              }
            } else {
              const periodNum =
                slot.period === 'Break' || slot.period === 'Lunch'
                  ? 0
                  : parseInt(slot.period, 10)
              const subjectIndex =
                (grade + room + days.indexOf(day) + periodNum) % subjects.length
              const teacherIndex =
                (grade + room + days.indexOf(day) + periodNum) % teachers.length
              data[grade.toString()][room.toString()][day][slot.period] = {
                subject: subjects[subjectIndex],
                teacher: teachers[teacherIndex],
                room: `Room ${room}`,
              }
            }
          })
        })
      }
    }

    return data
  }

  const timetableData = useMemo(() => generateTimetableData(), [])

  const currentTimetable = useMemo(() => {
    return timetableData[selectedGrade]?.[selectedRoom] || {}
  }, [selectedGrade, selectedRoom, timetableData])

  const getSubjectColor = (subject: string): string => {
    if (subject === 'Break' || subject === 'Lunch') return 'secondary'
    const colors = [
      'primary',
      'success',
      'info',
      'warning',
      'danger',
      // 'dark',
      'primary',
      'success',
      'info',
      'warning',
      'danger',
    ]
    const index = subjects.indexOf(subject)
    return colors[index % colors.length] || 'primary'
  }

  return (
    <Fragment>
      <Seo title="Student Timetable" />

      <Pageheader
        title="School"
        subtitle="Student"
        currentpage="Lesson Timetable"
        activepage="Lesson Timetable"
      />

      <Row className="mb-4">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Select Grade & Room</div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Grade</Form.Label>
                    <Form.Select
                      value={selectedGrade}
                      onChange={(e) => {
                        setSelectedGrade(e.target.value)
                        setSelectedRoom('1') // Reset room when grade changes
                      }}
                    >
                      {Array.from({ length: 6 }, (_, i) => i + 1).map(
                        (grade) => (
                          <option key={grade} value={grade.toString()}>
                            Grade {grade}
                          </option>
                        )
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Room</Form.Label>
                    <Form.Select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(
                        (room) => (
                          <option key={room} value={room.toString()}>
                            Room {room}
                          </option>
                        )
                      )}
                    </Form.Select>
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
                Timetable - Grade {selectedGrade}, Room {selectedRoom}
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table
                  className="table text-nowrap table-bordered mb-0"
                  style={{
                    color: 'var(--default-text-color)',
                    borderColor: 'var(--default-border)',
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          minWidth: '120px',
                          position: 'sticky',
                          left: 0,
                          backgroundColor: 'var(--default-background)',
                          color: 'var(--default-text-color)',
                          zIndex: 10,
                        }}
                      >
                        Time
                      </th>
                      {days.map((day) => (
                        <th
                          key={day}
                          style={{
                            minWidth: '200px',
                            color: 'var(--default-text-color)',
                          }}
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot) => (
                      <tr key={slot.period}>
                        <td
                          style={{
                            position: 'sticky',
                            left: 0,
                            backgroundColor: 'var(--default-background)',
                            color: 'var(--default-text-color)',
                            zIndex: 9,
                            fontWeight: 'semibold',
                          }}
                        >
                          <div>
                            <div
                              className="fw-semibold"
                              style={{ color: 'var(--default-text-color)' }}
                            >
                              {slot.time}
                            </div>
                            <div
                              className="fs-11"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Period {slot.period}
                            </div>
                          </div>
                        </td>
                        {days.map((day) => {
                          const cellData =
                            currentTimetable[day]?.[slot.period] ||
                            ({
                              subject: '',
                              teacher: '',
                              room: '',
                            } as TimetableSlot)

                          if (
                            slot.period === 'Break' ||
                            slot.period === 'Lunch'
                          ) {
                            return (
                              <td
                                key={day}
                                className="text-center align-middle"
                                style={{
                                  backgroundColor: 'var(--light-rgb)',
                                  color: 'var(--default-text-color)',
                                  fontWeight: 'semibold',
                                }}
                              >
                                {slot.period}
                              </td>
                            )
                          }

                          return (
                            <td
                              key={day}
                              style={{
                                minHeight: '80px',
                                color: 'var(--default-text-color)',
                              }}
                            >
                              {cellData.subject ? (
                                <div className="p-2">
                                  <SpkBadge
                                    variant={getSubjectColor(cellData.subject)}
                                    Customclass="mb-2 d-block"
                                  >
                                    {cellData.subject}
                                  </SpkBadge>
                                  <div
                                    className="fs-12 mb-1"
                                    style={{ color: 'var(--text-muted)' }}
                                  >
                                    <i className="ri-user-line me-1"></i>
                                    {cellData.teacher}
                                  </div>
                                  <div
                                    className="fs-12"
                                    style={{ color: 'var(--text-muted)' }}
                                  >
                                    <i className="ri-building-line me-1"></i>
                                    {cellData.room}
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="p-2 text-center"
                                  style={{ color: 'var(--text-muted)' }}
                                >
                                  -
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Legend: </span>
                  {subjects.slice(0, 5).map((subject, idx) => (
                    <SpkBadge
                      key={subject}
                      variant={getSubjectColor(subject)}
                      Customclass="ms-2"
                    >
                      {subject}
                    </SpkBadge>
                  ))}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Total Periods:{' '}
                    {
                      timeSlots.filter(
                        (s) => s.period !== 'Break' && s.period !== 'Lunch'
                      ).length
                    }{' '}
                    per day
                  </span>
                </div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default StudentTimetable
