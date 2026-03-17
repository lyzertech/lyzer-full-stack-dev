'use client'

import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import React, { Fragment, useEffect, useState } from 'react'
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap'
import ListTable, { Teacher } from './ListTable'

interface TeacherListProps {}

const TeacherList: React.FC<TeacherListProps> = () => {
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [form, setForm] = useState({
    name: '',
    degree: '',
    email: '',
    subject: '',
    nip: '',
    gender: 'Male',
    status: 'Active',
    jobType: 'Permanent',
    joinDate: '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await fetch('/api/teachers', {
          method: 'GET',
          cache: 'no-store',
        })
        if (!res.ok) return
        const json = await res.json()
        setTeachers(json)
      } catch (e) {
        console.error(e)
      }
    }
    fetchInitial()
  }, [])

  // Auto-generate NIP when opening the Add Teacher modal: YYYYMMDD + nextId (padded)
  useEffect(() => {
    if (!showModal) return

    const nextId =
      teachers && teachers.length > 0
        ? Math.max(...teachers.map((t) => t.id)) + 1
        : 1

    const now = new Date()
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    const padded = String(nextId).padStart(3, '0')
    const autoNip = `${ymd}${padded}`

    setForm((prev) => ({ ...prev, nip: autoNip }))
  }, [showModal, teachers])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Failed to save teacher')
      }
      const created: Teacher = await res.json()
      setTeachers((prev) => [...prev, created])
      setShowModal(false)
      setForm({
        name: '',
        degree: '',
        email: '',
        subject: '',
        nip: '',
        gender: 'Male',
        status: 'Active',
        jobType: 'Permanent',
        joinDate: '',
      })
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to save teacher')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Fragment>
      <Seo title="Teacher List" />

      <Pageheader
        title="School"
        subtitle="Teacher"
        currentpage="Teacher List"
        activepage="Teacher List"
      />

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between">
              <div className="card-title">All Teacher List</div>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  className="btn-wave"
                  onClick={() => setShowModal(true)}
                >
                  <i className="ri-add-line me-1 align-middle" />
                  Add Teacher
                </Button>
              </div>
            </Card.Header>

            <Card.Body className="custom-data-table">
              <ListTable teachers={teachers} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Add Teacher</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <div className="alert alert-danger">{error}</div>}
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="teacherName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="teacherDegree">
                  <Form.Label>Degree</Form.Label>
                  <Form.Control
                    name="degree"
                    value={form.degree}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="teacherEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="teacherSubject">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="teacherNip">
                  <Form.Label>NIP / Employee Code</Form.Label>
                  <Form.Control
                    name="nip"
                    value={form.nip}
                    onChange={handleChange}
                    required
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    Automatically generated: YYYYMMDD + ID (e.g. 20251219001)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="teacherGender">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="teacherStatus">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="teacherJobType">
                  <Form.Label>Job Type</Form.Label>
                  <Form.Select
                    name="jobType"
                    value={form.jobType}
                    onChange={handleChange}
                  >
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Contract</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="teacherJoinDate">
                  <Form.Label>Join Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="joinDate"
                    value={form.joinDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Fragment>
  )
}

export default TeacherList
