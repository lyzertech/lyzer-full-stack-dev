import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000';

/**
 * POST /api/auth/signin
 *
 * Proxies login to Laravel POST /api/login (Sanctum).
 * Stores the returned Sanctum token in an httpOnly cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Basic field check before hitting Laravel
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Forward credentials to Laravel
    const laravelRes = await fetch(`${LARAVEL_API_URL}/api/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await laravelRes.json();

    if (!laravelRes.ok) {
      // Laravel returns 422 for validation / wrong credentials
      const message =
        data?.errors?.email?.[0] ||
        data?.message ||
        'Invalid credentials';
      return NextResponse.json({ error: message }, { status: 401 });
    }

    // Store Sanctum token in httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('laravel_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: String(data.user.id),
          email: data.user.email,
          displayName: data.user.name,
          role: data.user.role,
        },
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('POST /api/auth/signin error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate user', details: error.message },
      { status: 500 }
    );
  }
}
