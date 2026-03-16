import { NextRequest, NextResponse } from 'next/server';

// Supported module subdomains
const MODULES = ['finance', 'labs', 'school'];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Extract subdomain: "finance.lyzer.test:3000" → "finance"
  // Works for both *.lyzer.test and localhost-based fake subdomains
  const hostWithoutPort = hostname.split(':')[0];
  const parts = hostWithoutPort.split('.');
  const subdomain = parts.length >= 3 ? parts[0] : null;

  // If we have a valid module subdomain, rewrite to /{module}{pathname}
  if (subdomain && MODULES.includes(subdomain)) {
    // Avoid double-prefixing if path already starts with /module
    if (!pathname.startsWith(`/${subdomain}`)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${subdomain}${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except Next.js internals and static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
