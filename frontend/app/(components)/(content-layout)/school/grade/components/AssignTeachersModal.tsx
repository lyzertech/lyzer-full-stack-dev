'use client'

import React, { useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import type { Room } from './gradeTypes'
import { apiClient } from '@/lib/api-client'

interface Props {
  show: boolean
  onHide: () => void
  rooms: Room[]
  teachers: any[]
  onSaved: () => void
}

const AssignTeachersModal: React.FC<Props> = ({
  show,
  onHide,
  rooms,
  teachers,
  onSaved,
}) => {
  const [assignRooms, setAssignRooms] = useState<any[]>(rooms || [])
  const [assignSubmitting, setAssignSubmitting] = useState(false)

  React.useEffect(() => {
    setAssignRooms(
      (rooms || []).map((r) => ({
        ...r,
        teacherId: (r as any).teacher_id || (r as any).teacherId || '',
      }))
    )
  }, [rooms])

  const handleAssignChange = (index: number, teacherId: any) => {
    setAssignRooms((prev) =>
      prev.map((r, i) => (i === index ? { ...r, teacherId } : r))
    )
  }

  const saveAssignChanges = async () => {
    if (assignSubmitting) return
    setAssignSubmitting(true)
    try {
      const promises = assignRooms.map((r) =>
        apiClient.patch('/school/grades', {
          roomId: r.id,
          teacherId: r.teacherId ? Number(r.teacherId) : null,
        })
      )
      await Promise.all(promises)

      onHide()
      onSaved()
    } catch (err: any) {
      console.error(err)
      const json = err.response?.data
      alert(json?.error || err.message || 'Failed to save assignments')
    } finally {
      setAssignSubmitting(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Assign Teachers to Rooms</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {assignRooms.length === 0 && (
          <div className="text-muted">No rooms to assign</div>
        )}

        {assignRooms.map((r: any, i: number) => (
          <Row className="g-3 mb-2" key={r.id}>
            <Col md={6} className="d-flex align-items-center">
              <div className="fw-semibold">{r.name}</div>
            </Col>
            <Col md={6}>
              <Form.Select
                value={r.teacherId ?? ''}
                onChange={(e) =>
                  handleAssignChange(
                    i,
                    e.target.value ? Number(e.target.value) : ''
                  )
                }
              >
                <option value="">Unassigned</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
          disabled={assignSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={saveAssignChanges}
          disabled={assignSubmitting}
        >
          {assignSubmitting ? 'Saving...' : 'Save Assignments'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AssignTeachersModal
