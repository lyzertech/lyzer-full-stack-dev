import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('laravel_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const laravelRes = await fetch(`${LARAVEL_API_URL}/api/v1/sales/products`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!laravelRes.ok) {
      const text = await laravelRes.text()
      return NextResponse.json(
        { error: 'Upstream error', details: text },
        { status: laravelRes.status },
      )
    }

    const body = await laravelRes.json()
    return NextResponse.json(body, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('GET /api/sales/products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales products', details: message },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('laravel_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const laravelRes = await fetch(`${LARAVEL_API_URL}/api/v1/sales/products`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

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
        { status: laravelRes.status },
      )
    }

    return NextResponse.json(parsed ?? {}, { status: laravelRes.status })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('POST /api/sales/products error:', error)
    return NextResponse.json(
      { error: 'Failed to create product', details: message },
      { status: 500 },
    )
  }
}
