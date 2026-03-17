'use client'

import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'

interface Props {
  show: boolean
  onHide: () => void
  studentIds: number[]
  onSaved: () => void
}

const BulkAssignModal: React.FC<Props> = ({
  show,
  onHide,
  studentIds,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false)
  const [grades, setGrades] = useState<any[]>([])
  const [selectedGrade, setSelectedGrade] = useState<number | ''>('')
  const [rooms, setRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!show) return
    setError(null)
    // fetch grades and nested rooms
    fetch('/api/school/grades', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        // aggregate grades with rooms
        const map = new Map<number, any>()
        for (const r of data) {
          const id = r.id
          if (!map.has(id)) {
            map.set(id, { id, name: r.name, rooms: [] })
          }
          if (r.roomId) {
            map.get(id).rooms.push({ id: r.roomId, name: r.roomName })
          }
        }
        setGrades(Array.from(map.values()))
      })
      .catch((e) => {
        console.error('Failed to load grades', e)
        setGrades([])
      })
  }, [show])

  useEffect(() => {
    const g = grades.find((g) => g.id === selectedGrade)
    setRooms(g ? g.rooms || [] : [])
    setSelectedRoom('')
  }, [selectedGrade, grades])

  const handleSave = async () => {
    if (studentIds.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/school/students/bulk-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds,
          grade: selectedGrade || null,
          room: selectedRoom || null,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || 'Bulk assign failed')
      }
      onHide()
      onSaved()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to assign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Assign Selected Students</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="small text-muted mb-2">
          Selected students: {studentIds.length}
        </div>
        {error && <div className="alert alert-danger">{error}</div>}

        <Row className="g-3">
          <Col md={6}>
            <Form.Group controlId="bulkGrade">
              <Form.Label>Grade</Form.Label>
              <Form.Select
                value={selectedGrade}
                onChange={(e) =>
                  setSelectedGrade(e.target.value ? Number(e.target.value) : '')
                }
              >
                <option value="">No change</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="bulkRoom">
              <Form.Label>Room</Form.Label>
              <Form.Select
                value={selectedRoom}
                onChange={(e) =>
                  setSelectedRoom(e.target.value ? Number(e.target.value) : '')
                }
              >
                <option value="">No change</option>
                <option value="-1">Clear room</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Assign'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default BulkAssignModal
