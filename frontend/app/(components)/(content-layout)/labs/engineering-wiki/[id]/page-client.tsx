'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { useRouter, useParams } from 'next/navigation'
import { getEngineeringWikiById } from '@/app/actions/labs/engineering-wiki.actions'
import type { EngineeringWiki } from '@/lib/labs/repositories/engineering-wiki.repository'
import PriorityBadge from '../components/PriorityBadge'
import StatusBadge from '../components/StatusBadge'

const EngineeringWikiDetailPage: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const id = BigInt(params.id as string)
  const [wiki, setWiki] = useState<EngineeringWiki | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWiki()
  }, [id])

  async function loadWiki() {
    setLoading(true)
    setError(null)
    try {
      const data = await getEngineeringWikiById(id)
      if (!data) {
        setError('Engineering wiki not found')
        return
      }
      setWiki(data)
    } catch (err: any) {
      console.error('Error loading engineering wiki:', err)
      setError(err.message || 'Failed to load engineering wiki')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <Fragment>
        <Seo title="Engineering Wiki Detail" />
        <Pageheader
          title="Labs"
          subtitle="Engineering Wiki"
          currentpage="Engineering Wiki Detail"
          activepage="Engineering Wiki Detail"
        />
        <div className="text-center">Loading...</div>
      </Fragment>
    )
  }

  if (error || !wiki) {
    return (
      <Fragment>
        <Seo title="Engineering Wiki Detail" />
        <Pageheader
          title="Labs"
          subtitle="Engineering Wiki"
          currentpage="Engineering Wiki Detail"
          activepage="Engineering Wiki Detail"
        />
        <div className="alert alert-danger">{error || 'Engineering wiki not found'}</div>
      </Fragment>
    )
  }

  return (
    <Fragment>
      <Seo title="Engineering Wiki Detail" />
      <Pageheader
        title="Labs"
        subtitle="Engineering Wiki"
        currentpage="Engineering Wiki Detail"
        activepage="Engineering Wiki Detail"
      />

      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="fw-bold py-3 mb-0">
              <i className="ri-book-open-line me-2"></i> Engineering Wiki Detail
            </h4>
            <Button variant="outline-secondary" onClick={() => router.push('/labs/engineering-wiki')}>
              <i className="ri-arrow-left-line me-1"></i> Back
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light fw-bold d-flex align-items-center">
              <i className="ri-cpu-line me-2"></i> Device Info
            </Card.Header>
            <Card.Body>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>Title:</strong> {wiki.title}
                </li>
                <li className="list-group-item">
                  <strong>Customer Name:</strong> {wiki.customer_name || '-'}
                </li>
                <li className="list-group-item">
                  <strong>Category:</strong>{' '}
                  <span className={`badge ${getCategoryBadgeClass(wiki.category)}`}>
                    {wiki.category.charAt(0).toUpperCase() + wiki.category.slice(1)}
                  </span>
                </li>
                <li className="list-group-item">
                  <strong>Brand:</strong> {wiki.brand || '-'}
                </li>
                <li className="list-group-item">
                  <strong>Device Type:</strong> {wiki.device_type || '-'}
                </li>
                <li className="list-group-item">
                  <strong>Model:</strong> {wiki.model || '-'}
                </li>
                <li className="list-group-item">
                  <strong>Serial Number:</strong> {wiki.serial_number || '-'}
                </li>
                <li className="list-group-item">
                  <strong>Firmware Version:</strong> {wiki.firmware_version || '-'}
                </li>
                <li className="list-group-item">
                  <strong>Hardware Version:</strong> {wiki.hardware_version || '-'}
                </li>
                <li className="list-group-item">
                  <strong>Status:</strong> <StatusBadge status={wiki.status} />
                </li>
                <li className="list-group-item">
                  <strong>Priority:</strong> <PriorityBadge priority={wiki.priority} />
                </li>
                <li className="list-group-item">
                  <strong>Reference Doc:</strong> {wiki.reference_doc || '-'}
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light fw-bold d-flex align-items-center">
              <i className="ri-edit-box-line me-2"></i> Engineering Notes
            </Card.Header>
            <Card.Body>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>Symptom:</strong>
                  <br />
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {wiki.symptom || '-'}
                  </div>
                  {(wiki.symptom_file || wiki.symptom_image) && (
                    <div className="mt-2">
                      {wiki.symptom_file && (
                        <a
                          href={wiki.symptom_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-2"
                        >
                          <i className="ri-attachment-line me-1"></i> File
                        </a>
                      )}
                      {wiki.symptom_image && (
                        <a
                          href={wiki.symptom_image}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={wiki.symptom_image}
                            alt="Symptom"
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'contain',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              background: '#f8f9fa',
                              verticalAlign: 'middle',
                              display: 'inline-block',
                            }}
                          />
                          <i className="ri-camera-line ms-1"></i>
                        </a>
                      )}
                    </div>
                  )}
                </li>
                <li className="list-group-item">
                  <strong>Root Cause:</strong>
                  <br />
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {wiki.root_cause || '-'}
                  </div>
                  {(wiki.root_cause_file || wiki.root_cause_image) && (
                    <div className="mt-2">
                      {wiki.root_cause_file && (
                        <a
                          href={wiki.root_cause_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-2"
                        >
                          <i className="ri-attachment-line me-1"></i> File
                        </a>
                      )}
                      {wiki.root_cause_image && (
                        <a
                          href={wiki.root_cause_image}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={wiki.root_cause_image}
                            alt="Root Cause"
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'contain',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              background: '#f8f9fa',
                              verticalAlign: 'middle',
                              display: 'inline-block',
                            }}
                          />
                          <i className="ri-camera-line ms-1"></i>
                        </a>
                      )}
                    </div>
                  )}
                </li>
                <li className="list-group-item">
                  <strong>Solution:</strong>
                  <br />
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {wiki.solution || '-'}
                  </div>
                  {(wiki.solution_file || wiki.solution_image) && (
                    <div className="mt-2">
                      {wiki.solution_file && (
                        <a
                          href={wiki.solution_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-2"
                        >
                          <i className="ri-attachment-line me-1"></i> File
                        </a>
                      )}
                      {wiki.solution_image && (
                        <a
                          href={wiki.solution_image}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={wiki.solution_image}
                            alt="Solution"
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'contain',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              background: '#f8f9fa',
                              verticalAlign: 'middle',
                              display: 'inline-block',
                            }}
                          />
                          <i className="ri-camera-line ms-1"></i>
                        </a>
                      )}
                    </div>
                  )}
                </li>
                <li className="list-group-item">
                  <strong>Action Taken:</strong>
                  <br />
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {wiki.action_taken || '-'}
                  </div>
                  {(wiki.action_taken_file || wiki.action_taken_image) && (
                    <div className="mt-2">
                      {wiki.action_taken_file && (
                        <a
                          href={wiki.action_taken_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-2"
                        >
                          <i className="ri-attachment-line me-1"></i> File
                        </a>
                      )}
                      {wiki.action_taken_image && (
                        <a
                          href={wiki.action_taken_image}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={wiki.action_taken_image}
                            alt="Action Taken"
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'contain',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              background: '#f8f9fa',
                              verticalAlign: 'middle',
                              display: 'inline-block',
                            }}
                          />
                          <i className="ri-camera-line ms-1"></i>
                        </a>
                      )}
                    </div>
                  )}
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default EngineeringWikiDetailPage

