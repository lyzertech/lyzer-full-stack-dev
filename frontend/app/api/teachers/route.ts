import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '../../../lib/db'

export async function GET() {
  try {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT id, name, degree, email, subject, nip, gender, status, job_type AS jobType, join_date AS joinDate, avatar FROM school_teachers ORDER BY id ASC'
    )
    // pool is reused; no per-request close
    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/teachers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      degree,
      email,
      subject,
      nip,
      gender,
      status,
      jobType,
      joinDate,
      avatar,
    } = body

    if (!name || !email || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, subject' },
        { status: 400 }
      )
    }

    const pool = getPool()
    const [result]: any = await pool.execute(
      `INSERT INTO school_teachers 
        (name, degree, email, subject, nip, gender, status, job_type, join_date, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        degree || '',
        email,
        subject,
        nip || null,
        gender || 'Male',
        status || 'Active',
        jobType || 'Permanent',
        joinDate || new Date().toISOString().split('T')[0],
        avatar || null,
      ]
    )

    const insertedId = result.insertId

    // Generate canonical NIP server-side to avoid race conditions: YYYYMMDD + insertedId (padded to 3 digits)
    const now = new Date()
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, '')
    const finalNip = `${ymd}${String(insertedId).padStart(3, '0')}`

    await pool.execute('UPDATE school_teachers SET nip = ? WHERE id = ?', [
      finalNip,
      insertedId,
    ])

    const [rows]: any = await pool.execute(
      'SELECT id, name, degree, email, subject, nip, gender, status, job_type AS jobType, join_date AS joinDate, avatar FROM school_teachers WHERE id = ?',
      [insertedId]
    )

    // pool is reused; no per-request close

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('POST /api/teachers error:', error)
    return NextResponse.json(
      { error: 'Failed to create teacher' },
      { status: 500 }
    )
  }
}
