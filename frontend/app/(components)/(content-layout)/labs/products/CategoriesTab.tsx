'use client'

import React, { useState, useEffect } from 'react'
import {
  Card, Table, Button, Modal, Form,
  InputGroup, Badge, Spinner, Row, Col,
} from 'react-bootstrap'
import type { Category } from './types'

const emptyForm = { name: '', description: '', icon: 'bi-cpu', sort_order: 0, is_active: true }

const ICON_OPTIONS = [
  'bi-cpu', 'bi-lightning-charge', 'bi-thermometer-half', 'bi-wifi',
  'bi-broadcast', 'bi-router', 'bi-gear', 'bi-shield-check',
  'bi-bar-chart-line', 'bi-plug', 'bi-hdd-stack', 'bi-layers',
]

export default function CategoriesTab() {
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Category | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : ''
      const res = await fetch(`/api/v1/labs/categories${qs}`)
      if (res.ok) setItems(await res.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search])

  const openCreate = () => {
    setEditItem(null); setForm({ ...emptyForm }); setError(null); setShowModal(true)
  }
  const openEdit = (c: Category) => {
    setEditItem(c)
    setForm({ name: c.name, description: c.description || '', icon: c.icon || 'bi-cpu', sort_order: c.sort_order, is_active: c.is_active })
    setError(null); setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      const url = editItem ? `/api/v1/labs/categories/${editItem.id}` : '/api/v1/labs/categories'
      const res = await fetch(url, {
        method: editItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed'); return }
      setShowModal(false); load()
    } catch { setError('Network error') } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return
    await fetch(`/api/v1/labs/categories/${id}`, { method: 'DELETE' })
    load()
  }

  const setF = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  return (
    <>
      <Card className="custom-card shadow-sm border-0">
        <Card.Header className="justify-content-between border-bottom-0 pb-0">
          <Card.Title className="fw-bold fs-16">Category Management</Card.Title>
          <div className="d-flex gap-2 align-items-center">
            <InputGroup size="sm" style={{ width: 220 }}>
              <Form.Control placeholder="Search categories..." value={search}
                onChange={e => setSearch(e.target.value)} className="border-default" />
              <Button variant="primary-light" className="border-default border-start-0 px-3">
                <i className="bi bi-search" />
              </Button>
            </InputGroup>
            <Button size="sm" variant="primary" className="shadow-sm" onClick={openCreate}>
              <i className="bi bi-plus-lg me-1" />Add Category
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <div className="table-responsive">
              <Table className="table table-hover align-middle text-nowrap border-0">
                <thead>
                  <tr>
                    <th className="border-0">#</th>
                    <th className="border-0">Category</th>
                    <th className="border-0">Slug</th>
                    <th className="border-0">Specs Mapped</th>
                    <th className="border-0 text-center">Status</th>
                    <th className="border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted fs-14">
                        No categories yet. <Button variant="link" size="sm" onClick={openCreate}>Add one</Button>
                      </td>
                    </tr>
                  ) : items.map((c, i) => (
                    <tr key={c.id} className="border-bottom border-default">
                      <td className="text-muted fs-12">{i + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="avatar avatar-sm bg-warning-transparent text-warning avatar-rounded border border-warning-transparent shadow-sm">
                            <i className={`${c.icon || 'bi-cpu'} fs-14`} />
                          </span>
                          <span className="fw-bold fs-14">{c.name}</span>
                        </div>
                      </td>
                      <td><code className="text-secondary fs-12 px-2 py-1 bg-secondary-transparent rounded">{c.slug}</code></td>
                      <td>
                        <Badge bg="info-transparent" text="info" className="fs-11 border border-default">
                          {c.spec_definitions?.length ?? 0} specs
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg={c.is_active ? 'success-transparent' : 'secondary-transparent'}
                          text={c.is_active ? 'success' : 'secondary'}
                          className="fs-11 fw-semibold border border-default">
                          {c.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-1">
                          <Button variant="primary-light" size="sm" className="btn-icon rounded-pill shadow-sm border-0" onClick={() => openEdit(c)}>
                            <i className="bi bi-pencil-fill" />
                          </Button>
                          <Button variant="danger-light" size="sm" className="btn-icon rounded-pill shadow-sm border-0" onClick={() => handleDelete(c.id)}>
                            <i className="bi bi-trash3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton className="border-bottom-0 pb-0">
            <Modal.Title className="fs-16 fw-bold">{editItem ? 'Edit Category' : 'New Category'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <div className="alert alert-danger fs-12 py-2">{error}</div>}
            <Row className="gy-3">
              <Col xs={12}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Category Name *</Form.Label>
                <Form.Control required value={form.name} onChange={e => setF('name', e.target.value)}
                  placeholder="e.g. Power Meters, Sensors, PLCs" />
              </Col>
              <Col xs={12}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Icon</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {ICON_OPTIONS.map(icon => (
                    <button type="button" key={icon}
                      className={`btn btn-sm ${form.icon === icon ? 'btn-primary' : 'btn-secondary-light'} btn-icon rounded`}
                      style={{ width: 36, height: 36 }} onClick={() => setF('icon', icon)}>
                      <i className={`${icon} fs-14`} />
                    </button>
                  ))}
                </div>
              </Col>
              <Col xs={12}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Description</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.description}
                  onChange={e => setF('description', e.target.value)} />
              </Col>
              <Col xs={6}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Sort Order</Form.Label>
                <Form.Control type="number" min={0} value={form.sort_order}
                  onChange={e => setF('sort_order', +e.target.value)} />
              </Col>
              <Col xs={6} className="d-flex align-items-end">
                <Form.Check type="switch" id="cat-active" label="Active"
                  checked={form.is_active} onChange={e => setF('is_active', e.target.checked)} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-0">
            <Button variant="secondary-light" onClick={() => setShowModal(false)} size="sm">Cancel</Button>
            <Button variant="primary" type="submit" size="sm" disabled={saving}>
              {saving && <Spinner size="sm" className="me-1" />}
              {editItem ? 'Save Changes' : 'Create Category'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}
