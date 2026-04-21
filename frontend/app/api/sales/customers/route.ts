import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

async function getBearerToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('laravel_token')?.value ?? null
}

// ─── GET /api/sales/customers ──────────────────────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    const token = await getBearerToken()

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const laravelRes = await fetch(`${LARAVEL_API_URL}/api/v1/sales/customers`, {
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
    console.error('GET /api/sales/customers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales customers', details: message },
      { status: 500 },
    )
  }
}

// ─── POST /api/sales/customers ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const token = await getBearerToken()

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const laravelRes = await fetch(`${LARAVEL_API_URL}/api/v1/sales/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const data = await laravelRes.json()

    if (!laravelRes.ok) {
      return NextResponse.json(
        { error: 'Upstream error', details: data },
        { status: laravelRes.status },
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('POST /api/sales/customers error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer', details: message },
      { status: 500 },
    )
  }
}
