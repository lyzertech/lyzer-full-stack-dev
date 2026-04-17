'use client'

import React, { Fragment, useMemo, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap'

const roleData = [
  { name: 'Administrator', users: 4, permissionCount: 18, status: 'System' },
  { name: 'Manager', users: 12, permissionCount: 11, status: 'Custom' },
  { name: 'Editor', users: 21, permissionCount: 8, status: 'Custom' },
  { name: 'Viewer', users: 37, permissionCount: 3, status: 'System' },
]

const RolePage: React.FC = () => {
  const [keyword, setKeyword] = useState('')

  const filteredRoles = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return roleData
    return roleData.filter((role) => role.name.toLowerCase().includes(q))
  }, [keyword])

  return (
    <Fragment>
      <Seo title="Roles" />
      <Pageheader title="Users" subtitle="Role" currentpage="Role" activepage="Role Management" />
      <Row className="g-3"><Col xl={12}><Card className="custom-card"><Card.Header className="justify-content-between"><div className="card-title">Role Management</div><div className="d-flex align-items-center gap-2"><Form.Control type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search role..." className="form-control-sm" /><Button variant="primary" size="sm" className="btn-wave"><i className="ri-add-line me-1" /> New Role</Button></div></Card.Header><Card.Body><div className="table-responsive"><Table className="table-hover align-middle mb-0"><thead><tr><th>Role</th><th className="text-end">Users</th><th className="text-end">Permissions</th><th>Status</th><th className="text-end">Action</th></tr></thead><tbody>{filteredRoles.length === 0 ? (<tr><td colSpan={5} className="text-center text-muted">No roles found</td></tr>) : (filteredRoles.map((role) => (<tr key={role.name}><td className="fw-medium">{role.name}</td><td className="text-end">{role.users}</td><td className="text-end">{role.permissionCount}</td><td><span className={`badge ${role.status === 'System' ? 'bg-primary' : 'bg-info'}`}>{role.status}</span></td><td className="text-end"><Button variant="light" size="sm" className="btn-wave me-2">Edit</Button><Button variant="danger-light" size="sm" className="btn-wave">Delete</Button></td></tr>)))}</tbody></Table></div></Card.Body></Card></Col></Row>
    </Fragment>
  )
}

export default RolePage
