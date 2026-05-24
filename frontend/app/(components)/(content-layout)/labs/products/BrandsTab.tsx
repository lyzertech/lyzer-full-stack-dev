'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  Badge,
  Spinner,
  Row,
  Col,
} from 'react-bootstrap'
import type { Brand } from './types'

const emptyBrand = { name: '', logo: '', description: '', is_active: true }

export default function BrandsTab() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Brand | null>(null)
  const [form, setForm] = useState({ ...emptyBrand })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : ''
      const res = await fetch(`/api/v1/labs/brands${qs}`)
      if (res.ok) setBrands(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [search])

  const openCreate = () => {
    setEditItem(null)
    setForm({ ...emptyBrand })
    setError(null)
    setShowModal(true)
  }

  const openEdit = (b: Brand) => {
    setEditItem(b)
    setForm({
      name: b.name,
      logo: b.logo || '',
      description: b.description || '',
      is_active: b.is_active,
    })
    setError(null)
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const url = editItem
        ? `/api/v1/labs/brands/${editItem.id}`
        : '/api/v1/labs/brands'
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to save')
        return
      }
      setShowModal(false)
      load()
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this brand?')) return
    await fetch(`/api/v1/labs/brands/${id}`, { method: 'DELETE' })
    load()
  }

  const setF = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <>
      <Card className="custom-card shadow-sm border-0">
        <Card.Header className="justify-content-between border-bottom-0 pb-0">
          <Card.Title className="fw-bold fs-16">Brand Management</Card.Title>
          <div className="d-flex gap-2 align-items-center">
            <InputGroup size="sm" style={{ width: 220 }}>
              <Form.Control
                placeholder="Search brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-default"
              />
              <Button
                variant="primary-light"
                className="border-default border-start-0 px-3"
              >
                <i className="bi bi-search" />
              </Button>
            </InputGroup>
            <Button
              size="sm"
              variant="primary"
              className="shadow-sm"
              onClick={openCreate}
            >
              <i className="bi bi-plus-lg me-1" />
              Add Brand
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="table table-hover align-middle text-nowrap border-0">
                <thead>
                  <tr>
                    <th className="border-0">#</th>
                    <th className="border-0">Brand Name</th>
                    <th className="border-0">Slug</th>
                    <th className="border-0">Description</th>
                    <th className="border-0 text-center">Status</th>
                    <th className="border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-5 text-muted fs-14"
                      >
                        No brands found.{' '}
                        <Button variant="link" size="sm" onClick={openCreate}>
                          Add one
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    brands.map((b, i) => (
                      <tr key={b.id} className="border-bottom border-default">
                        <td className="text-muted fs-12">{i + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="avatar avatar-sm bg-primary-transparent text-primary avatar-rounded border border-primary-transparent shadow-sm">
                              <i className="bi bi-building fs-14" />
                            </span>
                            <span className="fw-bold fs-14">{b.name}</span>
                          </div>
                        </td>
                        <td>
                          <code className="text-secondary fs-12 px-2 py-1 bg-secondary-transparent rounded">
                            {b.slug}
                          </code>
                        </td>
                        <td
                          className="text-muted fs-13"
                          style={{ maxWidth: 240 }}
                        >
                          <span
                            className="text-truncate d-block"
                            style={{ maxWidth: 220 }}
                          >
                            {b.description || '—'}
                          </span>
                        </td>
                        <td className="text-center">
                          <Badge
                            bg={
                              b.is_active
                                ? 'success-transparent'
                                : 'secondary-transparent'
                            }
                            text={b.is_active ? 'success' : 'secondary'}
                            className="fs-11 fw-semibold border border-default"
                          >
                            {b.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1">
                            <Button
                              variant="primary-light"
                              size="sm"
                              className="btn-icon rounded-pill shadow-sm border-0"
                              onClick={() => openEdit(b)}
                            >
                              <i className="bi bi-pencil-fill" />
                            </Button>
                            <Button
                              variant="danger-light"
                              size="sm"
                              className="btn-icon rounded-pill shadow-sm border-0"
                              onClick={() => handleDelete(b.id)}
                            >
                              <i className="bi bi-trash3" />
                            </Button>
                          </div>
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

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton className="border-bottom-0 pb-0">
            <Modal.Title className="fs-16 fw-bold">
              {editItem ? 'Edit Brand' : 'New Brand'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && (
              <div className="alert alert-danger fs-12 py-2">{error}</div>
            )}
            <Row className="gy-3">
              <Col xs={12}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">
                  Brand Name *
                </Form.Label>
                <Form.Control
                  required
                  value={form.name}
                  onChange={(e) => setF('name', e.target.value)}
                  placeholder="e.g. Acuvim, Schneider Electric"
                />
              </Col>
              <Col xs={12}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">
                  Logo URL
                </Form.Label>
                <Form.Control
                  value={form.logo}
                  onChange={(e) => setF('logo', e.target.value)}
                  placeholder="https://..."
                />
              </Col>
              <Col xs={12}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">
                  Description
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setF('description', e.target.value)}
                />
              </Col>
              <Col xs={12}>
                <Form.Check
                  type="switch"
                  id="brand-active"
                  label="Active"
                  checked={form.is_active}
                  onChange={(e) => setF('is_active', e.target.checked)}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-0">
            <Button
              variant="secondary-light"
              onClick={() => setShowModal(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" size="sm" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-1" /> : null}
              {editItem ? 'Save Changes' : 'Create Brand'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}
