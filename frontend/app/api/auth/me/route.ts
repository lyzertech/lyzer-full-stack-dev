import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000';

/**
 * GET /api/auth/me
 *
 * Proxies to Laravel GET /api/me using the stored Sanctum token cookie.
 * Returns the current authenticated user or null.
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('laravel_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    const laravelRes = await fetch(`${LARAVEL_API_URL}/api/v1/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!laravelRes.ok) {
      // Token is invalid / expired — clear cookie
      cookieStore.delete('laravel_token');
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    const laravelUser = await laravelRes.json();

    // Map Laravel user fields to AuthUser shape
    return NextResponse.json(
      {
        success: true,
        user: {
          id: String(laravelUser.id),
          email: laravelUser.email,
          displayName: laravelUser.name,
          role: laravelUser.role,
          emailVerified: true,
          photoUrl: null,
          roles: laravelUser.role
            ? [{ role: { slug: laravelUser.role, permissions: [] } }]
            : [],
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json(
      { error: 'Failed to get user', details: error.message },
      { status: 500 }
    );
  }
}
