'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row, Modal, Form, Table } from 'react-bootstrap'
import {
  getBanks,
  createBank,
  updateBank,
  deleteBank,
  type Bank,
} from '@/app/actions/finance/banks.actions'
import { useAuth } from '@/shared/auth/AuthContext'

const BanksPage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    code: '',
    account_number: '',
    routing_number: '',
    branch: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    website: '',
    notes: '',
    is_active: true,
  })

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    loadBanks()
  }, [authLoading, isAuthenticated])

  async function loadBanks() {
    setLoading(true)
    setError(null)
    try {
      const data = await getBanks()
      setBanks(data)
    } catch (err: any) {
      console.error('Error loading banks:', err)
      setError(err.message || 'Failed to load banks')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (bank?: Bank) => {
    if (bank) {
      setEditingBank(bank)
      setForm({
        name: bank.name,
        code: bank.code || '',
        account_number: bank.account_number || '',
        routing_number: bank.routing_number || '',
        branch: bank.branch || '',
        contact_person: bank.contact_person || '',
        contact_phone: bank.contact_phone || '',
        contact_email: bank.contact_email || '',
        website: bank.website || '',
        notes: bank.notes || '',
        is_active: bank.is_active,
      })
    } else {
      setEditingBank(null)
      setForm({
        name: '',
        code: '',
        account_number: '',
        routing_number: '',
        branch: '',
        contact_person: '',
        contact_phone: '',
        contact_email: '',
        website: '',
        notes: '',
        is_active: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingBank(null)
    setFormError(null)
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      if (editingBank) {
        await updateBank({ id: editingBank.id, ...form })
      } else {
        await createBank(form)
      }
      handleCloseModal()
      loadBanks()
    } catch (err: any) {
      console.error(err)
      setFormError(err.message || 'Failed to save bank')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bank?')) return
    try {
      await deleteBank(id)
      loadBanks()
    } catch (err: any) {
      alert(err.message || 'Failed to delete bank')
    }
  }

  if (loading) {
    return (
      <Fragment>
        <Seo title="Banks" />
        <Pageheader
          title="Finance"
          subtitle="Banks"
          currentpage="Banks"
          activepage="Manage Banks"
        />
        <Row>
          <Col xl={12}>
            <Card className="custom-card">
              <Card.Body>
                <div className="text-center">Loading...</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Fragment>
    )
  }

  if (error) {
    return (
      <Fragment>
        <Seo title="Banks" />
        <Pageheader
          title="Finance"
          subtitle="Banks"
          currentpage="Banks"
          activepage="Manage Banks"
        />
        <Row>
          <Col xl={12}>
            <Card className="custom-card">
              <Card.Body>
                <div className="alert alert-danger">{error}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Fragment>
    )
  }

  return (
    <Fragment>
      <Seo title="Banks" />
      <Pageheader
        title="Finance"
        subtitle="Banks"
        currentpage="Banks"
        activepage="Manage Banks"
      />

      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              className="btn-wave"
              onClick={() => handleOpenModal()}
            >
              <i className="ri-add-line me-1 align-middle" /> Add Bank
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Banks</div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                  <Table className="table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Branch</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banks.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted">
                            No banks found
                          </td>
                        </tr>
                      ) : (
                        banks.map((bank) => (
                          <tr key={bank.id}>
                            <td>{bank.name}</td>
                            <td>{bank.code || '-'}</td>
                            <td>{bank.branch || '-'}</td>
                            <td>
                              {bank.contact_person && (
                                <div>
                                  <div>{bank.contact_person}</div>
                                  {bank.contact_phone && (
                                    <small className="text-muted">
                                      {bank.contact_phone}
                                    </small>
                                  )}
                                </div>
                              )}
                              {!bank.contact_person && '-'}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  bank.is_active ? 'bg-success' : 'bg-secondary'
                                }`}
                              >
                                {bank.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-end">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                className="me-1"
                                onClick={() => handleOpenModal(bank)}
                              >
                                <i className="ri-edit-line" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(bank.id)}
                              >
                                <i className="ri-delete-bin-line" />
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

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingBank ? 'Edit Bank' : 'Add Bank'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formError && <div className="alert alert-danger">{formError}</div>}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Code</Form.Label>
                  <Form.Control
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Account Number</Form.Label>
                  <Form.Control
                    name="account_number"
                    value={form.account_number}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Routing Number</Form.Label>
                  <Form.Control
                    name="routing_number"
                    value={form.routing_number}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Branch</Form.Label>
              <Form.Control
                name="branch"
                value={form.branch}
                onChange={handleChange}
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Person</Form.Label>
                  <Form.Control
                    name="contact_person"
                    value={form.contact_person}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Phone</Form.Label>
                  <Form.Control
                    name="contact_phone"
                    value={form.contact_phone}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="contact_email"
                    value={form.contact_email}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control
                type="url"
                name="website"
                value={form.website}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={form.notes}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Active"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting
                ? 'Saving...'
                : editingBank
                ? 'Update Bank'
                : 'Create Bank'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Fragment>
  )
}

export default BanksPage

