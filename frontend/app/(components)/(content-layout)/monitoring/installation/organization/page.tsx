'use client'

import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import React, { useState, useMemo, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import {
  Card,
  Col,
  Row,
  Button,
  Badge,
  Form,
  InputGroup,
  Table,
  Dropdown,
  Modal,
  Pagination,
} from 'react-bootstrap'
import Link from 'next/link'
import { useAuth } from '@/shared/auth/AuthContext'
import { canCreateMonitoringInstallation } from '@/shared/monitoring/roleAccess'

const OrganizationPage = () => {
  const { user } = useAuth()
  const canCreate = canCreateMonitoringInstallation(user?.role)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrganizations = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/monitoring/organizations')
      setOrganizations(response.data)
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  // Filter Logic
  const filteredOrgs = useMemo(() => {
    return organizations.filter(
      (org) =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.industry?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [organizations, searchQuery])

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredOrgs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredOrgs.length / itemsPerPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <Badge bg="success-transparent" className="text-success">
            Active
          </Badge>
        )
      case 'Maintenance':
        return (
          <Badge bg="warning-transparent" className="text-warning">
            Maintenance
          </Badge>
        )
      case 'Suspended':
        return (
          <Badge bg="danger-transparent" className="text-danger">
            Suspended
          </Badge>
        )
      default:
        return (
          <Badge bg="light" className="text-dark">
            {status}
          </Badge>
        )
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await apiClient.delete(`/monitoring/organizations/${id}`)
        fetchOrganizations()
      } catch (error) {
        console.error('Failed to delete organization:', error)
      }
    }
  }

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    industry: 'Manufacturing',
    headquarters_address: '',
    tier: 'Standard',
  })

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreate) return
    try {
      await apiClient.post('/monitoring/organizations', formData)
      alert('Organization created successfully!')
      setShowAddModal(false)
      setFormData({
        name: '',
        code: '',
        industry: 'Manufacturing',
        headquarters_address: '',
        tier: 'Standard',
      })
      fetchOrganizations()
    } catch (error: any) {
      console.error('Failed to create organization:', error)
      alert(
        'Error: ' + (error.response?.data?.message || error.message || 'Failed to create organization'),
      )
    }
  }

  return (
    <React.Fragment>
      <Seo title="Organization Management - Monitoring" />

      <Pageheader
        title="Organizations"
        subtitle="Installation"
        currentpage="Multi-Organization Manager"
        activepage="Monitoring"
      />

      {/* Overview Stats */}
      <Row className="mb-4">
        <Col xl={3} lg={6} md={6}>
          <Card className="custom-card bg-primary text-fixed-white border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-fill">
                  <p className="mb-1 opacity-70 text-fixed-white">Total Organizations</p>
                  <h4 className="fw-semibold mb-0 text-fixed-white">
                    {organizations.length}
                  </h4>
                </div>
                <div className="avatar avatar-lg bg-white-transparent text-fixed-white avatar-rounded shadow-sm">
                  <i className="bi bi-buildings fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <Card className="custom-card bg-secondary text-fixed-white border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-fill">
                  <p className="mb-1 opacity-70 text-fixed-white">Global Facilities</p>
                  <h4 className="fw-semibold mb-0 text-fixed-white">
                    {organizations.reduce(
                      (acc, org) => acc + Number(org.facilities_count || 0),
                      0,
                    )}
                  </h4>
                </div>
                <div className="avatar avatar-lg bg-white-transparent text-fixed-white avatar-rounded shadow-sm">
                  <i className="bi bi-geo-alt fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <Card className="custom-card bg-success text-fixed-white border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-fill">
                  <p className="mb-1 opacity-70 text-fixed-white">Total Devices</p>
                  <h4 className="fw-semibold mb-0 text-fixed-white">
                    {organizations
                      .reduce(
                        (acc, org) => acc + Number(org.devices_count || 0),
                        0,
                      )
                      .toLocaleString()}
                  </h4>
                </div>
                <div className="avatar avatar-lg bg-white-transparent text-fixed-white avatar-rounded shadow-sm">
                  <i className="bi bi-cpu fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <Card className="custom-card bg-info text-fixed-white border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-fill">
                  <p className="mb-1 opacity-70 text-fixed-white">System Health</p>
                  <h4 className="fw-semibold mb-0 text-fixed-white">99.2%</h4>
                </div>
                <div className="avatar avatar-lg bg-white-transparent text-fixed-white avatar-rounded shadow-sm">
                  <i className="bi bi-check2-circle fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Management Section */}
      <Card className="custom-card shadow-sm border-0">
        <Card.Header className="d-flex justify-content-between align-items-center border-bottom-0 pb-0">
          <Card.Title className="fw-bold fs-16">
            Organization Portfolio
          </Card.Title>
          <div className="d-flex gap-2">
            <InputGroup size="sm" className="shadow-sm">
              <Form.Control
                type="text"
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="primary-light" className="border-start-0">
                <i className="bi bi-search"></i>
              </Button>
            </InputGroup>
            {canCreate ? (
              <Button
                variant="primary"
                size="sm"
                className="shadow-sm text-nowrap"
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-plus-lg me-1"></i> New Organization
              </Button>
            ) : null}
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive mt-3">
            <Table className="table table-hover text-nowrap align-middle border-0">
              <thead className="border-0">
                <tr>
                  <th className="border-0">Organization Name</th>
                  <th className="border-0">Code</th>
                  <th className="border-0">Headquarters</th>
                  <th className="border-0">Industry</th>
                  <th className="border-0">Structure</th>
                  <th className="border-0 text-center">Tier</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((org) => (
                    <tr key={org.id} className="border-bottom border-default">
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-md bg-primary-transparent text-primary me-3 avatar-rounded border border-primary-transparent">
                            <i className={`bi ${org.logo} fs-16`}></i>
                          </div>
                          <div>
                            <Link
                              href={`/monitoring/installation/facility?org_id=${org.id}&org_name=${encodeURIComponent(org.name)}`}
                              className="fw-bold fs-14 text-dark text-decoration-none hover-primary"
                              style={{ cursor: 'pointer' }}
                            >
                              {org.name}
                            </Link>
                            <div className="text-muted fs-11">
                              {org.tier} Member
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge
                          bg="body-secondary"
                          className="text-primary border border-default px-2 py-1"
                        >
                          {org.code}
                        </Badge>
                      </td>
                      <td>
                        <span className="text-muted fs-13">
                          {org.headquarters_address || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-outline-info rounded-pill px-3">
                          {org.industry}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fs-12 fw-semibold">
                            {org.facilities_count} Facilities
                          </span>
                          <span className="fs-11 text-muted">
                            {Number(org.devices_count || 0).toLocaleString()}{' '}
                            Devices
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge
                          bg={
                            org.tier === 'Enterprise'
                              ? 'secondary'
                              : org.tier === 'Premium'
                                ? 'primary'
                                : 'info'
                          }
                          className="rounded-pill px-2"
                        >
                          {org.tier}
                        </Badge>
                      </td>
                      <td className="text-center">
                        {getStatusBadge(org.status)}
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-1">
                          <Button
                            variant="info-light"
                            size="sm"
                            className="btn-icon rounded-pill shadow-sm"
                            onClick={() => { setSelectedOrg(org); setShowDetailModal(true) }}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          {canCreate ? (
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="light"
                                size="sm"
                                className="btn-icon no-caret rounded-pill shadow-sm"
                              >
                                <i className="bi bi-three-dots"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu
                                align="end"
                                className="shadow-lg border-0"
                              >
                                <Link
                                  href={`/monitoring/installation/facility?org_id=${org.id}&org_name=${encodeURIComponent(org.name)}`}
                                  className="dropdown-item"
                                >
                                  <i className="bi bi-geo-alt me-2 text-primary"></i>{' '}
                                  Manage Facilities
                                </Link>
                                <Dropdown.Item href="#">
                                  <i className="bi bi-pencil me-2 text-info"></i>{' '}
                                  Edit Details
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item
                                  href="#"
                                  className="text-danger"
                                  onClick={() => handleDelete(org.id)}
                                >
                                  <i className="bi bi-trash me-2"></i> Delete
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
                      <div className="text-muted fs-16">
                        No organizations found matching "{searchQuery}"
                      </div>
                      <Button
                        variant="link"
                        className="mt-2"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear search
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        <Card.Footer className="border-top-0 d-flex align-items-center justify-content-between py-3">
          <span className="text-muted fs-12 fw-medium">
            Showing {indexOfFirstItem + 1} to{' '}
            {Math.min(indexOfLastItem, filteredOrgs.length)} of{' '}
            {filteredOrgs.length} results
          </span>
          <Pagination className="pagination-sm mb-0 shadow-sm">
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx + 1}
                active={idx + 1 === currentPage}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            />
          </Pagination>
        </Card.Footer>
      </Card>

      {/* Add Modal */}
      {canCreate ? (
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        centered
        className="fade effect-scale"
      >
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fs-18 fw-bold text-primary">
            Register New Organization
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleFormSubmit}>
            <Row className="gy-4">
              <Col md={12}>
                <Form.Label className="fw-semibold">
                  Organization Name
                </Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter company name"
                  className="form-control-lg border-default"
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold">Short Code</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g. LYZ"
                  className="border-default"
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold">Industry</Form.Label>
                <Form.Select
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  className="border-default"
                >
                  <option>Manufacturing</option>
                  <option>Energy & Utilities</option>
                  <option>Healthcare</option>
                  <option>Logistics</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold">Membership Tier</Form.Label>
                <Form.Select
                  value={formData.tier}
                  onChange={(e) =>
                    setFormData({ ...formData, tier: e.target.value })
                  }
                  className="border-default"
                >
                  <option>Standard</option>
                  <option>Premium</option>
                  <option>Enterprise</option>
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold">
                  Headquarters Address
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.headquarters_address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      headquarters_address: e.target.value,
                    })
                  }
                  placeholder="Full address..."
                  className="border-default"
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button
            variant="light"
            className="px-4"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="px-4 shadow-sm"
            onClick={handleFormSubmit}
          >
            Create Organization
          </Button>
        </Modal.Footer>
      </Modal>
      ) : null}
      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered
        size="lg"
        className="fade effect-scale"
      >
        {selectedOrg && (
          <>
            <Modal.Header closeButton className="border-bottom-0 pb-0">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar avatar-lg bg-primary-transparent text-primary avatar-rounded border border-primary-transparent">
                  <i className={`bi ${selectedOrg.logo || 'bi-buildings'} fs-18`}></i>
                </div>
                <div>
                  <Modal.Title className="fs-17 fw-bold mb-0">{selectedOrg.name}</Modal.Title>
                  <span className="text-muted fs-12">{selectedOrg.tier} Member &bull; {selectedOrg.code}</span>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body className="p-4">
              <Row className="gy-3">
                {/* Tier & Status */}
                <Col md={6}>
                  <div className="p-3 rounded-3 bg-light border border-default">
                    <p className="text-muted fs-11 fw-semibold mb-1 text-uppercase">Membership Tier</p>
                    <Badge
                      bg={
                        selectedOrg.tier === 'Enterprise'
                          ? 'secondary'
                          : selectedOrg.tier === 'Premium'
                            ? 'primary'
                            : 'info'
                      }
                      className="rounded-pill px-3 py-2 fs-13"
                    >
                      {selectedOrg.tier}
                    </Badge>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded-3 bg-light border border-default">
                    <p className="text-muted fs-11 fw-semibold mb-1 text-uppercase">Status</p>
                    {getStatusBadge(selectedOrg.status)}
                  </div>
                </Col>
                {/* Industry */}
                <Col md={6}>
                  <div className="p-3 rounded-3 bg-light border border-default">
                    <p className="text-muted fs-11 fw-semibold mb-1 text-uppercase">Industry</p>
                    <span className="badge bg-outline-info rounded-pill px-3 fs-13">{selectedOrg.industry || '—'}</span>
                  </div>
                </Col>
                {/* Short Code */}
                <Col md={6}>
                  <div className="p-3 rounded-3 bg-light border border-default">
                    <p className="text-muted fs-11 fw-semibold mb-1 text-uppercase">Short Code</p>
                    <Badge bg="body-secondary" className="text-primary border border-default px-3 py-2 fs-13">
                      {selectedOrg.code}
                    </Badge>
                  </div>
                </Col>
                {/* Structure */}
                <Col md={6}>
                  <div className="p-3 rounded-3 bg-light border border-default">
                    <p className="text-muted fs-11 fw-semibold mb-1 text-uppercase">Facilities</p>
                    <span className="fw-bold fs-20 text-primary">{selectedOrg.facilities_count ?? 0}</span>
                    <span className="text-muted fs-12 ms-1">facilities</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded-3 bg-light border border-default">
                    <p className="text-muted fs-11 fw-semibold mb-1 text-uppercase">Devices</p>
                    <span className="fw-bold fs-20 text-success">
                      {Number(selectedOrg.devices_count || 0).toLocaleString()}
                    </span>
                    <span className="text-muted fs-12 ms-1">devices</span>
                  </div>
                </Col>
                {/* Headquarters */}
                <Col md={12}>
                  <div className="p-3 rounded-3 bg-light border border-default">
                    <p className="text-muted fs-11 fw-semibold mb-1 text-uppercase">
                      <i className="bi bi-geo-alt me-1"></i>Headquarters Address
                    </p>
                    <span className="fs-13 text-dark">{selectedOrg.headquarters_address || '—'}</span>
                  </div>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-top-0 pt-0 justify-content-between">
              <span className="text-muted fs-11">
                ID: #{selectedOrg.id} &bull; Created: {selectedOrg.created_at ? new Date(selectedOrg.created_at).toLocaleDateString() : '—'}
              </span>
              <Button variant="light" className="px-4" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </React.Fragment>
  )
}

export default OrganizationPage
