'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row, Table, Form } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import {
  getEngineeringWikis,
  deleteEngineeringWiki,
  getDistinctBrands,
  getDistinctDeviceTypes,
} from '@/app/actions/labs/engineering-wiki.actions'
import type { EngineeringWiki } from '@/lib/labs/repositories/engineering-wiki.repository'
import type { EngineeringWikiFilters } from '@/lib/labs/repositories/engineering-wiki.repository'
import PriorityBadge from './components/PriorityBadge'
import StatusBadge from './components/StatusBadge'

const EngineeringWikiPage: React.FC = () => {
  const router = useRouter()
  const [wikis, setWikis] = useState<EngineeringWiki[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [brands, setBrands] = useState<string[]>([])
  const [deviceTypes, setDeviceTypes] = useState<string[]>([])
  const [filters, setFilters] = useState<EngineeringWikiFilters>({})

  useEffect(() => {
    loadWikis()
    loadDistinctValues()
  }, [])

  useEffect(() => {
    loadWikis()
  }, [filters])

  async function loadWikis() {
    setLoading(true)
    setError(null)
    try {
      const data = await getEngineeringWikis(filters)
      setWikis(data)
    } catch (err: any) {
      console.error('Error loading engineering wikis:', err)
      setError(err.message || 'Failed to load engineering wikis')
    } finally {
      setLoading(false)
    }
  }

  async function loadDistinctValues() {
    try {
      const [brandsData, deviceTypesData] = await Promise.all([
        getDistinctBrands(),
        getDistinctDeviceTypes(),
      ])
      setBrands(brandsData)
      setDeviceTypes(deviceTypesData)
    } catch (err) {
      console.error('Error loading distinct values:', err)
    }
  }

  const handleFilterChange = (key: keyof EngineeringWikiFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : (value as any),
    }))
  }

  const handleResetFilters = () => {
    setFilters({})
  }

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this wiki?')) return
    try {
      await deleteEngineeringWiki(id)
      loadWikis()
    } catch (err: any) {
      alert(err.message || 'Failed to delete wiki')
    }
  }

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'issue':
        return 'bg-danger'
      case 'update':
        return 'bg-warning text-dark'
      case 'note':
        return 'bg-info'
      default:
        return 'bg-secondary'
    }
  }

  return (
    <Fragment>
      <Seo title="Engineering Wiki" />
      <Pageheader
        title="Labs"
        subtitle="Engineering Wiki"
        currentpage="Engineering Wiki"
        activepage="Manage Engineering Wiki"
      />

      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="fw-bold py-3 mb-0">Engineering Wiki</h4>
            <Button
              variant="primary"
              className="btn-wave"
              onClick={() => router.push('/labs/engineering-wiki/create')}
            >
              <i className="ri-add-line me-1 align-middle" /> Add New Wiki
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Engineering Wiki List</div>
            </Card.Header>
            <Card.Body>
              {error && <div className="alert alert-danger mb-3">{error}</div>}

              <div className="table-responsive">
                <Table className="table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th className="text-nowrap">Customer Name</th>
                      <th>Category</th>
                      <th>Brand</th>
                      <th>Device Type</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={filters.category || ''}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                          <option value="">Category</option>
                          <option value="issue">Issue</option>
                          <option value="update">Update</option>
                          <option value="note">Note</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={filters.brand || ''}
                          onChange={(e) => handleFilterChange('brand', e.target.value)}
                        >
                          <option value="">Brand</option>
                          {brands.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={filters.device_type || ''}
                          onChange={(e) => handleFilterChange('device_type', e.target.value)}
                        >
                          <option value="">Device Type</option>
                          {deviceTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={filters.status || ''}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                          <option value="">Status</option>
                          <option value="open">Open</option>
                          <option value="monitoring">Monitoring</option>
                          <option value="solved">Solved</option>
                          <option value="closed">Closed</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={filters.priority || ''}
                          onChange={(e) => handleFilterChange('priority', e.target.value)}
                        >
                          <option value="">Priority</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </Form.Select>
                      </td>
                      <td></td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="w-100"
                            onClick={() => loadWikis()}
                          >
                            Filter
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="w-100"
                            onClick={handleResetFilters}
                          >
                            Reset
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : wikis.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted">
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      wikis.map((wiki) => (
                        <tr key={wiki.id.toString()}>
                          <td>{wiki.title}</td>
                          <td>{wiki.customer_name || '-'}</td>
                          <td>
                            <span className={`badge ${getCategoryBadgeClass(wiki.category)}`}>
                              {wiki.category.charAt(0).toUpperCase() + wiki.category.slice(1)}
                            </span>
                          </td>
                          <td>{wiki.brand || '-'}</td>
                          <td>{wiki.device_type || '-'}</td>
                          <td>
                            <StatusBadge status={wiki.status} />
                          </td>
                          <td>
                            <PriorityBadge priority={wiki.priority} />
                          </td>
                          <td>
                            {new Date(wiki.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                            })}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                size="sm"
                                variant="info"
                                onClick={() =>
                                  router.push(`/labs/engineering-wiki/${wiki.id.toString()}`)
                                }
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="warning"
                                onClick={() =>
                                  router.push(`/labs/engineering-wiki/${wiki.id.toString()}/edit`)
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDelete(wiki.id)}
                              >
                                Delete
                              </Button>
                              <Button size="sm" variant="secondary" title="Report">
                                <i className="ri-file-text-line me-1"></i>Report
                              </Button>
                            </div>
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

export default EngineeringWikiPage

