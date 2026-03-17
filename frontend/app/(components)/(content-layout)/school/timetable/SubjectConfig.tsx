import React, { useState } from 'react'
import { Button, Card, Form, Modal, Row, Col } from 'react-bootstrap'
import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'

interface SubjectConfigProps {
  subjects: string[]
  onAddSubject: (subjectName: string) => void
  getSubjectColor: (subject: string) => string
  selectedGrade?: string
}

const SubjectConfig: React.FC<SubjectConfigProps> = ({
  subjects,
  onAddSubject,
  getSubjectColor,
  selectedGrade,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    grade: '',
    semester: '1',
    type: 'elective',
    hours_per_week: 0,
    is_active: true,
  })

  const [grades, setGrades] = useState<any[]>([])
  const [gradesLoading, setGradesLoading] = useState(false)

  React.useEffect(() => {
    const fetchGrades = async () => {
      setGradesLoading(true)
      try {
        const res = await fetch('/api/school/grades', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load grades')
        const rows = await res.json()
        // Aggregate by grade id/level/name
        const map = new Map<
          number,
          { id: number; name: string; level: number }
        >()
        for (const r of rows) {
          const id = r.id
          if (!map.has(id)) {
            map.set(id, {
              id,
              name: r.name || `Grade ${r.level}`,
              level: r.level,
            })
          }
        }
        const gradeListArr = Array.from(map.values())
        setGrades(gradeListArr)
        if (gradeListArr.length && !form.grade) {
          let defaultId = gradeListArr[0].id
          if (selectedGrade) {
            const g = gradeListArr.find((x) => {
              const label =
                x.name && String(x.name).trim()
                  ? String(x.name)
                  : `Grade ${x.level}`
              return label === selectedGrade
            })
            if (g) defaultId = g.id
          }
          setForm((prev) => ({
            ...prev,
            grade: String(defaultId),
          }))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setGradesLoading(false)
      }
    }

    fetchGrades()
  }, [])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        grade: Number(form.grade),
        semester: Number(form.semester),
        type: form.type,
        hours_per_week: Number(form.hours_per_week) || 0,
        is_active: !!form.is_active,
      }

      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Failed to create subject')
      }

      const created = await res.json()
      // inform parent to update list
      onAddSubject(created.name)
      setShowModal(false)
      setForm({
        code: '',
        name: '',
        description: '',
        grade: '',
        semester: '1',
        type: 'elective',
        hours_per_week: 0,
        is_active: true,
      })
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to create subject')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card className="custom-card h-100">
        <Card.Header className="justify-content-between">
          <div className="card-title">Subjects</div>
          <Button
            size="sm"
            variant="primary-light"
            onClick={() => setShowModal(true)}
          >
            + Add Subject
          </Button>
        </Card.Header>
        <Card.Body>
          <Form.Text style={{ color: 'var(--text-muted)' }}>
            These subjects will be available to assign in the timetable.
          </Form.Text>
          <div className="mt-3 d-flex flex-wrap gap-2">
            {subjects.map((subject, idx) => (
              <SpkBadge
                key={subject + idx}
                variant={getSubjectColor(subject)}
                Customclass="mb-1"
              >
                {subject}
              </SpkBadge>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Add Subject</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <div className="alert alert-danger">{error}</div>}

            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="subjectCode">
                  <Form.Label>Code</Form.Label>
                  <Form.Control
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="subjectName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="subjectDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="subjectGrade">
                  <Form.Label>Grade</Form.Label>
                  <Form.Select
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                  >
                    {gradesLoading && <option>Loading...</option>}
                    {!gradesLoading &&
                      grades.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="subjectSemester">
                  <Form.Label>Semester</Form.Label>
                  <Form.Select
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="subjectType">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="mandatory">Mandatory</option>
                    <option value="elective">Elective</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="subjectHours">
                  <Form.Label>Hours / Week</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    name="hours_per_week"
                    value={form.hours_per_week}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="d-flex align-items-center">
                <Form.Check
                  type="checkbox"
                  label="Active"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
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
    </>
  )
}

export default SubjectConfig
