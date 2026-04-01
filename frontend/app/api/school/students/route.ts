import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const urlParams = new URL(req.url).search
    const laravelUrl = process.env.LARAVEL_API_URL || 'http://localhost:8000'
    const url = `${laravelUrl}/api/students${urlParams}`
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store'
    })
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Error calling Laravel API' }))
        return NextResponse.json(errorData, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/school/students error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const laravelUrl = process.env.LARAVEL_API_URL || 'http://localhost:8000'
    const url = `${laravelUrl}/api/students`

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
    console.error('POST /api/school/students error:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...patch } = body
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const laravelUrl = process.env.LARAVEL_API_URL || 'http://localhost:8000'
    const url = `${laravelUrl}/api/students/${id}`

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(patch),
    })

    const data = await res.json()

    if (!res.ok) {
        return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('PATCH /api/school/students error:', error)
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    )
  }
}
