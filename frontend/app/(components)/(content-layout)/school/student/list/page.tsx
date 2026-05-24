'use client'

import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import React, { Fragment, useEffect, useState } from 'react'
import { Button, Card, Col, Row, Modal, Form } from 'react-bootstrap'
import SimpleStudentTable from './components/SimpleStudentTable'
import CompleteStudentTable from './components/CompleteStudentTable'

const StudentListPage: React.FC = () => {
  const [simpleStudents, setSimpleStudents] = useState<any[]>([])
  const [completeStudents, setCompleteStudents] = useState<any[]>([])
  const [loadingSimple, setLoadingSimple] = useState(true)
  const [loadingComplete, setLoadingComplete] = useState(true)
  const [simpleError, setSimpleError] = useState<string | null>(null)
  const [completeError, setCompleteError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<any>({ name: '', gender: 'Male', nis: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSimpleStudents()
    fetchCompleteStudents()
  }, [])

  async function fetchSimpleStudents() {
    setLoadingSimple(true)
    setSimpleError(null)
    try {
      const res = await fetch('/api/v1/school/students?simple=1', {
        cache: 'no-store',
      })
      if (!res.ok) {
        let msg = res.statusText
        try {
          const j = await res.json()
          msg = j?.error || JSON.stringify(j)
        } catch (e) {
          msg = await res.text().catch(() => res.statusText)
        }
        console.error('fetchSimpleStudents failed:', msg)
        setSimpleError(msg || 'Failed to fetch simple students')
        return
      }
      const data = await res.json()
      if (Array.isArray(data)) {
          setSimpleStudents(data)
      } else {
          setSimpleError(data?.error || data?.message || 'Invalid API response format')
          setSimpleStudents([])
      }
    } catch (err: any) {
      console.error('fetchSimpleStudents error:', err)
      setSimpleError(err.message || 'Failed to fetch simple students')
      setSimpleStudents([])
    } finally {
      setLoadingSimple(false)
    }
  }

  async function fetchCompleteStudents() {
    setLoadingComplete(true)
    setCompleteError(null)
    try {
      const res = await fetch('/api/v1/school/students?simple=0', {
        cache: 'no-store',
      })
      if (!res.ok) {
        let msg = res.statusText
        try {
          const j = await res.json()
          msg = j?.error || JSON.stringify(j)
        } catch (e) {
          msg = await res.text().catch(() => res.statusText)
        }
        console.error('fetchCompleteStudents failed:', msg)
        setCompleteError(msg || 'Failed to fetch complete students')
        return
      }
      const data = await res.json()
      if (Array.isArray(data)) {
          setCompleteStudents(data)
      } else {
          setCompleteError(data?.error || data?.message || 'Invalid API response format')
          setCompleteStudents([])
      }
    } catch (err: any) {
      console.error('fetchCompleteStudents error:', err)
      setCompleteError(err.message || 'Failed to fetch complete students')
      setCompleteStudents([])
    } finally {
      setLoadingComplete(false)
    }
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/school/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Failed to create student')
      }
      setShowModal(false)
      setForm({ name: '', gender: 'Male', nis: '' })
      // refresh both lists
      fetchSimpleStudents()
      fetchCompleteStudents()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to save student')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Fragment>
      <Seo title="Students" />
      <Pageheader
        title="School"
        subtitle="Students"
        currentpage="List"
        activepage="Students List"
      />

      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              className="btn-wave"
              onClick={() => setShowModal(true)}
            >
              <i className="ri-add-line me-1 align-middle" /> Add Student
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="g-3">
        <Col xl={6} lg={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between d-flex align-items-center">
              <div className="card-title">Simple Students</div>
              <div>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={fetchSimpleStudents}
                >
                  Refresh
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="custom-data-table">
              {simpleError && (
                <div className="alert alert-danger mb-2">{simpleError}</div>
              )}

              <SimpleStudentTable
                students={simpleStudents}
                loading={loadingSimple}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col xl={12} lg={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between d-flex align-items-center">
              <div className="card-title">Complete Students</div>
              <div>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={fetchCompleteStudents}
                >
                  Refresh
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="custom-data-table">
              {completeError && (
                <div className="alert alert-danger mb-2">{completeError}</div>
              )}

              <CompleteStudentTable
                students={completeStudents}
                loading={loadingComplete}
                onRefresh={fetchCompleteStudents}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Add Student</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <div className="alert alert-danger">{error}</div>}

            <Form.Group className="mb-3" controlId="studentName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="studentGender">
              <Form.Label>Gender</Form.Label>
              <Form.Select
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="studentNis">
              <Form.Label>NIS (optional)</Form.Label>
              <Form.Control
                name="nis"
                value={form.nis}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Leave blank to auto-generate
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Student'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Fragment>
  )
}

export default StudentListPage
