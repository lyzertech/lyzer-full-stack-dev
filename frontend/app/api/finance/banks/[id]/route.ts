import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

async function getBearerToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('laravel_token')?.value ?? null
}

// GET /api/finance/banks/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getBearerToken()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const laravelRes = await fetch(`${LARAVEL_API_URL}/api/v1/finance/banks/${params.id}`, {
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
    return NextResponse.json({ error: 'Failed to fetch bank', details: message }, { status: 500 })
  }
}

// PUT /api/finance/banks/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getBearerToken()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const laravelRes = await fetch(`${LARAVEL_API_URL}/api/v1/finance/banks/${params.id}`, {
      method: 'PUT',
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
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to update bank', details: message }, { status: 500 })
  }
}

// DELETE /api/finance/banks/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getBearerToken()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const laravelRes = await fetch(`${LARAVEL_API_URL}/api/v1/finance/banks/${params.id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })

    if (!laravelRes.ok) {
      const body = await laravelRes.json().catch(() => null)
      return NextResponse.json({ error: 'Upstream error', details: body }, { status: laravelRes.status })
    }
    return NextResponse.json({ message: 'Bank deleted.' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to delete bank', details: message }, { status: 500 })
  }
}
