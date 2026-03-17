'use client'

import React from 'react'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import { Button } from 'react-bootstrap'
import type { Grade } from './gradeTypes'

interface Props {
  grades: Grade[]
  loading: boolean
  error: string | null
  onAssign: (grade: Grade) => void
  onAdjust?: (grade: Grade) => void
  onDelete: (id: number) => void
}

const GradeTable: React.FC<Props> = ({
  grades,
  loading,
  error,
  onAssign,
  onAdjust,
  onDelete,
}) => {
  const sortRooms = (a: any, b: any) => {
    const key = (name: string) => {
      const token = (name || '').toString().trim().split(/\s+/).pop() || ''
      if (/^[A-Za-z]+$/.test(token))
        return { type: 0, value: token.toUpperCase() }
      if (/^\d+$/.test(token)) return { type: 1, value: Number(token) }
      return { type: 2, value: token.toUpperCase() }
    }
    const ka = key(a?.name || '')
    const kb = key(b?.name || '')
    if (ka.type !== kb.type) return ka.type - kb.type
    if (ka.type === 1) return (ka.value as number) - (kb.value as number)
    if (ka.value < kb.value) return -1
    if (ka.value > kb.value) return 1
    return 0
  }

  return (
    <div className="table-responsive">
      <SpkTables
        tableClass="text-nowrap table-striped table-hover"
        header={[
          { title: 'No.' },
          { title: 'Name' },
          { title: 'Level' },
          { title: 'Status' },
          { title: 'Rooms' },
          { title: 'Created' },
          { title: 'Action' },
        ]}
      >
        {loading && !error && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={7}>
                  <div className="placeholder-glow py-2">
                    <span className="placeholder col-2 me-2"></span>
                    <span className="placeholder col-3 me-2"></span>
                    <span className="placeholder col-2 me-2"></span>
                    <span className="placeholder col-2"></span>
                  </div>
                </td>
              </tr>
            ))}
          </>
        )}

        {!loading && !error && grades.length === 0 && (
          <tr>
            <td colSpan={7} className="text-center text-muted">
              No grades found
            </td>
          </tr>
        )}

        {!loading &&
          !error &&
          grades.map((g, idx) => (
            <tr key={g.id}>
              <td>{idx + 1}</td>
              <td>{g.name}</td>
              <td>{g.level}</td>
              <td>{g.status}</td>
              <td>
                {(g.rooms || []).length > 0
                  ? (() => {
                      const sortedRooms = (g.rooms || [])
                        .slice()
                        .sort(sortRooms)
                      return (
                        <div
                          className="d-flex flex-wrap"
                          style={{ gap: '6px' }}
                        >
                          {sortedRooms.map((r: any) => (
                            <div
                              key={r.id}
                              className="room-box border rounded px-2 py-1 bg-white d-flex align-items-center"
                              title={
                                r.teacherName
                                  ? `${r.name} — ${r.teacherName}`
                                  : r.name
                              }
                              style={{
                                maxWidth: '200px',
                                minWidth: '90px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  minWidth: '30px',
                                  marginRight: '8px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontWeight: 600,
                                }}
                              >
                                {r.name}
                              </div>

                              <div
                                className="text-muted small d-flex align-items-center"
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {r.teacherName ? (
                                  <>
                                    <i className="ri-user-3-line me-1"></i>
                                    <span
                                      style={{
                                        maxWidth: '90px',
                                        display: 'inline-block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {r.teacherName}
                                    </span>
                                  </>
                                ) : (
                                  <div className="badge bg-secondary small me-2">
                                    Unassigned
                                  </div>
                                )}

                                <div className="ms-2 d-flex align-items-center">
                                  <i className="ri-group-line me-1"></i>
                                  <span>
                                    {typeof r.capacity !== 'undefined' &&
                                    r.capacity !== null
                                      ? r.capacity
                                      : '-'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()
                  : '-'}
              </td>
              <td>{g.created_at ? g.created_at.split('T')[0] : '-'}</td>
              <td>
                <Button
                  variant="secondary"
                  size="sm"
                  className="me-2"
                  onClick={() => onAssign(g)}
                  title="Assign teacher to rooms"
                >
                  <i className="ri-user-line"></i>
                </Button>

                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => onAdjust && onAdjust(g)}
                  title="Adjust students for rooms"
                >
                  <i className="ri-group-line"></i>
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  className="me-2"
                  onClick={() => onDelete(g.id)}
                >
                  <i className="ri-delete-bin-6-line"></i>
                </Button>
              </td>
            </tr>
          ))}
      </SpkTables>

      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  )
}

export default GradeTable
