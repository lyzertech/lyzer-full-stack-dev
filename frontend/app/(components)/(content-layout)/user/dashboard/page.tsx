'use client'

import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap'

/** Mirrors auth_roles + aggregate counts from the API (see backend migration auth_roles). */
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

/** Mirrors auth_users.status enum from migration. */
type AuthUserStatus =
  | 'Active'
  | 'Inactive'
  | 'Suspended'
  | 'Banned'
  | 'PendingVerification'

const AUTH_USER_STATUS_OPTIONS: AuthUserStatus[] = [
  'Active',
  'PendingVerification',
  'Inactive',
  'Suspended',
  'Banned',
]

type RecentUserRow = {
  id: number
  name: string
  email: string
  role: string | null
  status: AuthUserStatus | string
}

type AddUserFormState = {
  email: string
  password: string
  first_name: string
  last_name: string
  display_name: string
  status: AuthUserStatus
  role_id: string
}

const defaultAddUserForm = (): AddUserFormState => ({
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  display_name: '',
  status: 'Active',
  role_id: '',
})

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'Active':
      return 'bg-success'
    case 'PendingVerification':
      return 'bg-warning'
    case 'Inactive':
      return 'bg-secondary'
    case 'Suspended':
    case 'Banned':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
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

function mapRecentUserRows(rows: unknown[]): RecentUserRow[] {
  return rows.map((r) => {
    const row = r as Record<string, unknown>
    return {
      id: Number(row.id),
      name: String(row.name ?? ''),
      email: String(row.email ?? ''),
      role: row.role != null && row.role !== '' ? String(row.role) : null,
      status: String(row.status ?? ''),
    }
  })
}

const UserDashboard: React.FC = () => {
  const [usersByRole, setUsersByRole] = useState<UsersByRoleRow[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [rolesError, setRolesError] = useState<string | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUserRow[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [recentError, setRecentError] = useState<string | null>(null)

  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [addUserForm, setAddUserForm] = useState<AddUserFormState>(defaultAddUserForm)
  const [addUserSubmitting, setAddUserSubmitting] = useState(false)
  const [addUserError, setAddUserError] = useState<string | null>(null)

  const reloadDashboard = useCallback(async () => {
    setLoadingRoles(true)
    setLoadingRecent(true)
    setRolesError(null)
    setRecentError(null)
    try {
      const [rolesRes, recentRes] = await Promise.all([
        fetch('/api/user/dashboard/users-by-role', { cache: 'no-store' }),
        fetch('/api/user/dashboard/recent-users', { cache: 'no-store' }),
      ])

      if (!rolesRes.ok) {
        const body = await rolesRes.json().catch(() => ({}))
        const msg =
          typeof body?.error === 'string'
            ? body.error
            : `Could not load roles (${rolesRes.status})`
        setRolesError(msg)
      } else {
        const json = await rolesRes.json()
        const rows = Array.isArray(json?.data) ? json.data : []
        setUsersByRole(mapUsersByRoleRows(rows))
      }

      if (!recentRes.ok) {
        const body = await recentRes.json().catch(() => ({}))
        const msg =
          typeof body?.error === 'string'
            ? body.error
            : `Could not load recent users (${recentRes.status})`
        setRecentError(msg)
      } else {
        const json = await recentRes.json()
        const rows = Array.isArray(json?.data) ? json.data : []
        setRecentUsers(mapRecentUserRows(rows))
      }
    } catch {
      setRolesError('Network error while loading roles.')
      setRecentError('Network error while loading recent users.')
    } finally {
      setLoadingRoles(false)
      setLoadingRecent(false)
    }
  }, [])

  useEffect(() => {
    void reloadDashboard()
  }, [reloadDashboard])

  const activeUsers = useMemo(
    () => usersByRole.reduce((acc, item) => acc + item.active, 0),
    [usersByRole],
  )
  const totalUsers = useMemo(
    () => usersByRole.reduce((acc, item) => acc + item.total, 0),
    [usersByRole],
  )
  const pendingUsers = useMemo(
    () => usersByRole.reduce((acc, item) => acc + item.pending, 0),
    [usersByRole],
  )

  const openAddUserModal = () => {
    setAddUserForm(defaultAddUserForm())
    setAddUserError(null)
    setShowAddUserModal(true)
  }

  const closeAddUserModal = () => {
    if (addUserSubmitting) return
    setShowAddUserModal(false)
    setAddUserError(null)
  }

  const handleAddUserField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setAddUserForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddUserSubmitting(true)
    setAddUserError(null)
    try {
      const payload: Record<string, unknown> = {
        email: addUserForm.email.trim(),
        password: addUserForm.password,
        first_name: addUserForm.first_name.trim() || null,
        last_name: addUserForm.last_name.trim() || null,
        display_name: addUserForm.display_name.trim() || null,
        status: addUserForm.status,
        role_id: addUserForm.role_id ? Number(addUserForm.role_id) : null,
      }

      const res = await fetch('/api/user/dashboard/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const body = await res.json().catch(() => null)

      if (!res.ok) {
        if (body && typeof body === 'object' && body !== null && 'errors' in body) {
          const errs = (body as { errors?: Record<string, string[]> }).errors
          const flat =
            errs && typeof errs === 'object'
              ? Object.values(errs)
                  .flat()
                  .filter((m) => typeof m === 'string')
                  .join(' ')
              : ''
          setAddUserError(flat || (body as { message?: string }).message || `Request failed (${res.status})`)
        } else {
          setAddUserError(
            typeof (body as { error?: string })?.error === 'string'
              ? (body as { error: string }).error
              : `Could not create user (${res.status})`,
          )
        }
        return
      }

      setShowAddUserModal(false)
      setAddUserForm(defaultAddUserForm())
      await reloadDashboard()
    } catch {
      setAddUserError('Network error while creating user.')
    } finally {
      setAddUserSubmitting(false)
    }
  }

  return (
    <Fragment>
      <Seo title="User Dashboard" />
      <Pageheader
        title="Users"
        subtitle="Dashboard"
        currentpage="Dashboard"
        activepage="User Dashboard"
      />

      <Modal
        show={showAddUserModal}
        onHide={closeAddUserModal}
        centered
        className="fade"
        id="add-user-modal"
        tabIndex={-1}
        aria-labelledby="add-user-modal-title"
      >
        <Modal.Header closeButton>
          <Modal.Title as="h6" id="add-user-modal-title">
            Add user
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddUserSubmit}>
          <Modal.Body className="px-4">
            {addUserError ? (
              <Alert variant="danger" className="mb-3 py-2">
                {addUserError}
              </Alert>
            ) : null}
            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="fs-12">Email</Form.Label>
                  <Form.Control
                    name="email"
                    type="email"
                    required
                    autoComplete="off"
                    value={addUserForm.email}
                    onChange={handleAddUserField}
                    disabled={addUserSubmitting}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="fs-12">Password</Form.Label>
                  <Form.Control
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={addUserForm.password}
                    onChange={handleAddUserField}
                    disabled={addUserSubmitting}
                  />
                  <Form.Text className="fs-11">Minimum 8 characters.</Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="fs-12">First name</Form.Label>
                  <Form.Control
                    name="first_name"
                    type="text"
                    value={addUserForm.first_name}
                    onChange={handleAddUserField}
                    disabled={addUserSubmitting}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="fs-12">Last name</Form.Label>
                  <Form.Control
                    name="last_name"
                    type="text"
                    value={addUserForm.last_name}
                    onChange={handleAddUserField}
                    disabled={addUserSubmitting}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-2">
              <Form.Label className="fs-12">Display name</Form.Label>
              <Form.Control
                name="display_name"
                type="text"
                value={addUserForm.display_name}
                onChange={handleAddUserField}
                disabled={addUserSubmitting}
              />
            </Form.Group>
            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="fs-12">Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={addUserForm.status}
                    onChange={handleAddUserField}
                    disabled={addUserSubmitting}
                  >
                    {AUTH_USER_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s === 'PendingVerification' ? 'Pending verification' : s}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="fs-12">Role</Form.Label>
                  <Form.Select
                    name="role_id"
                    value={addUserForm.role_id}
                    onChange={handleAddUserField}
                    disabled={addUserSubmitting || loadingRoles}
                  >
                    <option value="">No role</option>
                    {usersByRole.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" type="button" onClick={closeAddUserModal} disabled={addUserSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={addUserSubmitting}>
              {addUserSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving…
                </>
              ) : (
                'Create user'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Row className="g-3">
        <Col xl={4} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">Total Users</p>
                  <h3 className="mb-0">
                    {loadingRoles ? <Spinner animation="border" size="sm" /> : totalUsers}
                  </h3>
                </div>
                <span className="avatar avatar-md bg-primary-transparent">
                  <i className="ri-group-line fs-20"></i>
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} md={6}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">Active Users</p>
                  <h3 className="mb-0 text-success">
                    {loadingRoles ? <Spinner animation="border" size="sm" /> : activeUsers}
                  </h3>
                </div>
                <span className="avatar avatar-md bg-success-transparent">
                  <i className="ri-user-follow-line fs-20"></i>
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} md={12}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">Pending Invites</p>
                  <h3 className="mb-0 text-warning">
                    {loadingRoles ? <Spinner animation="border" size="sm" /> : pendingUsers}
                  </h3>
                </div>
                <span className="avatar avatar-md bg-warning-transparent">
                  <i className="ri-user-add-line fs-20"></i>
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between">
              <div className="card-title">Users By Role</div>
              <Link
                href="/user/role"
                className="btn btn-primary-light btn-sm btn-wave d-inline-flex align-items-center"
              >
                <i className="ri-user-settings-line me-1" />
                Manage Roles
              </Link>
            </Card.Header>
            <Card.Body>
              {rolesError ? (
                <Alert variant="warning" className="mb-0">
                  {rolesError}
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table className="table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th className="text-center">System</th>
                        <th className="text-end">Total</th>
                        <th className="text-end">Active</th>
                        <th className="text-end">Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingRoles ? (
                        <tr>
                          <td colSpan={6} className="text-center py-4">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading roles…
                          </td>
                        </tr>
                      ) : usersByRole.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-muted text-center py-4">
                            No active roles found.
                          </td>
                        </tr>
                      ) : (
                        usersByRole.map((item) => (
                          <tr key={item.id}>
                            <td className="fw-medium">
                              <div>{item.name}</div>
                              {item.description ? (
                                <span className="text-muted fs-12 text-truncate d-block mw-100">
                                  {item.description}
                                </span>
                              ) : null}
                            </td>
                            <td>
                              <code className="fs-12">{item.slug}</code>
                            </td>
                            <td className="text-center">
                              {item.is_system ? (
                                <span className="badge bg-secondary-transparent">System</span>
                              ) : (
                                <span className="text-muted fs-12">—</span>
                              )}
                            </td>
                            <td className="text-end">{item.total}</td>
                            <td className="text-end text-success">{item.active}</td>
                            <td className="text-end text-warning">{item.pending}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between">
              <div className="card-title">Recent Users</div>
              <Button
                variant="secondary-light"
                size="sm"
                className="btn-wave"
                type="button"
                onClick={openAddUserModal}
              >
                <i className="ri-add-line me-1" />
                Add User
              </Button>
            </Card.Header>
            <Card.Body>
              {recentError ? (
                <Alert variant="warning" className="mb-0">
                  {recentError}
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table className="table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingRecent ? (
                        <tr>
                          <td colSpan={3} className="text-center py-4">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading users…
                          </td>
                        </tr>
                      ) : recentUsers.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-muted text-center py-4">
                            No users yet.
                          </td>
                        </tr>
                      ) : (
                        recentUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <p className="mb-0 fw-medium">{user.name}</p>
                              <span className="text-muted fs-12">{user.email}</span>
                            </td>
                            <td>{user.role ?? <span className="text-muted fs-12">—</span>}</td>
                            <td>
                              <span className={`badge ${statusBadgeClass(user.status)}`}>
                                {user.status === 'PendingVerification' ? 'Pending' : user.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default UserDashboard
