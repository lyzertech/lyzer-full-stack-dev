'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row } from 'react-bootstrap'
import GradeTable from './components/GradeTable'
import GradeFormModal from './components/GradeFormModal'
import AssignTeachersModal from './components/AssignTeachersModal'
import AdjustRoomCapacityModal from './components/AdjustRoomCapacityModal'
import type { Grade, Room } from './components/gradeTypes'
import { apiClient } from '@/lib/api-client'

const GradesPage: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [teachers, setTeachers] = useState<any[]>([])

  const [showModal, setShowModal] = useState(false)

  const [assignModalShow, setAssignModalShow] = useState(false)
  const [assignRooms, setAssignRooms] = useState<any[]>([])

  const [adjustModalShow, setAdjustModalShow] = useState(false)
  const [adjustRooms, setAdjustRooms] = useState<any[]>([])

  useEffect(() => {
    fetchGrades()
    fetchTeachers()
  }, [])

  // handlers passed to child components
  const onGradeCreated = (created?: Grade) => {
    // refresh list after a new grade is created
    fetchGrades()
  }

  const onAssignSaved = () => {
    // refresh grades after assignments updated
    fetchGrades()
  }

  const onAdjustSaved = () => {
    // refresh grades after capacities updated
    fetchGrades()
  }

  async function fetchTeachers() {
    try {
      const response = await apiClient.get('/school/teachers')
      setTeachers(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchGrades() {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/school/grades')
      const rows = response.data

      // rows may repeat grade per room (because of LEFT JOIN). Aggregate by id.
      const map = new Map<number, Grade>()
      for (const r of rows) {
        const id = r.id
        if (!map.has(id)) {
          map.set(id, {
            id: r.id,
            name: r.name,
            level: r.level,
            description: r.description,
            status: r.status,
            created_at: r.createdAt,
            updated_at: r.updatedAt,
            rooms: [],
          })
        }
        if (r.roomId) {
          map.get(id)!.rooms!.push({
            id: r.roomId,
            grade_id: id,
            name: r.roomName,
            capacity: r.roomCapacity,
            teacher_id: r.roomTeacherId || null,
            teacherId: r.roomTeacherId || null,
            teacherName: r.roomTeacherName || null,
          })
        }
      }

      setGrades(Array.from(map.values()))
    } catch (err) {
      console.error(err)
      setError('Failed to load grades from server')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this grade? This will also remove its rooms.')) return
    try {
      await apiClient.delete(`/school/grades?id=${id}`)
      setGrades((prev) => prev.filter((g) => g.id !== id))
    } catch (err: any) {
      console.error(err)
      const json = err.response?.data
      alert(json?.error || err.message || 'Failed to delete')
    }
  }

  const openAssignModal = (grade: Grade) => {
    setAssignRooms(
      (grade.rooms || []).map((r) => ({
        ...r,
        teacherId: (r as any).teacher_id || (r as any).teacherId || '',
      }))
    )
    setAssignModalShow(true)
  }

  const openAdjustModal = (grade: Grade) => {
    setAdjustRooms((grade.rooms || []).map((r) => ({ ...r })))
    setAdjustModalShow(true)
  }

  return (
    <Fragment>
      <Seo title="Grades" />
      <Pageheader
        title="School"
        subtitle="Grades"
        currentpage="Grades"
        activepage="Grades"
      />

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between d-flex align-items-center">
              <div className="card-title">All Grades</div>
              <div>
                <Button
                  variant="primary"
                  className="btn-wave"
                  onClick={() => setShowModal(true)}
                >
                  <i className="ri-add-line me-1 align-middle" /> Add Grade
                </Button>
              </div>
            </Card.Header>

            <Card.Body className="custom-data-table">
              <GradeTable
                grades={grades}
                loading={loading}
                error={error}
                onAssign={openAssignModal}
                onAdjust={openAdjustModal}
                onDelete={handleDelete}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <GradeFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        teachers={teachers}
        onSaved={onGradeCreated}
      />

      <AssignTeachersModal
        show={assignModalShow}
        onHide={() => setAssignModalShow(false)}
        rooms={assignRooms}
        teachers={teachers}
        onSaved={onAssignSaved}
      />

      <AdjustRoomCapacityModal
        show={adjustModalShow}
        onHide={() => setAdjustModalShow(false)}
        rooms={adjustRooms}
        onSaved={onAdjustSaved}
      />
    </Fragment>
  )
}

export default GradesPage
