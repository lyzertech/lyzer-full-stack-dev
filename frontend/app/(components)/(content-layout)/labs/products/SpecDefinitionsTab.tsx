'use client'

import React, { useState, useEffect } from 'react'
import {
  Card, Table, Button, Modal, Form,
  InputGroup, Badge, Spinner, Row, Col,
} from 'react-bootstrap'
import type { SpecDefinition, DataType } from './types'
import { DATA_TYPE_OPTIONS, DATA_TYPE_LABELS, DATA_TYPE_ICONS } from './types'

const emptyForm = {
  spec_name: '', spec_key: '', data_type: 'text' as DataType, unit: '',
  group_name: '', options: '', is_filterable: false, sort_order: 0, description: '',
}

export default function SpecDefinitionsTab() {
  const [items, setItems] = useState<SpecDefinition[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<SpecDefinition | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterGroup) params.set('group_name', filterGroup)
      const qs = params.toString() ? `?${params}` : ''
      const [specsRes, groupsRes] = await Promise.all([
        fetch(`/api/v1/labs/spec-definitions${qs}`),
        fetch('/api/v1/labs/spec-definitions/groups'),
      ])
      if (specsRes.ok) setItems(await specsRes.json())
      if (groupsRes.ok) setGroups(await groupsRes.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, filterGroup])

  const openCreate = () => {
    setEditItem(null); setForm({ ...emptyForm }); setError(null); setShowModal(true)
  }
  const openEdit = (s: SpecDefinition) => {
    setEditItem(s)
    setForm({
      spec_name: s.spec_name, spec_key: s.spec_key, data_type: s.data_type,
      unit: s.unit || '', group_name: s.group_name || '',
      options: s.options ? s.options.join(', ') : '',
      is_filterable: s.is_filterable, sort_order: s.sort_order, description: s.description || '',
    })
    setError(null); setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      const payload = {
        ...form,
        options: (form.data_type === 'select' || form.data_type === 'multi_select')
          ? form.options.split(',').map(o => o.trim()).filter(Boolean)
          : null,
      }
      const url = editItem ? `/api/v1/labs/spec-definitions/${editItem.id}` : '/api/v1/labs/spec-definitions'
      const res = await fetch(url, {
        method: editItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed'); return }
      setShowModal(false); load()
    } catch { setError('Network error') } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this spec definition?')) return
    await fetch(`/api/v1/labs/spec-definitions/${id}`, { method: 'DELETE' })
    load()
  }

  const setF = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  // Group items
  const grouped: Record<string, SpecDefinition[]> = {}
  items.forEach(item => {
    const g = item.group_name || 'Ungrouped'
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(item)
  })

  return (
    <>
      <Card className="custom-card shadow-sm border-0">
        <Card.Header className="justify-content-between border-bottom-0 pb-0">
          <Card.Title className="fw-bold fs-16">Specification Definitions</Card.Title>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <Form.Select size="sm" value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
              className="border-default" style={{ width: 160 }}>
              <option value="">All Groups</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </Form.Select>
            <InputGroup size="sm" style={{ width: 220 }}>
              <Form.Control placeholder="Search specs..." value={search}
                onChange={e => setSearch(e.target.value)} className="border-default" />
              <Button variant="primary-light" className="border-default border-start-0 px-3">
                <i className="bi bi-search" />
              </Button>
            </InputGroup>
            <Button size="sm" variant="primary" className="shadow-sm" onClick={openCreate}>
              <i className="bi bi-plus-lg me-1" />New Spec
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-5 text-muted fs-14">
              No spec definitions yet. <Button variant="link" size="sm" onClick={openCreate}>Create one</Button>
            </div>
          ) : (
            Object.entries(grouped).map(([group, specs]) => (
              <div key={group} className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-primary fs-11 fw-semibold">{group}</span>
                  <span className="text-muted fs-12">({specs.length} specs)</span>
                </div>
                <div className="table-responsive">
                  <Table className="table table-hover align-middle text-nowrap border-0 mb-0">
                    <thead>
                      <tr>
                        <th className="border-0 fs-11 text-uppercase text-muted">Name</th>
                        <th className="border-0 fs-11 text-uppercase text-muted">Key</th>
                        <th className="border-0 fs-11 text-uppercase text-muted">Type</th>
                        <th className="border-0 fs-11 text-uppercase text-muted">Unit</th>
                        <th className="border-0 fs-11 text-uppercase text-muted text-center">Filterable</th>
                        <th className="border-0 fs-11 text-uppercase text-muted text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specs.map(s => (
                        <tr key={s.id} className="border-bottom border-default">
                          <td className="fw-semibold fs-13">{s.spec_name}</td>
                          <td><code className="text-secondary fs-12 px-2 py-1 bg-secondary-transparent rounded">{s.spec_key}</code></td>
                          <td>
                            <span className="d-flex align-items-center gap-1">
                              <i className={`${DATA_TYPE_ICONS[s.data_type]} text-primary fs-13`} />
                              <span className="fs-12">{DATA_TYPE_LABELS[s.data_type]}</span>
                            </span>
                          </td>
                          <td className="text-muted fs-13">{s.unit || '—'}</td>
                          <td className="text-center">
                            {s.is_filterable
                              ? <Badge bg="success-transparent" text="success" className="fs-11 border border-default">Yes</Badge>
                              : <span className="text-muted fs-12">No</span>}
                          </td>
                          <td className="text-end">
                            <div className="d-inline-flex gap-1">
                              <Button variant="primary-light" size="sm" className="btn-icon rounded-pill shadow-sm border-0" onClick={() => openEdit(s)}>
                                <i className="bi bi-pencil-fill" />
                              </Button>
                              <Button variant="danger-light" size="sm" className="btn-icon rounded-pill shadow-sm border-0" onClick={() => handleDelete(s.id)}>
                                <i className="bi bi-trash3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            ))
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton className="border-bottom-0 pb-0">
            <Modal.Title className="fs-16 fw-bold">{editItem ? 'Edit Spec Definition' : 'New Spec Definition'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <div className="alert alert-danger fs-12 py-2">{error}</div>}
            <Row className="gy-3">
              <Col md={6}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Spec Name *</Form.Label>
                <Form.Control required value={form.spec_name} onChange={e => setF('spec_name', e.target.value)}
                  placeholder="e.g. Voltage Input, Frequency" />
              </Col>
              <Col md={6}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Spec Key</Form.Label>
                <Form.Control value={form.spec_key} onChange={e => setF('spec_key', e.target.value)}
                  placeholder="Auto-generated if blank" />
                <Form.Text className="text-muted fs-11">Leave blank to auto-generate from name</Form.Text>
              </Col>
              <Col md={4}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Data Type *</Form.Label>
                <Form.Select value={form.data_type} onChange={e => setF('data_type', e.target.value as DataType)}>
                  {DATA_TYPE_OPTIONS.map(dt => (
                    <option key={dt} value={dt}>{DATA_TYPE_LABELS[dt]}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Unit</Form.Label>
                <Form.Control value={form.unit} onChange={e => setF('unit', e.target.value)}
                  placeholder="e.g. V, A, Hz, °C" />
              </Col>
              <Col md={4}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Group Name</Form.Label>
                <Form.Control value={form.group_name} onChange={e => setF('group_name', e.target.value)}
                  placeholder="e.g. Electrical, Communication" list="group-suggestions" />
                <datalist id="group-suggestions">
                  {groups.map(g => <option key={g} value={g} />)}
                </datalist>
              </Col>
              {(form.data_type === 'select' || form.data_type === 'multi_select') && (
                <Col xs={12}>
                  <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">
                    Options <span className="text-muted fw-normal">(comma-separated)</span>
                  </Form.Label>
                  <Form.Control value={form.options} onChange={e => setF('options', e.target.value)}
                    placeholder="e.g. RS485, Modbus-RTU, MQTT" />
                </Col>
              )}
              <Col md={6}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Sort Order</Form.Label>
                <Form.Control type="number" min={0} value={form.sort_order}
                  onChange={e => setF('sort_order', +e.target.value)} />
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <Form.Check type="switch" id="spec-filterable" label="Expose as filter in product listing"
                  checked={form.is_filterable} onChange={e => setF('is_filterable', e.target.checked)} />
              </Col>
              <Col xs={12}>
                <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Description</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.description}
                  onChange={e => setF('description', e.target.value)} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-0">
            <Button variant="secondary-light" onClick={() => setShowModal(false)} size="sm">Cancel</Button>
            <Button variant="primary" type="submit" size="sm" disabled={saving}>
              {saving && <Spinner size="sm" className="me-1" />}
              {editItem ? 'Save Changes' : 'Create Spec'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}
