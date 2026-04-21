import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

async function getBearerToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('laravel_token')?.value ?? null
}

// GET /api/finance/dashboard
export async function GET(req: NextRequest) {
  try {
    const token = await getBearerToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const qs = searchParams.toString()
    const url = `${LARAVEL_API_URL}/api/v1/finance/dashboard${qs ? `?${qs}` : ''}`

    const laravelRes = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    const text = await laravelRes.text()
    let parsed: unknown = null
    try { parsed = text ? JSON.parse(text) : null } catch { parsed = null }

    if (!laravelRes.ok) {
      return NextResponse.json(
        { error: 'Upstream error', details: text || laravelRes.statusText },
        { status: laravelRes.status }
      )
    }

    return NextResponse.json(parsed ?? {})
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('GET /api/finance/dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch finance dashboard', details: message }, { status: 500 })
  }
}
