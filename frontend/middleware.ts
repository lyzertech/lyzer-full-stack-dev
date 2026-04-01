/**
 * Next.js Middleware
 * 
 * Protects routes at the edge before rendering
 * Uses session_token cookie for authentication
 * 
 * Login page: /
 * Signup page: /authentication/sign-up
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboards',
  '/school',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token from cookies
  const sessionToken = request.cookies.get('laravel_token')?.value;
  const hasSessionCookie = !!sessionToken;

  // Check if route is protected (requires auth)
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // Protected routes: redirect to login page (/) if no session cookie
  if (isProtectedRoute && !hasSessionCookie) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }



  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};

