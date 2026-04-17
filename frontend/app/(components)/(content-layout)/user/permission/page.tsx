'use client'

import React, { Fragment, useMemo, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap'

const permissions = [
  { key: 'users.view', module: 'Users', description: 'View user list', assignedRoles: 'Admin, Manager' },
  { key: 'users.create', module: 'Users', description: 'Create new users', assignedRoles: 'Admin' },
  { key: 'roles.manage', module: 'Roles', description: 'Manage role configuration', assignedRoles: 'Admin' },
  { key: 'permissions.manage', module: 'Permissions', description: 'Manage permission matrix', assignedRoles: 'Admin' },
  { key: 'reports.read', module: 'Reports', description: 'Read operational reports', assignedRoles: 'Admin, Manager, Viewer' },
]

const PermissionPage: React.FC = () => {
  const [moduleFilter, setModuleFilter] = useState('All')
  const modules = useMemo(() => ['All', ...Array.from(new Set(permissions.map((item) => item.module)))], [])
  const filteredPermissions = useMemo(() => {
    if (moduleFilter === 'All') return permissions
    return permissions.filter((item) => item.module === moduleFilter)
  }, [moduleFilter])

  return (
    <Fragment>
      <Seo title="Permissions" />
      <Pageheader title="Users" subtitle="Permission" currentpage="Permission" activepage="Permission Matrix" />
      <Row className="g-3"><Col xl={12}><Card className="custom-card"><Card.Header className="justify-content-between"><div className="card-title">Permission Matrix</div><div className="d-flex align-items-center gap-2"><Form.Select className="form-select-sm" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} style={{ width: '160px' }}>{modules.map((module) => (<option key={module} value={module}>{module}</option>))}</Form.Select><Button variant="primary" size="sm" className="btn-wave"><i className="ri-shield-keyhole-line me-1" /> Add Permission</Button></div></Card.Header><Card.Body><div className="table-responsive"><Table className="table-hover align-middle mb-0"><thead><tr><th>Permission Key</th><th>Module</th><th>Description</th><th>Assigned Roles</th><th className="text-end">Action</th></tr></thead><tbody>{filteredPermissions.map((item) => (<tr key={item.key}><td className="fw-medium">{item.key}</td><td><span className="badge bg-primary-transparent text-primary">{item.module}</span></td><td>{item.description}</td><td className="text-muted">{item.assignedRoles}</td><td className="text-end"><Button variant="light" size="sm" className="btn-wave me-2">Edit</Button><Button variant="danger-light" size="sm" className="btn-wave">Revoke</Button></td></tr>))}</tbody></Table></div></Card.Body></Card></Col></Row>
    </Fragment>
  )
}

export default PermissionPage
