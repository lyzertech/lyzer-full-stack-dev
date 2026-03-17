import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '../../../../lib/db'
import crypto from 'crypto'

const QR_SECRET = process.env.QR_SECRET || 'replace_this_secret'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const simple = url.searchParams.get('simple') // if set, return limited fields

    const pool = getPool()

    if (id) {
      const [rows]: any = await pool.execute(
        'SELECT * FROM school_students WHERE id = ?',
        [id]
      )
      if (!rows || rows.length === 0)
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        )
      return NextResponse.json(rows[0])
    }

    // list
    if (simple === '1') {
      const [rows]: any = await pool.execute(
        'SELECT id, nis, name, grade, room, status FROM school_students ORDER BY name ASC'
      )
      return NextResponse.json(rows)
    }

    const [rows]: any = await pool.execute(
      'SELECT * FROM school_students ORDER BY name ASC'
    )
    return NextResponse.json(rows)
  } catch (err) {
    console.error('GET /api/school/students error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

function generateQrHash(nis: string | number) {
  // HMAC with QR_SECRET and nis + timestamp for uniqueness
  const h = crypto.createHmac('sha256', QR_SECRET)
  h.update(String(nis) + '|' + Date.now())
  return h.digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      nis,
      name,
      gender,
      date_of_birth,
      grade,
      room,
      parent_name,
      parent_phone,
      address,
      status,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Missing student name' },
        { status: 400 }
      )
    }

    const pool = getPool()

    // If nis not provided, auto-generate a simple NIS: YYYYMMDD + incremental
    let studentNis = nis
    if (!studentNis) {
      const [rows]: any = await pool.execute(
        'SELECT MAX(id) as maxId FROM school_students'
      )
      const nextId =
        rows && rows[0] && rows[0].maxId ? Number(rows[0].maxId) + 1 : 1
      const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      studentNis = `${ymd}${String(nextId).padStart(4, '0')}`
    }

    const qrHash = generateQrHash(studentNis)

    const [result]: any = await pool.execute(
      `INSERT INTO school_students (nis, name, gender, date_of_birth, grade, room, parent_name, parent_phone, address, status, qr_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentNis,
        name,
        gender || 'Male',
        date_of_birth || null,
        grade || null,
        room || null,
        parent_name || null,
        parent_phone || null,
        address || null,
        status || 'Active',
        qrHash,
      ]
    )

    const insertedId = result.insertId
    const [studentRows]: any = await pool.execute(
      'SELECT * FROM school_students WHERE id = ?',
      [insertedId]
    )

    return NextResponse.json(studentRows[0], { status: 201 })
  } catch (err) {
    console.error('POST /api/school/students error:', err)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...patch } = body
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const fields = [] as string[]
    const params = [] as any[]
    for (const k of Object.keys(patch)) {
      fields.push(`${k} = ?`)
      params.push((patch as any)[k])
    }
    params.push(id)

    const pool = getPool()
    const [result]: any = await pool.execute(
      `UPDATE school_students SET ${fields.join(', ')} WHERE id = ?`,
      params
    )
    if (!result || result.affectedRows === 0)
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    const [rows]: any = await pool.execute(
      'SELECT * FROM school_students WHERE id = ?',
      [id]
    )
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('PATCH /api/school/students error:', err)
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    )
  }
}

export async function POST_REFRESH_QR(req: NextRequest) {
  // Note: Not a standard Next.js handler; client should call POST /api/school/students/refresh-qr?id=...
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const pool = getPool()
    const [rows]: any = await pool.execute(
      'SELECT nis FROM school_students WHERE id = ?',
      [id]
    )
    if (!rows || rows.length === 0)
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    const nis = rows[0].nis
    const newHash = generateQrHash(nis)
    await pool.execute('UPDATE school_students SET qr_hash = ? WHERE id = ?', [
      newHash,
      id,
    ])

    return NextResponse.json({ qr_hash: newHash })
  } catch (err) {
    console.error('POST /api/school/students/refresh-qr error:', err)
    return NextResponse.json({ error: 'Failed to refresh QR' }, { status: 500 })
  }
}
