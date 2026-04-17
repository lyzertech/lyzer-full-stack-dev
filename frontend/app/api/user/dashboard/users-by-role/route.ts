import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

/**
 * GET /api/user/dashboard/users-by-role
 *
 * Proxies to Laravel using the session Bearer token (auth_roles + aggregates).
 */
export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('laravel_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const laravelRes = await fetch(
      `${LARAVEL_API_URL}/api/v1/users/dashboard/users-by-role`,
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
    console.error('GET /api/user/dashboard/users-by-role error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users by role', details: message },
      { status: 500 },
    )
  }
}
