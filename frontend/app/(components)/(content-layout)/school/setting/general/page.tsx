'use client'

import React, { Fragment, useEffect, useRef, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row, Form } from 'react-bootstrap'

type Settings = {
  id?: number
  school_code?: string | null
  school_name?: string | null
  short_name?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  contact_person_name?: string | null
  contact_person_phone?: string | null
  contact_person_email?: string | null
  logo_url?: string | null
  timezone?: string | null
  locale?: string | null
  academic_year_start?: string | null
  academic_year_end?: string | null
}

export default function SchoolSettingsGeneralPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)

  async function loadSettings() {
    setLoading(true)
    try {
      const r = await fetch('/api/school/settings')
      if (!r.ok) throw new Error('Failed to load')
      const data = await r.json()
      setSettings(data || {})
    } catch (err) {
      console.error(err)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setSettings((prev) => ({ ...(prev || {}), [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/school/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings || {}),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to save settings')
      } else {
        setSettings(data)
        setSuccess('Settings saved')
        setEditing(false)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Fragment>
      <Seo title="General Settings" />
      <Pageheader
        title="School"
        subtitle="Settings"
        currentpage="Settings"
        activepage="Settings"
      />

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between d-flex align-items-center">
              <div className="card-title">General Settings</div>
              <div>
                {!editing ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="btn-wave"
                    onClick={() => setEditing(true)}
                  >
                    <i className="ri-edit-line me-1 align-middle" /> Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      onClick={async () => {
                        setEditing(false)
                        setError(null)
                        setSuccess(null)
                        await loadSettings()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="btn-wave"
                      onClick={() => formRef.current?.requestSubmit()}
                    >
                      <i className="ri-save-line me-1 align-middle" /> Save
                    </Button>
                  </>
                )}
              </div>
            </Card.Header>

            <Card.Body className="custom-data-table">
              {loading && <p>Loading...</p>}
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <Form ref={formRef} id="settings-form" onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>School Name *</Form.Label>
                      <Form.Control
                        name="school_name"
                        value={settings?.school_name || ''}
                        onChange={handleChange}
                        required
                        disabled={!editing}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Short Name</Form.Label>
                      <Form.Control
                        name="short_name"
                        value={settings?.short_name || ''}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Address Line 1</Form.Label>
                      <Form.Control
                        name="address_line1"
                        value={settings?.address_line1 || ''}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        name="city"
                        value={settings?.city || ''}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Postal Code</Form.Label>
                      <Form.Control
                        name="postal_code"
                        value={settings?.postal_code || ''}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        name="phone"
                        value={settings?.phone || ''}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        name="email"
                        type="email"
                        value={settings?.email || ''}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Website</Form.Label>
                      <Form.Control
                        name="website"
                        value={settings?.website || ''}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Timezone</Form.Label>
                      <Form.Control
                        name="timezone"
                        value={settings?.timezone || ''}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Academic Year Start</Form.Label>
                      <Form.Control
                        name="academic_year_start"
                        type="date"
                        value={settings?.academic_year_start || ''}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    variant="primary"
                    className="btn-wave"
                    disabled={saving || !editing}
                  >
                    {saving ? (
                      'Saving...'
                    ) : (
                      <>
                        <i className="ri-save-line me-1 align-middle" /> Save
                        Settings
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}
