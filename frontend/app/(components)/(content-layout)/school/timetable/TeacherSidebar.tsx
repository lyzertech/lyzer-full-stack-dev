import React from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import type { Teacher } from '../teacher/list/ListTable'

interface TeacherSidebarProps {
  teachersLoading: boolean
  teachersError: string | null
  teacherList: Teacher[]
  onAddTeacher: () => void
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  teachersLoading,
  teachersError,
  teacherList,
  onAddTeacher,
}) => {
  return (
    <Card className="custom-card h-100">
      <Card.Header className="justify-content-between">
        <div className="card-title">Teachers</div>
        {/* <Button size="sm" variant="primary-light" onClick={onAddTeacher}>
          + Add Teacher
        </Button> */}
      </Card.Header>
      <Card.Body>
        <Form.Text style={{ color: 'var(--text-muted)' }}>
          Map teachers to lessons in each period.
        </Form.Text>

        <ul className="mt-3 list-unstyled mb-0">
          {teachersLoading && (
            <li className="text-muted">Loading teachers...</li>
          )}

          {!teachersLoading && teachersError && (
            <li className="text-danger">{teachersError}</li>
          )}

          {!teachersLoading && !teachersError && teacherList.length === 0 && (
            <li className="text-muted">No teachers found</li>
          )}

          {!teachersLoading &&
            !teachersError &&
            teacherList.map((teacher) => (
              <li key={teacher.id} className="mb-1">
                <i className="ri-user-3-line me-1 text-primary"></i>
                {teacher.name}
              </li>
            ))}
        </ul>
      </Card.Body>
    </Card>
  )
}

export default TeacherSidebar
