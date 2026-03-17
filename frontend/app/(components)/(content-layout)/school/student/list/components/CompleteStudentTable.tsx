'use client'

import React, { useState } from 'react'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import { Button } from 'react-bootstrap'
import StudentIDCard from './StudentIDCard'
import BulkAssignModal from './BulkAssignModal'

interface Props {
  students: any[]
  loading: boolean
  onRefresh?: () => void
}

const CompleteStudentTable: React.FC<Props> = ({
  students,
  loading,
  onRefresh,
}) => {
  const [selected, setSelected] = useState<any | null>(null)
  const [showCard, setShowCard] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [showBulk, setShowBulk] = useState(false)

  const [gradeMap, setGradeMap] = useState<Map<number, string>>(new Map())
  const [roomMap, setRoomMap] = useState<Map<number, string>>(new Map())

  React.useEffect(() => {
    let mounted = true
    fetch('/api/school/grades', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        const gMap = new Map<number, string>()
        const rMap = new Map<number, string>()
        for (const r of data) {
          if (r.id) gMap.set(r.id, r.name)
          if (r.roomId) rMap.set(r.roomId, r.roomName)
        }
        setGradeMap(gMap)
        setRoomMap(rMap)
      })
      .catch((e) => {
        console.error('Failed to load grades', e)
      })
    return () => {
      mounted = false
    }
  }, [])

  const openCard = (s: any) => {
    setSelected(s)
    setShowCard(true)
  }

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const toggleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) setSelectedIds(new Set((students || []).map((s) => s.id)))
    else setSelectedIds(new Set())
  }

  const openBulk = () => {
    if ((selectedIds || new Set()).size === 0) {
      alert('No students selected')
      return
    }
    setShowBulk(true)
  }

  return (
    <React.Fragment>
      <div className="d-flex justify-content-between mb-2">
        <div>
          <strong>Selected: {(selectedIds && selectedIds.size) || 0}</strong>
        </div>
        <div>
          <button className="btn btn-sm btn-info me-2" onClick={openBulk}>
            Assign to Grade / Room
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <SpkTables
          tableClass="text-nowrap table-striped table-hover"
          header={[
            { title: 'Select' },
            { title: 'No.' },
            { title: 'NIS' },
            { title: 'Name' },
            { title: 'DOB' },
            { title: 'Gender' },
            { title: 'Grade' },
            { title: 'Room' },
            { title: 'Parent' },
            { title: 'Status' },
            { title: 'Action' },
          ]}
        >
          {/* <tr>
            <td colSpan={11}>Placeholder</td>
          </tr> */}
          {!loading && students.length === 0 && (
            <tr>
              <td colSpan={11} className="text-center text-muted">
                No students
              </td>
            </tr>
          )}

          {!loading &&
            students.map((s, idx) => (
              <tr key={s.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(s.id)}
                    onChange={(e: any) => toggleSelect(s.id, e.target.checked)}
                  />
                </td>
                <td>{idx + 1}</td>
                <td>{s.nis}</td>
                <td>{s.name}</td>
                <td>{s.date_of_birth ? s.date_of_birth.split('T')[0] : '-'}</td>
                <td>{s.gender}</td>
                <td>
                  {s.grade ? gradeMap.get(s.grade) || String(s.grade) : '-'}
                </td>
                <td>{s.room ? roomMap.get(s.room) || String(s.room) : '-'}</td>
                <td>{s.parent_name || '-'}</td>
                <td>{s.status}</td>
                <td>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="me-2"
                    onClick={() => openCard(s)}
                  >
                    View ID
                  </Button>
                </td>
              </tr>
            ))}
        </SpkTables>
      </div>

      {selected && (
        <StudentIDCard
          show={showCard}
          onHide={() => setShowCard(false)}
          student={selected}
          onRefreshed={onRefresh}
        />
      )}

      <BulkAssignModal
        show={showBulk}
        onHide={() => setShowBulk(false)}
        studentIds={Array.from(selectedIds)}
        onSaved={() => {
          setShowBulk(false)
          setSelectedIds(new Set())
          setSelectAll(false)
          if (onRefresh) onRefresh()
        }}
      />
    </React.Fragment>
  )
}

export default CompleteStudentTable
