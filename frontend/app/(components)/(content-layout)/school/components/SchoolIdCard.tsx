'use client'

import React, { useEffect, useState } from 'react'
import { Card } from 'react-bootstrap'

type Settings = {
  school_name?: string | null
  short_name?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  postal_code?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  logo_url?: string | null
}

export default function SchoolIdCard() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/school/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        setSettings(data || null)
      })
      .catch((err) => {
        console.error('Failed to load school settings', err)
        if (mounted) setError('Failed to load')
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  if (loading)
    return (
      <Card className="mb-3">
        <Card.Body>Loading school info...</Card.Body>
      </Card>
    )
  if (error || !settings)
    return (
      <Card className="mb-3">
        <Card.Body>No school info</Card.Body>
      </Card>
    )

  return (
    <Card className="mb-3 text-center">
      {settings.logo_url && (
        <Card.Img
          variant="top"
          src={settings.logo_url}
          alt={`${settings.school_name} logo`}
          style={{
            maxHeight: 120,
            objectFit: 'contain',
            padding: 16,
            background: '#fff',
          }}
        />
      )}
      <Card.Body>
        <Card.Title className="mb-1">
          {settings.school_name || settings.short_name}
        </Card.Title>
        {settings.address_line1 && (
          <div className="text-muted small">{settings.address_line1}</div>
        )}
        {settings.city && (
          <div className="text-muted small">
            {settings.city} {settings.postal_code || ''}
          </div>
        )}
        <hr />
        <div className="small">
          {settings.phone && <span>Phone: {settings.phone}</span>}
        </div>
        <div className="small">
          {settings.email && <span>Email: {settings.email}</span>}
        </div>
      </Card.Body>
    </Card>
  )
}
