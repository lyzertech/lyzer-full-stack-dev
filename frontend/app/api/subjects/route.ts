import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '../../../lib/db'

export async function GET() {
  try {
    const pool = getPool()
    const [rows] = await pool.execute(
      `SELECT s.id, s.code, s.name, s.description, s.semester, s.type, s.hours_per_week AS hoursPerWeek, s.is_active AS isActive, s.created_at AS createdAt, s.updated_at AS updatedAt,
        s.grade AS grade, g.name AS gradeName, g.level AS gradeLevel
       FROM school_subjects s
       LEFT JOIN school_grades g ON g.id = s.grade
       ORDER BY s.id ASC`
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/subjects error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      code,
      name,
      description,
      grade,
      semester,
      type,
      hours_per_week,
      is_active,
    } = body

    if (!code || !name || grade === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, grade' },
        { status: 400 }
      )
    }

    // basic validation
    const allowedSemesters = [1, 2]
    const gId = Number(grade)
    const s = Number(semester)
    if (!Number.isInteger(gId) || !allowedSemesters.includes(s)) {
      return NextResponse.json(
        { error: 'Invalid grade or semester' },
        { status: 400 }
      )
    }

    const pool = getPool()

    // verify grade exists
    const [gradeRows]: any = await pool.execute(
      'SELECT id FROM school_grades WHERE id = ?',
      [gId]
    )
    if (!gradeRows || gradeRows.length === 0) {
      return NextResponse.json({ error: 'Invalid grade' }, { status: 400 })
    }

    try {
      const [result]: any = await pool.execute(
        `INSERT INTO school_subjects (code, name, description, grade, semester, type, hours_per_week, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code,
          name,
          description || null,
          gId,
          s,
          type || 'mandatory',
          Number(hours_per_week) || 0,
          is_active === undefined ? true : Boolean(is_active),
        ]
      )

      const insertedId = result.insertId
      const [rows]: any = await pool.execute(
        `SELECT s.id, s.code, s.name, s.description, s.semester, s.type, s.hours_per_week AS hoursPerWeek, s.is_active AS isActive, s.created_at AS createdAt, s.updated_at AS updatedAt,
          s.grade AS grade, g.name AS gradeName, g.level AS gradeLevel
         FROM school_subjects s LEFT JOIN school_grades g ON g.id = s.grade WHERE s.id = ?`,
        [insertedId]
      )

      return NextResponse.json(rows[0], { status: 201 })
    } catch (err: any) {
      console.error('POST /api/subjects db error:', err)
      if (err && err.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
          { error: 'Subject code already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create subject' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('POST /api/subjects error:', error)
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    )
  }
}
