import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

/**
 * GET /api/auth/me
 *
 * Proxies to Laravel GET /api/me using the stored Sanctum token cookie.
 * Returns the current authenticated user or null.
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('laravel_token')?.value

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 200 })
    }

    const laravelRes = await fetch(`${LARAVEL_API_URL}/api/v1/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!laravelRes.ok) {
      // Token is invalid / expired — clear cookie
      cookieStore.delete('laravel_token')
      return NextResponse.json({ success: false, user: null }, { status: 200 })
    }

    const laravelUser = await laravelRes.json()
    const directRole =
      typeof laravelUser?.role === 'string'
        ? laravelUser.role
        : laravelUser?.role?.slug || laravelUser?.role?.name
    const nestedRole =
      laravelUser?.roles?.[0]?.role?.slug ||
      laravelUser?.roles?.[0]?.role?.name ||
      laravelUser?.roles?.[0]?.slug ||
      laravelUser?.roles?.[0]?.name
    const normalizedRole = directRole || nestedRole || null
    const normalizedRoles = Array.isArray(laravelUser?.roles)
      ? laravelUser.roles
      : normalizedRole
        ? [{ role: { slug: normalizedRole, permissions: [] } }]
        : []

    // Map Laravel user fields to AuthUser shape
    return NextResponse.json(
      {
        success: true,
        user: {
          id: String(laravelUser.id),
          email: laravelUser.email,
          displayName: laravelUser.name,
          role: normalizedRole,
          emailVerified: true,
          photoUrl: null,
          roles: normalizedRoles,
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('GET /api/auth/me error:', error)
    return NextResponse.json(
      { error: 'Failed to get user', details: error.message },
      { status: 500 },
    )
  }
}
