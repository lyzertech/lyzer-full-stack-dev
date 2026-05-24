'use client'

import React from 'react'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'

interface Props {
  students: any[]
  loading: boolean
}

const SimpleStudentTable: React.FC<Props> = ({ students, loading }) => {
  const [gradeMap, setGradeMap] = React.useState<Map<number, string>>(new Map())
  const [roomMap, setRoomMap] = React.useState<Map<number, string>>(new Map())

  React.useEffect(() => {
    let mounted = true
    fetch('/api/v1/school/grades', { cache: 'no-store' })
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
      .catch((e) => console.error('Failed to load grades', e))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="table-responsive">
      <SpkTables
        tableClass="text-nowrap table-striped table-hover"
        header={[
          { title: 'No.' },
          { title: 'NIS' },
          { title: 'Name' },
          { title: 'Grade' },
          { title: 'Room' },
        ]}
      >
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <tr key={i}>
              <td colSpan={5}>
                <div className="placeholder-glow py-2">
                  <span className="placeholder col-2 me-2"></span>
                </div>
              </td>
            </tr>
          ))}

        {!loading && students.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center text-muted">
              No students
            </td>
          </tr>
        )}

        {!loading &&
          students.map((s, idx) => (
            <tr key={s.id}>
              <td>{idx + 1}</td>
              <td>{s.nis}</td>
              <td>{s.name}</td>
              <td>
                {s.grade ? gradeMap.get(s.grade) || String(s.grade) : '-'}
              </td>
              <td>{s.room ? roomMap.get(s.room) || String(s.room) : '-'}</td>
            </tr>
          ))}
      </SpkTables>
    </div>
  )
}

export default SimpleStudentTable
