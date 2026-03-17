import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '../../../../../lib/db'
import crypto from 'crypto'

const QR_SECRET = process.env.QR_SECRET || 'replace_this_secret'

function generateQrHash(nis: string | number) {
  const h = crypto.createHmac('sha256', QR_SECRET)
  h.update(String(nis) + '|' + Date.now())
  return h.digest('hex')
}

export async function POST(req: NextRequest) {
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
