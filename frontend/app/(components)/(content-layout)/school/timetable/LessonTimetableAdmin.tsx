'use client'

import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import type { Teacher } from '../teacher/list/ListTable'
import GradeRoomConfig from './GradeRoomConfig'
import SubjectConfig from './SubjectConfig'
import TeacherSidebar from './TeacherSidebar'
import PeriodConfig from './PeriodConfig'
import TimetableGrid from './TimetableGrid'
import {
  DayName,
  PeriodDef,
  TimetableCell,
  TimetableState,
} from './timetableTypes'

const days: DayName[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const LessonTimetableAdmin: React.FC = () => {
  // configurable lists (fetched from DB)
  const [grades, setGrades] = useState<string[]>([])
  const [roomsByGrade, setRoomsByGrade] = useState<Record<string, string[]>>({})
  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectRows, setSubjectRows] = useState<any[]>([])
  const [gradeIdByLabel, setGradeIdByLabel] = useState<Record<string, number>>(
    {}
  )
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [subjectsError, setSubjectsError] = useState<string | null>(null)
  const [teachers, setTeachers] = useState<string[]>([])

  // fetch grades and rooms from DB
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await fetch('/api/v1/school/grades', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch grades')
        const rows = await res.json()
        const map = new Map<
          number,
          { id: number; level: number; rooms: string[]; name: string }
        >()
        for (const r of rows) {
          const id = r.id
          if (!map.has(id)) {
            map.set(id, { id, level: r.level, rooms: [], name: r.name })
          }
          if (r.roomId) {
            map.get(id)!.rooms.push(String(r.roomName))
          }
        }
        const gradeList = Array.from(map.values()).map((g) =>
          g.name && String(g.name).trim() ? String(g.name) : `Grade ${g.level}`
        )
        const roomsMap: Record<string, string[]> = {}
        const idMap: Record<string, number> = {}
        Array.from(map.values()).forEach((g) => {
          const label =
            g.name && String(g.name).trim()
              ? String(g.name)
              : `Grade ${g.level}`
          roomsMap[label] = g.rooms.length ? g.rooms : ['1']
          idMap[label] = g.id
        })
        setGrades(gradeList)
        setRoomsByGrade(roomsMap)
        setGradeIdByLabel(idMap)

        // set defaults if not selected
        if (gradeList.length && !grades.length) {
          const first = gradeList[0]
          setSelectedGrade(first)
          setSelectedRoom(roomsMap[first][0] || '1')
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchGrades()
  }, [])

  // teachers fetched from DB (for display in sidebar card)
  const [teacherList, setTeacherList] = useState<Teacher[]>([])
  const [teachersLoading, setTeachersLoading] = useState(false)
  const [teachersError, setTeachersError] = useState<string | null>(null)

  const [periods, setPeriods] = useState<PeriodDef[]>([
    { id: 'p1', label: '1', time: '07:00 - 07:45' },
    { id: 'p2', label: '2', time: '07:45 - 08:30' },
    { id: 'p3', label: '3', time: '08:30 - 09:15' },
    { id: 'break', label: 'Break', time: '09:15 - 09:45' },
    { id: 'p4', label: '4', time: '09:45 - 10:30' },
    { id: 'p5', label: '5', time: '10:30 - 11:15' },
  ])

  const [selectedGrade, setSelectedGrade] = useState<string>('1')
  const [selectedRoom, setSelectedRoom] = useState<string>('1')

  const [timetable, setTimetable] = useState<TimetableState>({})

  const currentRooms = useMemo(
    () => roomsByGrade[selectedGrade] || [],
    [roomsByGrade, selectedGrade]
  )

  const currentTimetable = useMemo(() => {
    return timetable[selectedGrade]?.[selectedRoom] || {}
  }, [timetable, selectedGrade, selectedRoom])

  // fetch teachers from API for sidebar list
  useEffect(() => {
    const fetchTeachers = async () => {
      setTeachersLoading(true)
      setTeachersError(null)
      try {
        const res = await fetch('/api/v1/teachers', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`)
        }

        const json = await res.json()
        setTeacherList(json)
      } catch (err) {
        console.error(err)
        setTeachersError('Failed to load teachers from server.')
      } finally {
        setTeachersLoading(false)
      }
    }

    fetchTeachers()
  }, [])

  // fetch subjects from DB (kept as full rows, and filter by selected grade)
  const fetchAndSetSubjects = async () => {
    setSubjectsLoading(true)
    setSubjectsError(null)
    try {
      const res = await fetch('/api/v1/subjects', {
        method: 'GET',
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const json = await res.json()
      setSubjectRows(json)
      // apply filter based on currently selected grade label -> id
      const gid = gradeIdByLabel[selectedGrade]
      let filtered = json
      if (gid !== undefined) filtered = json.filter((s: any) => s.grade === gid)
      setSubjects(filtered.map((s: any) => s.name))
    } catch (err) {
      console.error(err)
      setSubjectsError('Failed to load subjects from server.')
    } finally {
      setSubjectsLoading(false)
    }
  }

  useEffect(() => {
    fetchAndSetSubjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // re-filter subjects when grade selection or cached rows change
  useEffect(() => {
    if (!subjectRows || !subjectRows.length) return
    const gid = gradeIdByLabel[selectedGrade]
    let filtered = subjectRows
    if (gid !== undefined)
      filtered = subjectRows.filter((s: any) => s.grade === gid)
    setSubjects(filtered.map((s: any) => s.name))
  }, [subjectRows, selectedGrade, gradeIdByLabel])

  const handleAddPeriod = () => {
    const numeric = periods.filter((p) => !isNaN(parseInt(p.label, 10)))
    const nextNumber = numeric.length
      ? Math.max(...numeric.map((p) => parseInt(p.label, 10))) + 1
      : 1
    const newId = `p${nextNumber}`
    setPeriods((prev) => [
      ...prev,
      { id: newId, label: nextNumber.toString(), time: '00:00 - 00:45' },
    ])
  }

  const handleRemovePeriod = (id: string) => {
    setPeriods((prev) => prev.filter((p) => p.id !== id))
    setTimetable((prev) => {
      const copy: TimetableState = {}
      for (const [grade, gradeData] of Object.entries(prev)) {
        copy[grade] = {}
        for (const [room, roomData] of Object.entries(gradeData)) {
          copy[grade][room] = {}
          for (const [day, dayData] of Object.entries(roomData) as [
            DayName,
            Record<string, TimetableCell>
          ][]) {
            const newDay: Record<string, TimetableCell> = {}
            Object.entries(dayData || {}).forEach(([periodId, cell]) => {
              if (periodId !== id) {
                newDay[periodId] = cell
              }
            })
            copy[grade][room][day] = newDay
          }
        }
      }
      return copy
    })
  }

  const handleAddSubject = async (subjectName?: string) => {
    // refresh subjects from server (subject may have been created for a specific grade)
    await fetchAndSetSubjects()
  }

  const handleAddTeacher = () => {
    setTeachers((prev) => [...prev, `New Teacher ${prev.length + 1}`])
  }

  const updateCell = (
    day: DayName,
    periodId: string,
    field: keyof TimetableCell,
    value: string
  ) => {
    setTimetable((prev) => {
      const gradeData = prev[selectedGrade] || {}
      const roomData = gradeData[selectedRoom] || {}
      const dayData = roomData[day] || {}
      const existing = dayData[periodId] || {
        subject: '',
        teacher: '',
        room: `Room ${selectedRoom}`,
      }
      const updatedCell: TimetableCell = { ...existing, [field]: value }

      return {
        ...prev,
        [selectedGrade]: {
          ...gradeData,
          [selectedRoom]: {
            ...roomData,
            [day]: {
              ...dayData,
              [periodId]: updatedCell,
            },
          },
        },
      }
    })
  }

  const getSubjectColor = (subject: string): string => {
    if (!subject) return 'secondary'
    const colors = ['primary', 'success', 'info', 'warning', 'danger']
    const index = subjects.indexOf(subject)
    return colors[index >= 0 ? index % colors.length : 0]
  }

  return (
    <Fragment>
      <Seo title="Lesson Timetable - Admin" />

      <Pageheader
        title="School"
        subtitle="Timetable"
        currentpage="Lesson Timetable (Admin)"
        activepage="Lesson Timetable (Admin)"
      />

      {/* Configuration panel */}
      <Row className="mb-4 g-3">
        <Col xxl={4}>
          <GradeRoomConfig
            grades={grades}
            roomsByGrade={roomsByGrade}
            selectedGrade={selectedGrade}
            selectedRoom={selectedRoom}
            currentRooms={currentRooms}
            onChangeGrade={(grade) => {
              setSelectedGrade(grade)
              const firstRoom = roomsByGrade[grade]?.[0] || '1'
              setSelectedRoom(firstRoom)
            }}
            onChangeRoom={setSelectedRoom}
          />
        </Col>

        <Col xxl={4}>
          <SubjectConfig
            subjects={subjects}
            onAddSubject={handleAddSubject}
            getSubjectColor={getSubjectColor}
            selectedGrade={selectedGrade}
          />
        </Col>

        <Col xxl={4}>
          <TeacherSidebar
            teachersLoading={teachersLoading}
            teachersError={teachersError}
            teacherList={teacherList}
            onAddTeacher={handleAddTeacher}
          />
        </Col>
      </Row>

      {/* Period configuration */}
      <Row className="mb-4">
        <Col xxl={12}>
          <PeriodConfig
            periods={periods}
            onAddPeriod={handleAddPeriod}
            onRemovePeriod={handleRemovePeriod}
          />
        </Col>
      </Row>

      {/* Timetable editor */}
      <TimetableGrid
        days={days}
        periods={periods}
        selectedGrade={selectedGrade}
        selectedRoom={selectedRoom}
        currentTimetable={currentTimetable}
        subjects={subjects}
        teachers={teachers}
        updateCell={updateCell}
      />
    </Fragment>
  )
}

export default LessonTimetableAdmin
