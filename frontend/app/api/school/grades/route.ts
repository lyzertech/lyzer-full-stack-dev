import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '../../../../lib/db'

export async function GET() {
  try {
    const pool = getPool()
    const [rows] = await pool.execute(
      `SELECT g.id, g.name, g.level, g.description, g.status, g.created_at AS createdAt, g.updated_at AS updatedAt,
        r.id AS roomId, r.name AS roomName, r.capacity AS roomCapacity, r.teacher_id AS roomTeacherId, t.name AS roomTeacherName
       FROM school_grades g
       LEFT JOIN school_rooms r ON r.grade_id = g.id
       LEFT JOIN school_teachers t ON t.id = r.teacher_id
       ORDER BY g.id ASC`
    )

    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/school/grades error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, level, description, status, room, rooms } = body

    if (!name || typeof level === 'undefined') {
      return NextResponse.json(
        { error: 'Missing required fields: name, level' },
        { status: 400 }
      )
    }

    const pool = getPool()

    const [result]: any = await pool.execute(
      `INSERT INTO school_grades (name, level, description, status) VALUES (?, ?, ?, ?)`,
      [name, level, description || null, status || 'Active']
    )

    const insertedId = result.insertId

    const roomsToInsert = Array.isArray(rooms)
      ? rooms
      : room && room.name
      ? [room]
      : []
    if (roomsToInsert.length) {
      const insertPromises = roomsToInsert.map((r: any) =>
        pool.execute(
          `INSERT INTO school_rooms (grade_id, name, capacity, location, teacher_id) VALUES (?, ?, ?, ?, ?)`,
          [
            insertedId,
            r.name,
            r.capacity || null,
            r.location || null,
            r.teacherId || null,
          ]
        )
      )
      await Promise.all(insertPromises)
    }

    const [gradeRows]: any = await pool.execute(
      'SELECT * FROM school_grades WHERE id = ?',
      [insertedId]
    )
    const [roomRows]: any = await pool.execute(
      'SELECT * FROM school_rooms WHERE grade_id = ?',
      [insertedId]
    )

    const grade = gradeRows[0]
    grade.rooms = roomRows

    return NextResponse.json(grade, { status: 201 })
  } catch (error) {
    console.error('POST /api/school/grades error:', error)
    return NextResponse.json(
      { error: 'Failed to create grade' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { roomId, teacherId, capacity } = body
    if (!roomId) {
      return NextResponse.json({ error: 'Missing roomId' }, { status: 400 })
    }

    const pool = getPool()

    let result: any
    if (typeof capacity !== 'undefined') {
      // allow null to clear capacity
      const [r]: any = await pool.execute(
        'UPDATE school_rooms SET capacity = ? WHERE id = ?',
        [capacity === null ? null : capacity, roomId]
      )
      result = r
    } else if (typeof teacherId !== 'undefined') {
      const [r]: any = await pool.execute(
        'UPDATE school_rooms SET teacher_id = ? WHERE id = ?',
        [teacherId || null, roomId]
      )
      result = r
    } else {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    if (!result || result.affectedRows === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const [rows]: any = await pool.execute(
      'SELECT * FROM school_rooms WHERE id = ?',
      [roomId]
    )
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('PATCH /api/school/grades error:', error)
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const pool = getPool()
    const [result]: any = await pool.execute(
      'DELETE FROM school_grades WHERE id = ?',
      [id]
    )

    if (!result || result.affectedRows === 0) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/school/grades error:', error)
    return NextResponse.json(
      { error: 'Failed to delete grade' },
      { status: 500 }
    )
  }
}
