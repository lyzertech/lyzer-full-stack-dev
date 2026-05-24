'use client'

import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import {
  Card,
  Col,
  Row,
  Button,
  Badge,
  Form,
  InputGroup,
  Dropdown,
  Modal,
} from 'react-bootstrap'
import Link from 'next/link'

const FacilityPage = () => {
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState('')
  // Pre-select org from query param if coming from Organization page
  const [selectedOrg, setSelectedOrg] = useState(
    searchParams.get('org_id') ?? '1',
  )

  const [organizations, setOrganizations] = useState<any[]>([])
  const [facilities, setFacilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInitialData = async () => {
    try {
      const response = await apiClient.get('/monitoring/organizations')
      const orgData = response.data
      setOrganizations(orgData)
      if (orgData.length > 0 && !selectedOrg) {
        setSelectedOrg(String(orgData[0].id))
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
    }
  }

  const fetchFacilities = async () => {
    if (!selectedOrg) return
    setLoading(true)
    try {
      const res = await apiClient.get(
        `/monitoring/facilities?organization_id=${selectedOrg}`,
      )
      setFacilities(res.data)
    } catch (error) {
      console.error('Failed to fetch facilities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedOrg) {
      fetchFacilities()
    }
  }, [selectedOrg])

  // Filter Logic
  const filteredFacilities = useMemo(() => {
    return facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location_name?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [facilities, searchQuery])

  // Form State
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location_name: '',
    facility_type: 'Manufacturing',
    full_address: '',
    manager_name: '',
  })

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.post('/monitoring/facilities', { ...formData, organization_id: selectedOrg })
      alert('Facility registered successfully!')
      setShowAddModal(false)
      setFormData({
        name: '',
        code: '',
        location_name: '',
        facility_type: 'Manufacturing',
        full_address: '',
        manager_name: '',
      })
      fetchFacilities()
    } catch (error: any) {
      console.error('Failed to create facility:', error)
      alert(
        'Error: ' + (error.response?.data?.message || error.message || 'Failed to register facility'),
      )
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        await apiClient.delete(`/monitoring/facilities/${id}`)
        fetchFacilities()
      } catch (error) {
        console.error('Failed to delete facility:', error)
      }
    }
  }

  return (
    <React.Fragment>
      <Seo title="Facility Management - Monitoring" />
      <Pageheader
        title="Facility"
        subtitle="Installation"
        currentpage="Facility Management"
        activepage="Monitoring"
      />

      <Row className="mb-4">
        <Col xl={12}>
          <Card className="custom-card shadow-sm border-0">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center flex-fill gap-3">
                  <div style={{ minWidth: '220px' }}>
                    <Form.Label className="fs-11 fw-bold text-muted mb-1 text-uppercase">
                      Context Organization
                    </Form.Label>
                    <Form.Select
                      className="form-select-sm border-default shadow-none"
                      value={selectedOrg}
                      onChange={(e) => setSelectedOrg(e.target.value)}
                    >
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  <div className="flex-fill max-w-400">
                    <Form.Label className="fs-11 fw-bold text-muted mb-1 text-uppercase">
                      Search Facilities
                    </Form.Label>
                    <InputGroup size="sm" className="shadow-none">
                      <Form.Control
                        type="text"
                        placeholder="Filter by name or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-default"
                      />
                      <Button
                        variant="primary-light"
                        className="border-default border-start-0"
                      >
                        <i className="bi bi-search"></i>
                      </Button>
                    </InputGroup>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-auto">
                  <Button
                    variant="primary"
                    size="sm"
                    className="px-3 shadow-sm"
                    onClick={() => setShowAddModal(true)}
                  >
                    <i className="bi bi-plus-lg me-1"></i> New Facility
                  </Button>
                  <Button variant="outline-light" size="sm" className="px-3">
                    <i className="bi bi-download"></i>
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {filteredFacilities.length > 0 &&
          filteredFacilities.map((facility) => (
            <Col
              xxl={3}
              xl={4}
              lg={6}
              md={6}
              key={facility.id}
              className="mb-4"
            >
              <Card className="custom-card h-100 border-0 shadow-sm overflow-hidden transition-all hover-lift">
                <div
                  className={`p-1 bg-${
                    facility.status === 'Online'
                      ? 'success'
                      : facility.status === 'Warning'
                        ? 'warning'
                        : 'info'
                  }`}
                ></div>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="avatar avatar-lg bg-primary-transparent text-primary avatar-rounded shadow-sm">
                      <i
                        className={`bi ${
                          facility.type === 'Manufacturing'
                            ? 'bi-buildings'
                            : facility.type === 'Energy'
                              ? 'bi-lightning-charge'
                              : 'bi-house-gear'
                        } fs-20`}
                      ></i>
                    </div>
                    <Badge
                      bg={
                        facility.status === 'Online'
                          ? 'success-transparent'
                          : 'warning-transparent'
                      }
                      className={`text-${facility.status === 'Online' ? 'success' : 'warning'} px-2 rounded-pill`}
                    >
                      <span className="dot-label bg-current me-1"></span>{' '}
                      {facility.status}
                    </Badge>
                  </div>
                  <h5 className="fw-bold mb-1">{facility.name}</h5>
                  <p className="text-muted fs-12 mb-3 d-flex align-items-center">
                    <i className="bi bi-geo-alt-fill text-primary opacity-50 me-1"></i>{' '}
                    {facility.location_name || facility.full_address || '—'}
                  </p>

                  <div className="row g-2 mb-4">
                    <div className="col-6">
                      <div className="p-2 bg-primary-transparent rounded-3 text-center border border-primary-transparent">
                        <p className="mb-0 text-muted fs-10 text-uppercase fw-bold">
                          Active Devices
                        </p>
                        <h6 className="fw-bold mb-0 text-primary">
                          {facility.devices_count ?? 0}
                        </h6>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 bg-secondary-transparent rounded-3 text-center border border-secondary-transparent">
                        <p className="mb-0 text-muted fs-10 text-uppercase fw-bold">
                          Facility Type
                        </p>
                        <h6 className="fw-bold mb-0 text-secondary fs-11">
                          {facility.facility_type || '—'}
                        </h6>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-4">
                    <div className="flex-fill">
                      <p className="mb-0 text-muted fs-11 text-uppercase fw-bold">
                        Site Manager
                      </p>
                      <p className="mb-0 fw-semibold fs-13">
                        {facility.manager_name || '—'}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="mb-0 text-muted fs-11 text-uppercase fw-bold">
                        Address
                      </p>
                      <p
                        className="mb-0 fs-11 text-muted"
                        style={{
                          maxWidth: '130px',
                          wordBreak: 'break-word',
                          whiteSpace: 'normal',
                          textAlign: 'right',
                        }}
                      >
                        {facility.full_address || facility.location_name || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="d-grid mt-2">
                    <Link
                      href={`/monitoring/installation/devices?org_id=${selectedOrg}&facility_id=${facility.id}&facility_name=${encodeURIComponent(facility.name)}`}
                      className="btn btn-primary-light btn-wave w-100 shadow-none border-0"
                    >
                      Manage Devices <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-light-transparent border-top-0 py-2 px-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fs-10 text-muted fw-medium">
                      <i className="bi bi-clock me-1"></i>Sync: 2m ago
                    </span>
                    <div className="dropdown">
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="light"
                          size="sm"
                          className="btn-icon no-caret border-0 shadow-none bg-transparent rounded-pill"
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          align="end"
                          className="shadow-lg border-0"
                        >
                          <Dropdown.Item href="#" className="fs-13">
                            <i className="bi bi-pencil-square me-2 text-info"></i>{' '}
                            Edit Facility
                          </Dropdown.Item>
                          <Dropdown.Item href="#" className="fs-13">
                            <i className="bi bi-bar-chart-line me-2 text-primary"></i>{' '}
                            Site Analytics
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            onClick={() => handleDelete(facility.id)}
                            className="fs-13 text-danger"
                          >
                            <i className="bi bi-trash3 me-2"></i> Delete Site
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}

        {filteredFacilities.length === 0 && (
          <Col xl={12}>
            <div className="text-center p-5 bg-primary-transparent rounded-3 shadow-sm border border-default">
              <i className="bi bi-search fs-40 text-muted opacity-25"></i>
              <h5 className="mt-3 fw-bold">No facilities found</h5>
              <p className="text-muted">
                No sites are currently registered under this organization or
                matching your search.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedOrg('1')
                }}
              >
                Reset Filters
              </Button>
            </div>
          </Col>
        )}

        <Col xxl={3} xl={4} lg={6} md={6} className="mb-4">
          <Card className="custom-card h-100 border-2 border-dashed d-flex align-items-center justify-content-center bg-light-transparent hover-lift">
            <div className="text-center p-4">
              <div className="avatar avatar-xl bg-primary-transparent text-primary avatar-rounded mb-3 mx-auto shadow-sm border border-primary-transparent">
                <i className="bi bi-plus-lg fs-24"></i>
              </div>
              <h6 className="fw-bold mb-1 text-dark">Add New Facility</h6>
              <p className="text-muted fs-12 mb-3">
                Expand your monitoring network
              </p>
              <Button
                variant="primary"
                size="sm"
                className="rounded-pill px-4 shadow-sm"
                onClick={() => setShowAddModal(true)}
              >
                Create Facility
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary">
            New Facility Registration
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form id="facility-form" onSubmit={handleFormSubmit}>
            <Row className="gy-4">
              <Col md={12}>
                <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                  Facility Name
                </Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Rayong Factory A"
                  className="form-control-lg border-default shadow-none"
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                  Unique Code
                </Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g. FAC-RYG-01"
                  className="border-default shadow-none"
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                  Facility Type
                </Form.Label>
                <Form.Select
                  className="border-default shadow-none"
                  value={formData.facility_type}
                  onChange={(e) =>
                    setFormData({ ...formData, facility_type: e.target.value })
                  }
                >
                  <option>Manufacturing</option>
                  <option>Logistics</option>
                  <option>Office</option>
                  <option>Data Center</option>
                  <option>Energy Site</option>
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                  Location Name
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.location_name}
                  onChange={(e) =>
                    setFormData({ ...formData, location_name: e.target.value })
                  }
                  placeholder="e.g. Rayong, Thailand"
                  className="border-default shadow-none"
                />
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                  Site Manager
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.manager_name}
                  onChange={(e) =>
                    setFormData({ ...formData, manager_name: e.target.value })
                  }
                  placeholder="Enter manager name"
                  className="border-default shadow-none"
                />
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                  Full Address
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.full_address}
                  onChange={(e) =>
                    setFormData({ ...formData, full_address: e.target.value })
                  }
                  placeholder="Complete site address..."
                  className="border-default shadow-none"
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            type="button"
            variant="light"
            className="px-4"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="facility-form"
            variant="primary"
            className="px-4 shadow-sm"
          >
            Register Facility
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  )
}

export default FacilityPage
