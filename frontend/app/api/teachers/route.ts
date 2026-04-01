import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const laravelUrl = process.env.LARAVEL_API_URL || 'http://localhost:8000'
    const url = `${laravelUrl}/api/teachers`
    
    // Fallback headers if needed, normally NextJS fetches from Laravel with internal headers.
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // 'Authorization': `Bearer ...` // Add if needed
      },
      cache: 'no-store'
    })
    
    if (!res.ok) {
        // Fallback or handle if subdomain route is strictly enforced:
        // Try direct api route if possible
        const errorData = await res.json().catch(() => ({ error: 'Error calling Laravel API' }))
        return NextResponse.json(errorData, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/teachers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const laravelUrl = process.env.LARAVEL_API_URL || 'http://localhost:8000'
    const url = `${laravelUrl}/api/teachers`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    
    if (!res.ok) {
        return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('POST /api/teachers error:', error)
    return NextResponse.json(
      { error: 'Failed to create teacher' },
      { status: 500 }
    )
  }
}
