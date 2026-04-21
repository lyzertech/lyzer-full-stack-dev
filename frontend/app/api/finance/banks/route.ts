import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

async function getBearerToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('laravel_token')?.value ?? null
}

// GET /api/finance/banks
export async function GET(req: NextRequest) {
  try {
    const token = await getBearerToken()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const url = `${LARAVEL_API_URL}/api/v1/finance/banks?${searchParams.toString()}`

    const laravelRes = await fetch(url, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    const body = await laravelRes.json().catch(() => null)
    if (!laravelRes.ok) {
      return NextResponse.json({ error: 'Upstream error', details: body }, { status: laravelRes.status })
    }
    return NextResponse.json(body)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to fetch banks', details: message }, { status: 500 })
  }
}

// POST /api/finance/banks
export async function POST(req: NextRequest) {
  try {
    const token = await getBearerToken()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const laravelRes = await fetch(`${LARAVEL_API_URL}/api/v1/finance/banks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const data = await laravelRes.json().catch(() => null)
    if (!laravelRes.ok) {
      return NextResponse.json({ error: 'Upstream error', details: data }, { status: laravelRes.status })
    }
    return NextResponse.json(data, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to create bank', details: message }, { status: 500 })
  }
}
