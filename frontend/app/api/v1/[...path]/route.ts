import { NextRequest, NextResponse } from 'next/server'
import { getLaravelApiUrl } from '@/lib/api-config'

/**
 * Dev proxy: browser → same-origin /api/v1/* → Laravel (api.lyzer.my.id or local).
 * Forwards Authorization so Bearer sessions work when testing live API from localhost.
 */
async function proxyToLaravel(request: NextRequest, pathSegments: string[]) {
  const base = getLaravelApiUrl().replace(/\/$/, '')
  const path = pathSegments.map((p) => encodeURIComponent(p)).join('/')
  const target = new URL(`${base}/api/v1/${path}`)
  target.search = request.nextUrl.search

  const headers = new Headers()
  headers.set('Accept', 'application/json')

  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('Content-Type', contentType)

  const authorization = request.headers.get('authorization')
  const xAuthorization = request.headers.get('x-authorization')
  if (authorization) headers.set('Authorization', authorization)
  if (xAuthorization) headers.set('X-Authorization', xAuthorization)

  const hasBody = !['GET', 'HEAD'].includes(request.method)
  const body = hasBody ? await request.text() : undefined

  const upstream = await fetch(target.toString(), {
    method: request.method,
    headers,
    body: body && body.length > 0 ? body : undefined,
    cache: 'no-store',
  })

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
    },
  })
}

type RouteContext = { params: Promise<{ path: string[] }> }

async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyToLaravel(request, path)
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
export const OPTIONS = handle
