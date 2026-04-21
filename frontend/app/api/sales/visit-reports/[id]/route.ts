import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('laravel_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json().catch(() => null)
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const laravelRes = await fetch(
      `${LARAVEL_API_URL}/api/v1/sales/visit-reports/${id}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      }
    )

    const text = await laravelRes.text()
    let parsed: unknown = null
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      parsed = null
    }

    if (!laravelRes.ok) {
      return NextResponse.json(
        parsed ?? { error: 'Upstream error', details: text || laravelRes.statusText },
        { status: laravelRes.status }
      )
    }

    return NextResponse.json(parsed ?? {}, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('PUT /api/sales/visit-reports/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update visit report', details: message },
      { status: 500 }
    )
  }
}
