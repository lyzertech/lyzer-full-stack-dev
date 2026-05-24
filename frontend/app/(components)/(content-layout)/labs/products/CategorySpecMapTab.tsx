'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Form, Spinner, Badge, Row, Col } from 'react-bootstrap'
import type { Category, SpecDefinition } from './types'

interface MappedSpec extends SpecDefinition {
  is_required: boolean
  map_sort_order: number
}

export default function CategorySpecMapTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [allSpecs, setAllSpecs] = useState<SpecDefinition[]>([])
  const [selectedCatId, setSelectedCatId] = useState<string>('')
  const [mappedSpecs, setMappedSpecs] = useState<MappedSpec[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCats, setLoadingCats] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load categories + all specs on mount
  useEffect(() => {
    const init = async () => {
      setLoadingCats(true)
      const [cRes, sRes] = await Promise.all([
        fetch('/api/v1/labs/categories?active_only=true'),
        fetch('/api/v1/labs/spec-definitions'),
      ])
      if (cRes.ok) setCategories(await cRes.json())
      if (sRes.ok) setAllSpecs(await sRes.json())
      setLoadingCats(false)
    }
    init()
  }, [])

  // Load mapped specs when category changes
  const loadMapped = useCallback(async (catId: string) => {
    if (!catId) { setMappedSpecs([]); return }
    setLoading(true)
    const res = await fetch(`/api/v1/labs/categories/${catId}/specs`)
    if (res.ok) {
      const data: SpecDefinition[] = await res.json()
      setMappedSpecs(data.map(s => ({
        ...s,
        is_required: s.pivot?.is_required ?? false,
        map_sort_order: s.pivot?.sort_order ?? 0,
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadMapped(selectedCatId) }, [selectedCatId])

  const isAlreadyMapped = (specId: number) => mappedSpecs.some(s => s.id === specId)

  const addSpec = (spec: SpecDefinition) => {
    if (isAlreadyMapped(spec.id)) return
    setMappedSpecs(prev => [...prev, { ...spec, is_required: false, map_sort_order: prev.length }])
  }

  const removeSpec = (specId: number) => {
    setMappedSpecs(prev => prev.filter(s => s.id !== specId))
  }

  const toggleRequired = (specId: number) => {
    setMappedSpecs(prev => prev.map(s => s.id === specId ? { ...s, is_required: !s.is_required } : s))
  }

  const moveUp = (idx: number) => {
    if (idx === 0) return
    setMappedSpecs(prev => {
      const arr = [...prev]
      ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
      return arr
    })
  }

  const moveDown = (idx: number) => {
    setMappedSpecs(prev => {
      if (idx === prev.length - 1) return prev
      const arr = [...prev]
      ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
      return arr
    })
  }

  const handleSave = async () => {
    if (!selectedCatId) return
    setSaving(true); setSaved(false)
    const payload = {
      specs: mappedSpecs.map((s, i) => ({
        spec_definition_id: s.id,
        is_required: s.is_required,
        sort_order: i,
      })),
    }
    const res = await fetch(`/api/v1/labs/categories/${selectedCatId}/specs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  // Group unmapped specs for easy selection
  const unmapped = allSpecs.filter(s => !isAlreadyMapped(s.id))
  const unmappedGrouped: Record<string, SpecDefinition[]> = {}
  unmapped.forEach(s => {
    const g = s.group_name || 'Ungrouped'
    if (!unmappedGrouped[g]) unmappedGrouped[g] = []
    unmappedGrouped[g].push(s)
  })

  return (
    <Row className="g-4">
      {/* Left: category selector + available specs */}
      <Col xl={5}>
        <Card className="custom-card shadow-sm border-0 h-100">
          <Card.Header className="border-bottom-0 pb-0">
            <Card.Title className="fw-bold fs-15">Available Spec Definitions</Card.Title>
          </Card.Header>
          <Card.Body>
            <Form.Label className="fs-11 fw-bold text-muted text-uppercase mb-1">Select Category</Form.Label>
            {loadingCats ? (
              <div className="text-center py-3"><Spinner size="sm" /></div>
            ) : (
              <Form.Select className="border-default mb-4" value={selectedCatId}
                onChange={e => setSelectedCatId(e.target.value)}>
                <option value="">— Choose a category —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Form.Select>
            )}

            {selectedCatId && (
              unmapped.length === 0 ? (
                <div className="text-center py-4 text-muted fs-13">
                  <i className="bi bi-check-circle text-success fs-24 d-block mb-2" />
                  All specs are already mapped.
                </div>
              ) : (
                Object.entries(unmappedGrouped).map(([group, specs]) => (
                  <div key={group} className="mb-3">
                    <div className="fs-11 fw-bold text-muted text-uppercase mb-2 border-bottom border-default pb-1">{group}</div>
                    {specs.map(s => (
                      <div key={s.id}
                        className="d-flex align-items-center justify-content-between p-2 rounded-3 mb-1 bg-light border border-default"
                        style={{ cursor: 'pointer' }} onClick={() => addSpec(s)}>
                        <div>
                          <span className="fw-semibold fs-13">{s.spec_name}</span>
                          {s.unit && <span className="text-muted fs-11 ms-1">({s.unit})</span>}
                          <div>
                            <Badge bg="secondary-transparent" text="secondary" className="fs-10 border border-default me-1">{s.data_type}</Badge>
                            {s.is_filterable && <Badge bg="info-transparent" text="info" className="fs-10 border border-default">filterable</Badge>}
                          </div>
                        </div>
                        <Button variant="success-light" size="sm" className="btn-icon rounded-pill border-0 shadow-sm flex-shrink-0">
                          <i className="bi bi-plus-lg" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ))
              )
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Right: mapped specs (orderable) */}
      <Col xl={7}>
        <Card className="custom-card shadow-sm border-0 h-100">
          <Card.Header className="justify-content-between border-bottom-0 pb-0">
            <Card.Title className="fw-bold fs-15">
              Mapped Specs
              {selectedCatId && (
                <span className="text-muted fw-normal fs-13 ms-2">
                  ({mappedSpecs.length} assigned)
                </span>
              )}
            </Card.Title>
            {selectedCatId && (
              <Button variant="primary" size="sm" className="shadow-sm" onClick={handleSave} disabled={saving}>
                {saving ? <Spinner size="sm" className="me-1" /> : <i className="bi bi-floppy me-1" />}
                Save Mapping
              </Button>
            )}
          </Card.Header>
          <Card.Body>
            {!selectedCatId ? (
              <div className="text-center py-5 text-muted fs-13">
                <i className="bi bi-arrow-left-circle fs-30 d-block mb-2 opacity-50" />
                Select a category to view and manage its specs.
              </div>
            ) : loading ? (
              <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
            ) : mappedSpecs.length === 0 ? (
              <div className="text-center py-5 text-muted fs-13">
                <i className="bi bi-list-check fs-30 d-block mb-2 opacity-50" />
                No specs mapped yet. Add specs from the left panel.
              </div>
            ) : (
              <>
                {saved && <div className="alert alert-success fs-12 py-2 mb-3">✓ Mapping saved successfully!</div>}
                {mappedSpecs.map((s, idx) => (
                  <div key={s.id} className="d-flex align-items-center gap-2 p-2 rounded-3 mb-2 border border-default"
                    style={{ background: 'var(--custom-white)' }}>
                    <div className="d-flex flex-column gap-1">
                      <Button variant="secondary-light" size="sm" className="btn-icon border-0 p-0" style={{ width: 22, height: 22, fontSize: 10 }}
                        onClick={() => moveUp(idx)} disabled={idx === 0}>
                        <i className="bi bi-chevron-up" />
                      </Button>
                      <Button variant="secondary-light" size="sm" className="btn-icon border-0 p-0" style={{ width: 22, height: 22, fontSize: 10 }}
                        onClick={() => moveDown(idx)} disabled={idx === mappedSpecs.length - 1}>
                        <i className="bi bi-chevron-down" />
                      </Button>
                    </div>
                    <span className="avatar avatar-xs bg-primary-transparent text-primary avatar-rounded border border-primary-transparent">
                      {idx + 1}
                    </span>
                    <div className="flex-fill">
                      <div className="fw-semibold fs-13">{s.spec_name}
                        {s.unit && <span className="text-muted fs-11 ms-1">({s.unit})</span>}
                      </div>
                      <div>
                        <Badge bg="secondary-transparent" text="secondary" className="fs-10 border border-default me-1">{s.data_type}</Badge>
                        {s.group_name && <span className="text-muted fs-10">{s.group_name}</span>}
                      </div>
                    </div>
                    <Form.Check type="switch" id={`req-${s.id}`} label="Required"
                      checked={s.is_required} onChange={() => toggleRequired(s.id)}
                      className="fs-12 me-2 flex-shrink-0" />
                    <Button variant="danger-light" size="sm" className="btn-icon rounded-pill shadow-sm border-0 flex-shrink-0"
                      onClick={() => removeSpec(s.id)}>
                      <i className="bi bi-x-lg" />
                    </Button>
                  </div>
                ))}
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}
