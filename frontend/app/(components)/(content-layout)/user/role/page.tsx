'use client'

import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Alert, Button, Card, Col, Form, Row, Spinner, Table, Modal } from 'react-bootstrap'
import { apiClient } from '@/lib/api-client'

type UsersByRoleRow = {
  id: number
  name: string
  slug: string
  description: string | null
  is_system: boolean
  is_active: boolean
  total: number
  active: number
  pending: number
}

function mapUsersByRoleRows(rows: unknown[]): UsersByRoleRow[] {
  return rows.map((r) => {
    const row = r as Record<string, unknown>
    return {
      id: Number(row.id),
      name: String(row.name ?? ''),
      slug: String(row.slug ?? ''),
      description: row.description != null ? String(row.description) : null,
      is_system: Boolean(row.is_system),
      is_active: Boolean(row.is_active),
      total: Number(row.total ?? 0),
      active: Number(row.active ?? 0),
      pending: Number(row.pending ?? 0),
    }
  })
}

const RolePage: React.FC = () => {
  const [roles, setRoles] = useState<UsersByRoleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')

  const [showAddRoleModal, setShowAddRoleModal] = useState(false)
  const [addRoleForm, setAddRoleForm] = useState({ name: '', slug: '', description: '', is_system: false })
  const [addRoleSubmitting, setAddRoleSubmitting] = useState(false)
  const [addRoleError, setAddRoleError] = useState<string | null>(null)

  const loadRoles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/users/dashboard/users-by-role', { cache: 'no-store' })
      if (res.status !== 200) {
        const body = res.data || {}
        const msg = typeof body?.error === 'string' ? body.error : `Could not load roles (${res.status})`
        setError(msg)
      } else {
        const json = res.data
        const rows = Array.isArray(json?.data) ? json.data : []
        setRoles(mapUsersByRoleRows(rows))
      }
    } catch (e: any) {
      if (e.response?.status !== 401) {
        setError('Network error while loading roles.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRoles()
  }, [loadRoles])

  const filteredRoles = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return roles
    return roles.filter((role) => role.name.toLowerCase().includes(q) || role.slug.toLowerCase().includes(q))
  }, [keyword, roles])

  const openAddRoleModal = () => {
    setAddRoleForm({ name: '', slug: '', description: '', is_system: false })
    setAddRoleError(null)
    setShowAddRoleModal(true)
  }

  const closeAddRoleModal = () => {
    if (addRoleSubmitting) return
    setShowAddRoleModal(false)
    setAddRoleError(null)
  }

  const handleAddRoleField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setAddRoleForm((prev) => ({ ...prev, [name]: checked }))
    } else {
      setAddRoleForm((prev) => {
        const next = { ...prev, [name]: value }
        if (name === 'name' && (!prev.slug || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))) {
          next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        }
        return next
      })
    }
  }

  const handleAddRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddRoleSubmitting(true)
    setAddRoleError(null)
    try {
      const payload = {
        name: addRoleForm.name.trim(),
        slug: addRoleForm.slug.trim(),
        description: addRoleForm.description.trim() || null,
        is_system: addRoleForm.is_system,
      }

      const res = await apiClient.post('/users/dashboard/roles', payload)

      const body = res.data

      if (res.status !== 201 && res.status !== 200) {
        if (body && typeof body === 'object' && body !== null && 'errors' in body) {
          const errs = (body as { errors?: Record<string, string[]> }).errors
          const flat = errs && typeof errs === 'object'
            ? Object.values(errs).flat().filter((m) => typeof m === 'string').join(' ')
            : ''
          setAddRoleError(flat || (body as { message?: string }).message || `Request failed (${res.status})`)
        } else {
          setAddRoleError(typeof (body as { error?: string })?.error === 'string'
            ? (body as { error: string }).error
            : `Could not create role (${res.status})`
          )
        }
        return
      }

      setShowAddRoleModal(false)
      setAddRoleForm({ name: '', slug: '', description: '', is_system: false })
      await loadRoles()
    } catch (e: any) {
      if (e.response?.status !== 401) {
        setAddRoleError('Network error while creating role.')
      }
    } finally {
      setAddRoleSubmitting(false)
    }
  }

  return (
    <Fragment>
      <Seo title="Roles" />
      <Pageheader
        title="Users"
        subtitle="Role"
        currentpage="Role"
        activepage="Role Management"
      />

      <Modal
        show={showAddRoleModal}
        onHide={closeAddRoleModal}
        centered
        className="fade"
      >
        <Modal.Header closeButton>
          <Modal.Title as="h6">Add New Role</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddRoleSubmit}>
          <Modal.Body className="px-4">
            {addRoleError ? (
              <Alert variant="danger" className="mb-3 py-2">
                {addRoleError}
              </Alert>
            ) : null}
            <Form.Group className="mb-3">
              <Form.Label className="fs-12 fw-medium">Role Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                name="name"
                type="text"
                placeholder="e.g. Content Reviewer"
                required
                value={addRoleForm.name}
                onChange={handleAddRoleField}
                disabled={addRoleSubmitting}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12 fw-medium">Role Slug <span className="text-danger">*</span></Form.Label>
              <Form.Control
                name="slug"
                type="text"
                placeholder="e.g. content-reviewer"
                required
                value={addRoleForm.slug}
                onChange={handleAddRoleField}
                disabled={addRoleSubmitting}
              />
              <Form.Text className="fs-11 text-muted">A unique identifier, usually lowercase separating words with hyphens.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fs-12 fw-medium">Description</Form.Label>
              <Form.Control
                name="description"
                as="textarea"
                rows={3}
                placeholder="Optional description of this role's duties..."
                value={addRoleForm.description}
                onChange={handleAddRoleField}
                disabled={addRoleSubmitting}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Check
                type="checkbox"
                id="is-system-checkbox"
                name="is_system"
                label={<span className="fs-13">System Role (Cannot be deleted or reassigned easily)</span>}
                checked={addRoleForm.is_system}
                onChange={handleAddRoleField}
                disabled={addRoleSubmitting}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="light"
              type="button"
              onClick={closeAddRoleModal}
              disabled={addRoleSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={addRoleSubmitting}
            >
              {addRoleSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                'Create Role'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Row className="g-3">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between">
              <div className="card-title">Role Management</div>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search role..."
                  className="form-control-sm"
                />
                <Button
                  variant="primary"
                  size="sm"
                  className="btn-wave"
                  onClick={openAddRoleModal}
                >
                  <i className="ri-add-line me-1" /> New Role
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {error ? (
                <Alert variant="warning" className="mb-3">
                  {error}
                </Alert>
              ) : null}
              <div className="table-responsive">
                <Table className="table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th className="text-end">Users</th>
                      <th className="text-end">Permissions</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          <Spinner animation="border" size="sm" className="me-2" />
                          Loading roles...
                        </td>
                      </tr>
                    ) : filteredRoles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">
                          No roles found
                        </td>
                      </tr>
                    ) : (
                      filteredRoles.map((role) => (
                        <tr key={role.id}>
                          <td className="fw-medium">
                            {role.name}
                            <div className="fs-12 text-muted fw-normal">{role.slug}</div>
                          </td>
                          <td className="text-end">
                            <div>{role.total}</div>
                            {role.active > 0 && <span className="text-success fs-12">{role.active} active</span>}
                          </td>
                          <td className="text-end text-muted">—</td>
                          <td>
                            {role.is_system ? (
                              <span className="badge bg-primary">System</span>
                            ) : (
                              <span className="badge bg-info">Custom</span>
                            )}
                          </td>
                          <td className="text-end">
                            <Button
                              variant="light"
                              size="sm"
                              className="btn-wave me-2"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger-light"
                              size="sm"
                              className="btn-wave"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default RolePage
