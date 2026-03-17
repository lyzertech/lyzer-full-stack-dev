import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '../../../../../lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentIds, grade, room } = body
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'No studentIds provided' },
        { status: 400 }
      )
    }

    // Build dynamic update
    const fields: string[] = []
    const params: any[] = []
    if (typeof grade !== 'undefined') {
      fields.push('grade = ?')
      params.push(grade === null ? null : grade)
    }
    if (typeof room !== 'undefined') {
      // allow special case: -1 means clear room (null)
      const roomVal = room === -1 ? null : room
      fields.push('room = ?')
      params.push(roomVal)
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const pool = getPool()

    // Build placeholders for IN clause
    const placeholders = studentIds.map(() => '?').join(',')
    const sql = `UPDATE school_students SET ${fields.join(
      ', '
    )} WHERE id IN (${placeholders})`

    const [result]: any = await pool.execute(sql, [...params, ...studentIds])

    return NextResponse.json({
      success: true,
      affectedRows: result.affectedRows,
    })
  } catch (err) {
    console.error('POST /api/school/students/bulk-assign error:', err)
    return NextResponse.json(
      { error: 'Failed to bulk assign students' },
      { status: 500 }
    )
  }
}
