import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

/**
 * GET /api/user/dashboard/recent-users
 *
 * Proxies to Laravel (auth_users + latest active role).
 */
export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('laravel_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const laravelRes = await fetch(
      `${LARAVEL_API_URL}/api/v1/users/dashboard/recent-users`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      },
    )

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
    console.error('GET /api/user/dashboard/recent-users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent users', details: message },
      { status: 500 },
    )
  }
}
