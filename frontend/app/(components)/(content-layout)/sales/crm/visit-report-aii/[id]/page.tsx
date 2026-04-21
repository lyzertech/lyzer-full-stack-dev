'use client'

import Link from 'next/link'
import React, { use, useEffect, useState } from 'react'
import { Card, Col, Row, Spinner, Form, Button } from 'react-bootstrap'
import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import { useAuth } from '@/shared/auth/AuthContext'

const VisitReportDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const decodedId = decodeURIComponent(id)
  const { user } = useAuth()

  const [report, setReport] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state for editable fields
  const [formData, setFormData] = useState({
    notes: '',
    customer_feedback: '',
    next_steps: '',
    follow_up_date: '',
    prospek: '',
    response: '',
    ack_manager: '',
    ack_director: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchReport = async () => {
      try {
        const res = await fetch('/api/sales/visit-reports', {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('Failed to fetch data from API')
        const data = await res.json()
        if (isMounted) {
          let found = null
          if (Array.isArray(data)) {
            found = data.find(
              (r: any) =>
                r.id_visit_report === decodedId ||
                r.idVisitReport === decodedId ||
                r.id?.toString() === decodedId,
            )
          } else if (data?.data && Array.isArray(data.data)) {
            found = data.data.find(
              (r: any) =>
                r.id_visit_report === decodedId ||
                r.idVisitReport === decodedId ||
                r.id?.toString() === decodedId,
            )
          }

          if (found) {
            setReport(found)
            setFormData({
              notes: found.notes || '',
              customer_feedback:
                found.customer_feedback || found.customerFeedback || '',
              next_steps: found.next_steps || found.nextSteps || '',
              follow_up_date: found.follow_up_date || found.followUpDate || '',
              prospek: found.prospek || '',
              response: found.response || '',
              ack_manager: found.ack_manager || '',
              ack_director: found.ack_director || '',
            })
          } else {
            setError(`Report '${decodedId}' not found.`)
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Unknown error fetching data.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchReport()
    return () => {
      isMounted = false
    }
  }, [decodedId])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let currentStatus = report.status || 'Pending';
      const inputsFilled = !!(
        formData.notes?.trim() ||
        formData.customer_feedback?.trim() ||
        formData.follow_up_date ||
        formData.prospek ||
        formData.next_steps?.trim()
      );

      if (formData.response && formData.response.trim() !== '') {
        currentStatus = 'Completed';
      } else if (formData.ack_director && formData.ack_director.trim() !== '') {
        currentStatus = 'Checked';
      } else if (formData.ack_manager && formData.ack_manager.trim() !== '') {
        currentStatus = 'Reviewed';
      } else if (
        inputsFilled &&
        (!report.status || report.status === 'Planned' || report.status === 'Pending')
      ) {
        currentStatus = 'Submitted';
      }

      const payload = { ...report, ...formData, status: currentStatus }
      const res = await fetch(`/api/sales/visit-reports/${decodedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Failed to update report')
      }

      // Update local state to reflect saved changes
      setReport({ ...payload })
      alert('Report updated successfully!')
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving.')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-5 d-flex justify-content-center">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-4">
        <h4 className="text-danger">
          {error || `Report '${decodedId}' not found`}
        </h4>
        <Link
          href="/sales/crm/visit-report-aii"
          className="btn btn-primary mt-3"
        >
          Back
        </Link>
      </div>
    )
  }

  const companyName = report.customer_name || report.company || '-'
  const contactPerson = report.contact_person || report.contactPerson || '-'
  const meetingPoint = report.location || report.meetingPoint || '-'
  const purpose = report.purpose || '-'
  const salesPerson = report.sales || '-'
  const isAuthorizedSales = user?.displayName === salesPerson
  const isAuthorizedManager = user?.role === 'manager' || user?.displayName === 'Vicha'
  const isAuthorizedDirector = user?.role === 'director' || user?.displayName === 'David'
  const canSave = isAuthorizedSales || isAuthorizedManager || isAuthorizedDirector
  const isLockedForSales = !!(formData.ack_manager?.trim() || formData.ack_director?.trim())
  const isManagerLocked = !!formData.ack_director?.trim();
  const isCompleted = report.status === 'Completed' || !!report.response?.trim();

  const rawDate =
    report.visit_date ||
    report.visitDate ||
    (report.visitDateTime ? report.visitDateTime.split(' ')[0] : '-')
  let rawTime =
    report.visit_time ||
    report.visitTime ||
    (report.visitDateTime ? report.visitDateTime.split(' ')[1] : '-')
  if (rawTime && rawTime !== '-') rawTime = rawTime.slice(0, 8)

  const statusBadgeColor =
    {
      Completed: 'success',
      Checked: 'danger',
      Reviewed: 'warning',
      Submitted: 'primary',
      Planned: 'info',
      Cancelled: 'light text-muted',
    }[report.status as string] || 'primary'

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2 mt-4">
        <div>
          <h1 className="page-title fw-medium fs-20 mb-0">{companyName}</h1>
          <div className="text-muted fs-12 mt-1">Mr./Mrs {contactPerson}</div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <SpkBadge Customclass={`bg-${statusBadgeColor}-transparent me-2`}>
            {report.status || 'Pending'}
          </SpkBadge>
          <button className="btn btn-icon btn-sm btn-light border">
            <i className="ri-share-line"></i>
          </button>
          <button className="btn btn-icon btn-sm btn-light border">
            <i className="ri-bookmark-line"></i>
          </button>
        </div>
      </div>

      <Card className="custom-card">
        <Card.Body className="p-4 p-md-5">
          <h5 className="fw-semibold mb-4 text-muted">Detail Visit</h5>

          <h6 className="fw-semibold mb-3 fs-15">{purpose}</h6>

          <Row className="gy-3 mb-4 text-muted fs-13">
            <Col sm={6}>
              <div className="d-flex align-items-center gap-2">
                <i className="ri-user-line fs-16"></i>
                <span>Sales: {salesPerson}</span>
              </div>
            </Col>
            <Col sm={6}>
              <div className="d-flex align-items-center gap-2">
                <i className="ri-calendar-line fs-16"></i>
                <span>Date: {rawDate}</span>
              </div>
            </Col>
            <Col sm={6}>
              <div className="d-flex align-items-center gap-2">
                <i className="ri-global-line fs-16"></i>
                <span>Location: {meetingPoint}</span>
              </div>
            </Col>
            <Col sm={6}>
              <div className="d-flex align-items-center gap-2">
                <i className="ri-time-line fs-16"></i>
                <span>Time: {rawTime}</span>
              </div>
            </Col>
          </Row>

          <hr className="border-top border-block-start-dashed" />

          <div className="mb-4 mt-4">
            <h6 className="fw-semibold mb-2 fs-14">Notes</h6>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              disabled={!isAuthorizedSales || isLockedForSales}
            />
          </div>

          <div className="mb-4">
            <h6 className="fw-semibold mb-2 fs-14">Customer Feedback</h6>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter customer feedback..."
              value={formData.customer_feedback}
              onChange={(e) =>
                setFormData({ ...formData, customer_feedback: e.target.value })
              }
              disabled={!isAuthorizedSales || isLockedForSales}
            />
          </div>

          <div className="mb-4">
            <h6 className="fw-semibold mb-2 fs-14">Follow Up Date</h6>
            <Form.Control
              type="date"
              size="sm"
              className="w-auto"
              value={formData.follow_up_date}
              onChange={(e) =>
                setFormData({ ...formData, follow_up_date: e.target.value })
              }
              disabled={!isAuthorizedSales || isLockedForSales}
            />
          </div>

          <div className="mb-4">
            <h6 className="fw-semibold mb-2 fs-14">Prospek</h6>
            <Form.Select
              size="sm"
              className="w-auto"
              value={formData.prospek}
              onChange={(e) =>
                setFormData({ ...formData, prospek: e.target.value })
              }
              disabled={!isAuthorizedSales || isLockedForSales}
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Unknown">Unknown</option>
            </Form.Select>
          </div>

          <div className="mb-4">
            <h6 className="fw-semibold mb-2 fs-14">Next Step</h6>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter next steps..."
              value={formData.next_steps}
              onChange={(e) =>
                setFormData({ ...formData, next_steps: e.target.value })
              }
              disabled={!isAuthorizedSales || isLockedForSales}
            />
          </div>

          <div className="text-end mb-4">
            <Button
              variant="primary"
              className="px-4 py-1 me-2"
              onClick={handleSave}
              disabled={isSaving || !canSave || isCompleted}
            >
              {isSaving ? 'Saving...' : 'Save Updates'}
            </Button>
            <Link
              href="/sales/crm/visit-report-aii"
              className="btn btn-light border px-4 py-1"
            >
              Back
            </Link>
          </div>

          <hr className="border-top border-block-start-dashed" />

          <div className="mt-4 mb-4">
            <h6 className="fw-semibold mb-3 fs-15">Acknowledge</h6>

            <div className="d-flex gap-3 mb-4">
              <span className="avatar avatar-md avatar-rounded">
                <img src="/assets/images/faces/2.jpg" alt="Vicha" />
              </span>
              <div className="flex-fill">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <h6 className="fw-semibold mb-0 fs-13">Vicha</h6>
                    <span className="text-muted fs-11">Manager</span>
                  </div>
                </div>
                {isAuthorizedManager ? (
                  <Form.Control
                    as="textarea"
                    rows={2}
                    className="mt-2"
                    placeholder="Enter acknowledgment and notes..."
                    value={formData.ack_manager}
                    onChange={(e) =>
                      setFormData({ ...formData, ack_manager: e.target.value })
                    }
                    disabled={isManagerLocked || isCompleted}
                  />
                ) : (
                  <p className="text-muted fs-13 mb-0">
                    {formData.ack_manager ? formData.ack_manager : '-'}
                  </p>
                )}
              </div>
            </div>

            <div className="d-flex gap-3">
              <span className="avatar avatar-md avatar-rounded">
                <img src="/assets/images/faces/8.jpg" alt="David" />
              </span>
              <div className="flex-fill">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <h6 className="fw-semibold mb-0 fs-13">David</h6>
                    <span className="text-muted fs-11">Director</span>
                  </div>
                </div>
                {isAuthorizedDirector && formData.ack_manager?.trim() !== '' ? (
                  <Form.Control
                    as="textarea"
                    rows={2}
                    className="mt-2"
                    placeholder="Enter acknowledgment and notes..."
                    value={formData.ack_director}
                    onChange={(e) =>
                      setFormData({ ...formData, ack_director: e.target.value })
                    }
                    disabled={isCompleted}
                  />
                ) : (
                  <p className="text-muted fs-13 mb-0">
                    {formData.ack_director ? formData.ack_director : '-'}
                  </p>
                )}
              </div>
            </div>


          </div>

          <hr className="border-top border-block-start-dashed" />

          <div className="mt-4">
            <h6 className="fw-semibold mb-3 fs-15">Final Response</h6>
            <div className="d-flex gap-3">
              <span className="avatar avatar-md avatar-rounded">
                <img src="/assets/images/faces/11.jpg" alt={salesPerson} />
              </span>
              <div className="flex-fill">
                <div className="mb-1">
                  <h6 className="fw-semibold mb-0 fs-13">{salesPerson}</h6>
                  <span className="text-muted fs-11">Sales</span>
                </div>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Enter sales subjective response..."
                  value={formData.response}
                  onChange={(e) =>
                    setFormData({ ...formData, response: e.target.value })
                  }
                  disabled={!isAuthorizedSales || !formData.ack_director?.trim() || isCompleted}
                />
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </>
  )
}

export default VisitReportDetail
