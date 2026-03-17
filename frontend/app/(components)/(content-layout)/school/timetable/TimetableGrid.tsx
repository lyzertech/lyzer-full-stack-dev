import React from 'react'
import { Card, Form, Row, Table, Col } from 'react-bootstrap'
import { DayName, PeriodDef, TimetableCell } from './timetableTypes'

interface TimetableGridProps {
  days: DayName[]
  periods: PeriodDef[]
  selectedGrade: string
  selectedRoom: string
  currentTimetable: {
    [day in DayName]?: {
      [periodId: string]: TimetableCell
    }
  }
  subjects: string[]
  teachers: string[]
  updateCell: (
    day: DayName,
    periodId: string,
    field: keyof TimetableCell,
    value: string
  ) => void
}

const TimetableGrid: React.FC<TimetableGridProps> = ({
  days,
  periods,
  selectedGrade,
  selectedRoom,
  currentTimetable,
  subjects,
  teachers,
  updateCell,
}) => {
  return (
    <Row>
      <Col xxl={12}>
        <Card className="custom-card">
          <Card.Header className="justify-content-between">
            <div className="card-title">
              Lesson Timetable - {/* Grade  */}
              {selectedGrade}, {/* Room  */}
              {selectedRoom}
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
                        minWidth: '140px',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: 'var(--default-background)',
                        color: 'var(--default-text-color)',
                        zIndex: 10,
                      }}
                    >
                      Time / Period
                    </th>
                    {days.map((day) => (
                      <th
                        key={day}
                        style={{
                          minWidth: '220px',
                          color: 'var(--default-text-color)',
                        }}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => (
                    <tr key={period.id}>
                      <td
                        style={{
                          position: 'sticky',
                          left: 0,
                          backgroundColor: 'var(--default-background)',
                          color: 'var(--default-text-color)',
                          zIndex: 9,
                        }}
                      >
                        <div className="fw-semibold">{period.time}</div>
                        <div
                          className="fs-11"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Period {period.label}
                        </div>
                      </td>
                      {days.map((day) => {
                        const dayData = currentTimetable[day] || {}
                        const cellData = dayData[period.id] || {
                          subject: '',
                          teacher: '',
                          room: `Room ${selectedRoom}`,
                        }

                        const isBreak =
                          period.label.toLowerCase() === 'break' ||
                          period.label.toLowerCase() === 'lunch'

                        if (isBreak) {
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
                              {period.label}
                            </td>
                          )
                        }

                        return (
                          <td key={day}>
                            <div className="mb-2">
                              <Form.Select
                                size="sm"
                                value={cellData.subject}
                                onChange={(e) =>
                                  updateCell(
                                    day,
                                    period.id,
                                    'subject',
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select Subject</option>
                                {subjects.map((subject) => (
                                  <option key={subject} value={subject}>
                                    {subject}
                                  </option>
                                ))}
                              </Form.Select>
                            </div>
                            <div className="mb-1">
                              <Form.Select
                                size="sm"
                                value={cellData.teacher}
                                onChange={(e) =>
                                  updateCell(
                                    day,
                                    period.id,
                                    'teacher',
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select Teacher</option>
                                {teachers.map((teacher) => (
                                  <option key={teacher} value={teacher}>
                                    {teacher}
                                  </option>
                                ))}
                              </Form.Select>
                            </div>
                            <div
                              className="fs-12"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <i className="ri-building-line me-1"></i>
                              {cellData.room}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default TimetableGrid
