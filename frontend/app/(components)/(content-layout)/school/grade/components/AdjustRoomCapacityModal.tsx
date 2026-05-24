'use client'

import React, { useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import type { Room } from './gradeTypes'

interface Props {
  show: boolean
  onHide: () => void
  rooms: Room[]
  onSaved: () => void
}

const AdjustRoomCapacityModal: React.FC<Props> = ({
  show,
  onHide,
  rooms,
  onSaved,
}) => {
  const [editedRooms, setEditedRooms] = useState<any[]>(rooms || [])
  const [submitting, setSubmitting] = useState(false)

  React.useEffect(() => {
    setEditedRooms(
      (rooms || []).map((r) => ({ ...r, capacity: r.capacity ?? '' }))
    )
  }, [rooms])

  const handleChange = (index: number, value: any) => {
    setEditedRooms((prev) =>
      prev.map((r, i) => (i === index ? { ...r, capacity: value } : r))
    )
  }

  const saveChanges = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const promises = editedRooms.map((r) =>
        fetch('/api/v1/school/grades', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: r.id,
            capacity:
              r.capacity === '' || r.capacity === null
                ? null
                : Number(r.capacity),
          }),
        })
      )
      const results = await Promise.all(promises)
      for (const res of results) {
        if (!res.ok) {
          const json = await res.json().catch(() => null)
          throw new Error(json?.error || 'Save failed')
        }
      }

      onHide()
      onSaved()
    } catch (err) {
      console.error(err)
      alert('Failed to save capacities')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Adjust Students per Room</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editedRooms.length === 0 && (
          <div className="text-muted">No rooms to adjust</div>
        )}

        {editedRooms.map((r: any, i: number) => (
          <Row className="g-3 mb-2" key={r.id}>
            <Col md={6} className="d-flex align-items-center">
              <div className="fw-semibold">{r.name}</div>
            </Col>
            <Col md={6}>
              <Form.Control
                type="number"
                min={0}
                value={r.capacity ?? ''}
                onChange={(e) => handleChange(i, e.target.value)}
                placeholder="Empty for no capacity"
              />
            </Col>
          </Row>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={saveChanges} disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AdjustRoomCapacityModal
