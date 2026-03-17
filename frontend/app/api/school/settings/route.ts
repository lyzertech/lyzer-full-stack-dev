import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '../../../../lib/db'

export async function GET() {
  try {
    const pool = getPool()
    const [rows]: any = await pool.execute(
      'SELECT * FROM school_settings ORDER BY id ASC LIMIT 1'
    )

    if (!rows || rows.length === 0) {
      return NextResponse.json(null)
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('GET /api/school/settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    // Basic validation
    if (!body.school_name || String(body.school_name).trim() === '') {
      return NextResponse.json(
        { error: 'Missing required field: school_name' },
        { status: 400 }
      )
    }

    const allowedFields = new Set([
      'school_code',
      'school_name',
      'short_name',
      'address_line1',
      'address_line2',
      'city',
      'state',
      'postal_code',
      'country',
      'phone',
      'fax',
      'email',
      'website',
      'contact_person_name',
      'contact_person_phone',
      'contact_person_email',
      'logo_url',
      'favicon_url',
      'timezone',
      'locale',
      'academic_year_start',
      'academic_year_end',
      'default_language',
      'default_currency',
      'registration_number',
      'tax_id',
      'sms_enabled',
      'sms_provider',
      'extra',
      'is_active',
    ])

    // Build sanitized payload
    const payload: any = {}
    for (const key of Object.keys(body)) {
      if (!allowedFields.has(key)) continue
      let val = body[key]

      if (key === 'sms_enabled' || key === 'is_active') {
        val = !!val
      }

      if (key === 'extra' && typeof val === 'object') {
        try {
          val = JSON.stringify(val)
        } catch (e) {
          val = null
        }
      }

      // basic length checks
      if (typeof val === 'string' && val.length > 1000) {
        val = val.slice(0, 1000)
      }

      payload[key] = val
    }

    const pool = getPool()

    // Check if a settings row exists
    const [existingRows]: any = await pool.execute(
      'SELECT id FROM school_settings ORDER BY id ASC LIMIT 1'
    )

    if (!existingRows || existingRows.length === 0) {
      const cols = Object.keys(payload)
      const vals = cols.map((c) => payload[c])
      const placeholders = cols.map(() => '?').join(', ')
      const sql = `INSERT INTO school_settings (${cols.join(
        ','
      )}) VALUES (${placeholders})`
      const [result]: any = await pool.execute(sql, vals)
      const [newRow]: any = await pool.execute(
        'SELECT * FROM school_settings WHERE id = ?',
        [result.insertId]
      )
      return NextResponse.json(newRow[0], { status: 201 })
    }

    // Update existing row (only update provided fields)
    const id = existingRows[0].id
    const fields = Object.keys(payload)
    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No updatable fields provided' },
        { status: 400 }
      )
    }

    const values = fields.map((f) => payload[f])
    const setClause = fields.map((f) => `\`${f}\` = ?`).join(', ')
    const sql = `UPDATE school_settings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    await pool.execute(sql, [...values, id])

    const [rowsAfter]: any = await pool.execute(
      'SELECT * FROM school_settings WHERE id = ?',
      [id]
    )
    return NextResponse.json(rowsAfter[0])
  } catch (error) {
    console.error('PUT /api/school/settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
