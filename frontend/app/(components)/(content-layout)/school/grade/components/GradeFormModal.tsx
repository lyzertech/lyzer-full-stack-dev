'use client'

import React, { useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import type { Grade } from './gradeTypes'

interface Props {
  show: boolean
  onHide: () => void
  teachers: any[]
  onSaved: (created?: Grade) => void
}

const GradeFormModal: React.FC<Props> = ({
  show,
  onHide,
  teachers,
  onSaved,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<any>({
    name: '',
    level: 1,
    description: '',
    status: 'Active',
    rooms: [{ name: '', capacity: '', teacherId: '' }],
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm((prev: any) => ({ ...prev, [name]: value }))
  }

  const addRoom = () =>
    setForm((prev: any) => ({
      ...prev,
      rooms: [...prev.rooms, { name: '', capacity: '', teacherId: '' }],
    }))

  const removeRoom = (index: number) =>
    setForm((prev: any) => ({
      ...prev,
      rooms: prev.rooms.filter((_: any, i: number) => i !== index),
    }))

  const handleRoomChange = (index: number, field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      rooms: prev.rooms.map((r: any, i: number) =>
        i === index ? { ...r, [field]: value } : r
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload: any = {
        name: form.name,
        level: Number(form.level),
        description: form.description,
        status: form.status,
      }
      const rooms = (form.rooms || [])
        .filter((r: any) => r.name && r.name.trim() !== '')
        .map((r: any) => ({
          name: r.name.trim(),
          capacity: r.capacity ? Number(r.capacity) : null,
          teacherId: r.teacherId ? Number(r.teacherId) : null,
        }))
      if (rooms.length) payload.rooms = rooms

      const res = await fetch('/api/v1/school/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Failed to save grade')
      }

      const created: Grade = await res.json()
      onSaved(created)
      onHide()
      setForm({
        name: '',
        level: 1,
        description: '',
        status: 'Active',
        rooms: [{ name: '', capacity: '', teacherId: '' }],
      })
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to save grade')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Add Grade</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}

          <Row className="g-3">
            <Col md={8}>
              <Form.Group controlId="gradeName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="gradeLevel">
                <Form.Label>Level</Form.Label>
                <Form.Control
                  type="number"
                  name="level"
                  value={form.level as any}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="gradeStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group controlId="gradeDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                />
              </Form.Group>
            </Col>

            <Col
              md={12}
              className="mt-2 d-flex justify-content-between align-items-center"
            >
              <h6 className="mb-0">Rooms</h6>
              <div>
                <Button variant="link" className="me-2 p-0" onClick={addRoom}>
                  + Add Room
                </Button>
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() =>
                    setForm((prev: any) => ({
                      ...prev,
                      rooms: Array.from({ length: 10 }).map((_, i) => ({
                        name: `Room ${String.fromCharCode(65 + i)}`,
                        capacity: '',
                        teacherId: '',
                      })),
                    }))
                  }
                >
                  Add Rooms A-J
                </Button>
              </div>
            </Col>

            {(form.rooms || []).map((r: any, i: number) => (
              <React.Fragment key={i}>
                <Col md={5}>
                  <Form.Group controlId={`roomName-${i}`}>
                    <Form.Label>Room Name</Form.Label>
                    <Form.Control
                      value={r.name}
                      onChange={(e) =>
                        handleRoomChange(i, 'name', e.target.value)
                      }
                      placeholder={`Room ${i + 1}`}
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group controlId={`roomTeacher-${i}`}>
                    <Form.Label>Teacher</Form.Label>
                    <Form.Select
                      value={r.teacherId ?? ''}
                      onChange={(e) =>
                        handleRoomChange(
                          i,
                          'teacherId',
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
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group controlId={`roomCapacity-${i}`}>
                    <Form.Label>Capacity</Form.Label>
                    <Form.Control
                      type="number"
                      value={r.capacity as any}
                      onChange={(e) =>
                        handleRoomChange(i, 'capacity', e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={2} className="d-flex align-items-end">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeRoom(i)}
                  >
                    Remove
                  </Button>
                </Col>
              </React.Fragment>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Grade'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default GradeFormModal
