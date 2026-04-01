import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000';

/**
 * POST /api/auth/signout
 *
 * Proxies logout to Laravel POST /api/logout (Sanctum).
 * Deletes the laravel_token cookie regardless of Laravel response.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('laravel_token')?.value;

    if (token) {
      // Tell Laravel to revoke the token (best-effort)
      try {
        await fetch(`${LARAVEL_API_URL}/api/v1/logout`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error('Laravel logout call failed (continuing):', err);
      }
    }

    // Always clear the cookie on the Next.js side
    cookieStore.delete('laravel_token');

    return NextResponse.json(
      { success: true, message: 'Signed out successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('POST /api/auth/signout error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out', details: error.message },
      { status: 500 }
    );
  }
}
