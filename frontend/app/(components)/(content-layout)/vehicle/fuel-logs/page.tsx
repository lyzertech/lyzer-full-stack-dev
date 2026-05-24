'use client'

import React, { Fragment, useEffect, useState, useCallback } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row, Badge, Modal, Form, Table, Button } from 'react-bootstrap'
import { getFuelLogs, createFuelLog, getVehicles, getDrivers } from '@/app/actions/vehicle/vehicle.actions'

const fmtCurrency = (n: any) =>
  'Rp ' + Number(n ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })

const FUEL_TYPES = ['Pertalite', 'Pertamax', 'Pertamax Turbo', 'Solar (B30)', 'Dexlite', 'Pertamina Dex', 'Other']

const emptyForm = () => ({
  vehicle_id: '', driver_id: '', fuel_date: new Date().toISOString().split('T')[0],
  odometer: '', liters: '', unit_price: '', fuel_type: 'Solar (B30)',
  fuel_station: '', full_tank: true, notes: '',
})

export default function FuelLogsPage() {
  const [logs, setLogs] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<any>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [filterVehicle, setFilterVehicle] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, per_page: 20 }
      if (filterVehicle) params.vehicle_id = filterVehicle
      const result = await getFuelLogs(params) as any
      setLogs(result)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, filterVehicle])

  useEffect(() => {
    load()
    getVehicles({ per_page: 200 }).then((r: any) => setVehicles(r?.data ?? []))
    getDrivers({ per_page: 100, status: 'Active' }).then((r: any) => setDrivers(r?.data ?? []))
  }, [load])

  const handleSave = async () => {
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        ...form,
        vehicle_id: parseInt(form.vehicle_id),
        driver_id: form.driver_id ? parseInt(form.driver_id) : undefined,
        odometer: parseFloat(form.odometer),
        liters: parseFloat(form.liters),
        unit_price: parseFloat(form.unit_price) || 0,
      }
      await createFuelLog(payload)
      setShowModal(false)
      setForm(emptyForm())
      load()
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))
  const items = logs?.data ?? []
  const paginationMeta = logs ? { current: logs.current_page, last: logs.last_page, total: logs.total } : null

  // Summary stats
  const totalLiters = items.reduce((s: number, l: any) => s + Number(l.liters), 0)
  const totalCost = items.reduce((s: number, l: any) => s + Number(l.total_cost), 0)
  const avgKmL = items.filter((l: any) => l.km_per_liter).reduce((s: number, l: any, _: any, arr: any[]) =>
    s + Number(l.km_per_liter) / arr.filter((x: any) => x.km_per_liter).length, 0)

  return (
    <Fragment>
      <Seo title="Fuel Logs" />
      <Pageheader title="Vehicle" subtitle="Fuel" currentpage="Fuel Logs" activepage="Fleet Management" />

      {/* Summary mini cards */}
      <Row className="g-3 mb-3">
        <Col md={4}>
          <Card className="custom-card">
            <Card.Body className="d-flex align-items-center gap-3 py-3">
              <div className="avatar avatar-md bg-info-transparent rounded-2">
                <i className="ri-gas-station-fill fs-22 text-info" />
              </div>
              <div>
                <p className="text-muted fs-11 mb-1">Total Liters (page)</p>
                <h5 className="mb-0 fw-bold">{totalLiters.toLocaleString('id-ID', { maximumFractionDigits: 1 })} L</h5>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="custom-card">
            <Card.Body className="d-flex align-items-center gap-3 py-3">
              <div className="avatar avatar-md bg-warning-transparent rounded-2">
                <i className="ri-money-dollar-circle-fill fs-22 text-warning" />
              </div>
              <div>
                <p className="text-muted fs-11 mb-1">Total Cost (page)</p>
                <h5 className="mb-0 fw-bold">{fmtCurrency(totalCost)}</h5>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="custom-card">
            <Card.Body className="d-flex align-items-center gap-3 py-3">
              <div className="avatar avatar-md bg-success-transparent rounded-2">
                <i className="ri-speed-fill fs-22 text-success" />
              </div>
              <div>
                <p className="text-muted fs-11 mb-1">Avg KM/L (page)</p>
                <h5 className="mb-0 fw-bold">{avgKmL > 0 ? avgKmL.toFixed(2) : '—'}</h5>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <div className="card-title mb-0">
                <i className="ri-gas-station-fill me-2 text-info" /> Fuel Logs
                {paginationMeta && <Badge bg="primary" className="ms-2 fs-11">{paginationMeta.total}</Badge>}
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <Form.Select style={{ maxWidth: 220 }} value={filterVehicle}
                  onChange={(e) => { setFilterVehicle(e.target.value); setPage(1) }}>
                  <option value="">All Vehicles</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.vehicle_code} — {v.plate_number}</option>
                  ))}
                </Form.Select>
                <Button variant="primary" size="sm" onClick={() => { setForm(emptyForm()); setFormError(null); setShowModal(true) }}>
                  <i className="ri-add-line me-1" /> Log Fuel
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold fs-12">Date</th>
                        <th className="fw-semibold fs-12">Vehicle</th>
                        <th className="fw-semibold fs-12">Driver</th>
                        <th className="fw-semibold fs-12 text-end">Odometer</th>
                        <th className="fw-semibold fs-12 text-end">Liters</th>
                        <th className="fw-semibold fs-12 text-end">Cost/L</th>
                        <th className="fw-semibold fs-12 text-end">Total Cost</th>
                        <th className="fw-semibold fs-12 text-end">KM/L</th>
                        <th className="fw-semibold fs-12">Fuel Type</th>
                        <th className="fw-semibold fs-12">Station</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="text-center text-muted py-5">
                            <i className="ri-gas-station-line d-block fs-30 mb-2" />
                            No fuel logs found
                          </td>
                        </tr>
                      ) : items.map((l: any) => (
                        <tr key={l.id}>
                          <td className="fs-12 text-nowrap">
                            {new Date(l.fuel_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td>
                            <div className="fw-semibold fs-12">{l.vehicle?.vehicle_code}</div>
                            <div className="text-muted fs-11">{l.vehicle?.plate_number}</div>
                          </td>
                          <td className="fs-12">{l.driver?.name || '—'}</td>
                          <td className="text-end fs-12 text-nowrap">{Number(l.odometer).toLocaleString('id-ID')} km</td>
                          <td className="text-end fs-12 fw-semibold">{Number(l.liters).toFixed(2)} L</td>
                          <td className="text-end fs-12">{fmtCurrency(l.unit_price)}</td>
                          <td className="text-end fs-12 fw-bold text-nowrap">{fmtCurrency(l.total_cost)}</td>
                          <td className="text-end fs-12">
                            {l.km_per_liter
                              ? <span className={`fw-semibold ${Number(l.km_per_liter) < 8 ? 'text-danger' : Number(l.km_per_liter) < 12 ? 'text-warning' : 'text-success'}`}>
                                  {Number(l.km_per_liter).toFixed(2)}
                                </span>
                              : '—'
                            }
                          </td>
                          <td>
                            <span className="badge bg-light text-dark fs-11">{l.fuel_type || '—'}</span>
                          </td>
                          <td className="fs-11 text-muted">{l.fuel_station || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
            {paginationMeta && paginationMeta.last > 1 && (
              <Card.Footer className="d-flex justify-content-between align-items-center">
                <span className="text-muted fs-12">Page {paginationMeta.current} of {paginationMeta.last}</span>
                <div className="d-flex gap-1">
                  <Button size="sm" variant="light" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    <i className="ri-arrow-left-s-line" />
                  </Button>
                  <Button size="sm" variant="light" disabled={page === paginationMeta.last} onClick={() => setPage(page + 1)}>
                    <i className="ri-arrow-right-s-line" />
                  </Button>
                </div>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Log Fuel Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-16"><i className="ri-gas-station-line me-2" />Log Fuel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <div className="alert alert-danger fs-13 py-2">{formError}</div>}
          <Row className="g-3">
            <Col md={12}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Vehicle *</Form.Label>
              <Form.Select value={form.vehicle_id} onChange={(e) => set('vehicle_id', e.target.value)}>
                <option value="">Select vehicle...</option>
                {vehicles.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.vehicle_code} — {v.plate_number} ({v.brand} {v.model})</option>
                ))}
              </Form.Select>
            </Form.Group></Col>
            <Col md={12}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Driver</Form.Label>
              <Form.Select value={form.driver_id} onChange={(e) => set('driver_id', e.target.value)}>
                <option value="">Select driver...</option>
                {drivers.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Form.Select>
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Date *</Form.Label>
              <Form.Control type="date" value={form.fuel_date} onChange={(e) => set('fuel_date', e.target.value)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Odometer (km) *</Form.Label>
              <Form.Control type="number" value={form.odometer} min={0} step={0.1}
                onChange={(e) => set('odometer', e.target.value)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Liters *</Form.Label>
              <Form.Control type="number" value={form.liters} min={0.01} step={0.01}
                onChange={(e) => set('liters', e.target.value)} />
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Price/Liter (Rp)</Form.Label>
              <Form.Control type="number" value={form.unit_price} min={0}
                onChange={(e) => set('unit_price', e.target.value)} />
            </Form.Group></Col>
            {form.liters && form.unit_price && (
              <Col md={12}>
                <div className="alert alert-info py-2 fs-13 mb-0">
                  <strong>Total Cost:</strong> {fmtCurrency(parseFloat(form.liters) * parseFloat(form.unit_price))}
                </div>
              </Col>
            )}
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Fuel Type</Form.Label>
              <Form.Select value={form.fuel_type} onChange={(e) => set('fuel_type', e.target.value)}>
                {FUEL_TYPES.map((ft) => <option key={ft} value={ft}>{ft}</option>)}
              </Form.Select>
            </Form.Group></Col>
            <Col md={6}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Fuel Station</Form.Label>
              <Form.Control value={form.fuel_station} onChange={(e) => set('fuel_station', e.target.value)}
                placeholder="SPBU / Station name" />
            </Form.Group></Col>
            <Col md={12}>
              <Form.Check type="switch" id="full-tank" label="Full Tank"
                checked={form.full_tank} onChange={(e) => set('full_tank', e.target.checked)} />
            </Col>
            <Col md={12}><Form.Group>
              <Form.Label className="fs-13 fw-semibold">Notes</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.notes}
                onChange={(e) => set('notes', e.target.value)} />
            </Form.Group></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !form.vehicle_id || !form.odometer || !form.liters}>
            {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : 'Save Fuel Log'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}
