'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import {
  Row, Col, Card, Badge, Button, Spinner, Table,
} from 'react-bootstrap'
import type { Product, SpecDefinition, DataType } from '../types'
import { DATA_TYPE_ICONS, STATUS_COLORS } from '../types'

// ─── Value display helper ─────────────────────────────────────────────────────
function renderValue(sv: any): React.ReactNode {
  const def: SpecDefinition = sv.spec_definition
  if (!def) return <span className="text-muted">—</span>

  const dt = def.data_type as DataType

  // Resolve the value
  let raw: any = null
  switch (dt) {
    case 'number':       raw = sv.value_number;  break
    case 'decimal':      raw = sv.value_decimal; break
    case 'boolean':      raw = sv.value_boolean; break
    case 'multi_select':
    case 'range':        raw = sv.value_json;    break
    default:             raw = sv.value_text
  }

  if (raw === null || raw === undefined || raw === '') {
    return <span className="text-muted fst-italic fs-13">—</span>
  }

  switch (dt) {
    case 'boolean':
      return (
        <span className={`badge rounded-pill fs-12 fw-semibold ${raw ? 'bg-success-transparent text-success border border-success-transparent' : 'bg-danger-transparent text-danger border border-danger-transparent'}`}>
          <i className={`bi ${raw ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`} />
          {raw ? 'Yes' : 'No'}
        </span>
      )
    case 'multi_select':
      if (!Array.isArray(raw) || raw.length === 0) return <span className="text-muted fst-italic">—</span>
      return (
        <div className="d-flex flex-wrap gap-1">
          {raw.map((v: string) => (
            <span key={v} className="badge bg-primary-transparent text-primary border border-primary-transparent rounded-pill fs-11 px-2 py-1">
              {v}
            </span>
          ))}
        </div>
      )
    case 'range':
      if (!Array.isArray(raw)) return <span className="text-muted">—</span>
      return (
        <span className="fw-semibold fs-13">
          {raw[0]} <span className="text-muted mx-1">to</span> {raw[1]}
          {def.unit && <span className="text-muted ms-1 fs-12">{def.unit}</span>}
        </span>
      )
    case 'number':
    case 'decimal':
      return (
        <span className="fw-semibold fs-13 font-monospace">
          {raw}
          {def.unit && <span className="text-muted ms-1 fs-12">{def.unit}</span>}
        </span>
      )
    default:
      return (
        <span className="fs-13 fw-semibold">
          {String(raw)}
          {def.unit && <span className="text-muted ms-1 fs-12">{def.unit}</span>}
        </span>
      )
  }
}

// ─── Spec group card ──────────────────────────────────────────────────────────
function SpecGroupCard({ group, specValues }: { group: string; specValues: any[] }) {
  return (
    <Card className="custom-card shadow-sm border-0 h-100">
      <Card.Header className="border-bottom-0 pb-0">
        <div className="d-flex align-items-center gap-2">
          <span className="avatar avatar-xs bg-primary text-white avatar-rounded shadow-sm">
            <i className="bi bi-list-ul fs-11" />
          </span>
          <Card.Title className="fw-bold fs-14 mb-0">{group}</Card.Title>
          <Badge bg="primary-transparent" text="primary" className="fs-10 border border-default ms-auto">
            {specValues.length} spec{specValues.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </Card.Header>
      <Card.Body className="pt-2 px-0 pb-0">
        <Table className="table align-middle mb-0 border-0">
          <tbody>
            {specValues.map((sv, idx) => {
              const def: SpecDefinition = sv.spec_definition
              return (
                <tr key={sv.id ?? idx}
                  className="border-bottom border-default"
                  style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(var(--primary-rgb),0.02)' }}>
                  <td style={{ width: '44%' }} className="ps-4 py-2">
                    <div className="d-flex align-items-center gap-2">
                      <i className={`${DATA_TYPE_ICONS[def?.data_type as DataType] || 'bi-dash'} text-primary fs-12 opacity-75`} />
                      <span className="fs-12 fw-semibold text-muted">{def?.spec_name || '—'}</span>
                    </div>
                  </td>
                  <td className="py-2 pe-4">
                    {renderValue(sv)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/v1/labs/products/${id}`)
      .then(async r => {
        if (r.status === 404) { setNotFound(true); return }
        if (r.ok) setProduct(await r.json())
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 400 }}>
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-box-seam fs-48 text-muted d-block mb-3 opacity-50" />
        <h5 className="text-muted fw-semibold">Product not found</h5>
        <Button variant="primary" size="sm" className="mt-3" onClick={() => router.push('/labs/products')}>
          <i className="bi bi-arrow-left me-1" />Back to Products
        </Button>
      </div>
    )
  }

  const statusColors = STATUS_COLORS[product.status] || STATUS_COLORS.Draft

  // Group spec values by group_name
  const grouped: Record<string, any[]> = {}
  ;(product.spec_values || []).forEach(sv => {
    const g = sv.spec_definition?.group_name || 'General'
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(sv)
  })

  const totalSpecs = product.spec_values?.length ?? 0
  const groupCount = Object.keys(grouped).length

  return (
    <React.Fragment>
      <Seo title={`${product.product_name} — Product Detail`} />

      <Pageheader
        title={product.product_name}
        subtitle="Products"
        currentpage={product.model || product.product_name}
        activepage="Labs"
      />

      {/* ── Top action bar ───────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
        <Button variant="secondary-light" size="sm" className="shadow-sm border-0"
          onClick={() => router.push('/labs/products')}>
          <i className="bi bi-arrow-left me-1" />Back to Catalog
        </Button>
        <Button variant="primary-light" size="sm" className="shadow-sm border-0"
          onClick={() => router.push(`/labs/products`)}>
          <i className="bi bi-pencil-fill me-1" />Edit Product
        </Button>
        {product.datasheet && (
          <a href={product.datasheet} target="_blank" rel="noreferrer"
            className="btn btn-sm btn-info-light shadow-sm border-0">
            <i className="bi bi-file-earmark-pdf me-1" />Datasheet
          </a>
        )}
        <span className="ms-auto">
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '4px 14px',
            borderRadius: 20, fontSize: 13, fontWeight: 700,
            backgroundColor: statusColors.bg, color: statusColors.color,
            border: `1px solid ${statusColors.border}`,
          }}>
            {product.status}
          </span>
        </span>
      </div>

      {/* ── Hero card ────────────────────────────────────────────────── */}
      <Card className="custom-card shadow-sm border-0 mb-4" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.12) 0%, rgba(var(--primary-rgb),0.03) 100%)',
          borderBottom: '1px solid var(--default-border)',
        }}>
          <Card.Body className="p-4">
            <Row className="align-items-center gy-3">
              {/* Product avatar + name */}
              <Col lg={8}>
                <div className="d-flex align-items-center gap-4">
                  <div className="avatar avatar-xxl bg-primary-transparent text-primary avatar-rounded border border-primary-transparent shadow"
                    style={{ width: 80, height: 80, fontSize: 36 }}>
                    <i className="bi bi-cpu" />
                  </div>
                  <div>
                    <h3 className="fw-bold mb-1 fs-22">{product.product_name}</h3>
                    {product.model && (
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <code className="bg-secondary-transparent text-secondary px-2 py-1 rounded fs-13 border border-default">
                          {product.model}
                        </code>
                        {product.sku && (
                          <code className="bg-warning-transparent text-warning px-2 py-1 rounded fs-12 border border-default">
                            SKU: {product.sku}
                          </code>
                        )}
                      </div>
                    )}
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      {product.brand && (
                        <span className="d-flex align-items-center gap-1 fs-13 text-muted fw-semibold">
                          <i className="bi bi-building fs-12" />
                          {product.brand.name}
                        </span>
                      )}
                      {product.category && (
                        <span className="d-flex align-items-center gap-1 fs-13">
                          <i className={`${product.category.icon || 'bi-layers'} text-warning fs-12`} />
                          <Badge bg="warning-transparent" text="warning"
                            className="fs-11 fw-semibold border border-default">
                            {product.category.name}
                          </Badge>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Col>

              {/* Stats */}
              <Col lg={4}>
                <Row className="gy-2 gx-2 text-center">
                  {[
                    { icon: 'bi-list-check', label: 'Total Specs', value: totalSpecs, color: 'primary' },
                    { icon: 'bi-collection', label: 'Spec Groups', value: groupCount, color: 'info' },
                  ].map(stat => (
                    <Col key={stat.label} xs={6}>
                      <div className={`p-3 rounded-3 bg-${stat.color}-transparent border border-${stat.color}-transparent`}>
                        <i className={`${stat.icon} fs-20 text-${stat.color} d-block mb-1`} />
                        <div className={`fw-bold fs-20 text-${stat.color}`}>{stat.value}</div>
                        <div className="text-muted fs-11 fw-semibold">{stat.label}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>

            {product.description && (
              <div className="mt-3 pt-3 border-top border-default">
                <p className="text-muted fs-14 mb-0 lh-lg">{product.description}</p>
              </div>
            )}
          </Card.Body>
        </div>
      </Card>

      {/* ── Spec groups ──────────────────────────────────────────────── */}
      {totalSpecs === 0 ? (
        <Card className="custom-card shadow-sm border-0">
          <Card.Body className="text-center py-5">
            <i className="bi bi-clipboard-x fs-40 text-muted d-block mb-3 opacity-50" />
            <h6 className="text-muted fw-semibold">No specifications recorded</h6>
            <p className="text-muted fs-13 mb-3">
              Edit this product to add specification values.
            </p>
            <Button variant="primary" size="sm" onClick={() => router.push('/labs/products')}>
              <i className="bi bi-pencil-fill me-1" />Edit Product
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Full spec table (compact overview) */}
          <Card className="custom-card shadow-sm border-0 mb-4">
            <Card.Header className="border-bottom-0 pb-0">
              <div className="d-flex align-items-center gap-2">
                <Card.Title className="fw-bold fs-15 mb-0">
                  <i className="bi bi-table text-primary me-2" />
                  Full Specification Sheet
                </Card.Title>
                <Badge bg="primary" className="fs-11 rounded-pill ms-auto">{totalSpecs} specs</Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="table align-middle mb-0">
                  <thead className="border-bottom border-default">
                    <tr style={{ background: 'rgba(var(--primary-rgb),0.04)' }}>
                      <th className="border-0 ps-4 py-3 fs-11 text-uppercase text-muted fw-bold" style={{ width: '22%' }}>Group</th>
                      <th className="border-0 py-3 fs-11 text-uppercase text-muted fw-bold" style={{ width: '32%' }}>Specification</th>
                      <th className="border-0 py-3 fs-11 text-uppercase text-muted fw-bold">Value</th>
                      <th className="border-0 pe-4 py-3 fs-11 text-uppercase text-muted fw-bold" style={{ width: '12%' }}>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(grouped).map(([group, svs]) =>
                      svs.map((sv, idx) => {
                        const def: SpecDefinition = sv.spec_definition
                        const isFirst = idx === 0
                        return (
                          <tr key={sv.id ?? `${group}-${idx}`}
                            className="border-bottom border-default"
                            style={{ verticalAlign: 'middle' }}>
                            <td className="ps-4 py-2" style={{ width: '22%' }}>
                              {isFirst ? (
                                <span className="badge bg-primary-transparent text-primary border border-primary-transparent fs-11 fw-semibold rounded-pill">
                                  {group}
                                </span>
                              ) : null}
                            </td>
                            <td className="py-2">
                              <div className="d-flex align-items-center gap-2">
                                <i className={`${DATA_TYPE_ICONS[def?.data_type as DataType] || 'bi-dash'} text-primary fs-12 opacity-75`} />
                                <span className="fw-semibold fs-13">{def?.spec_name || '—'}</span>
                              </div>
                            </td>
                            <td className="py-2">{renderValue(sv)}</td>
                            <td className="pe-4 py-2 text-muted fs-12">{def?.unit || '—'}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* Grouped spec cards */}
          <div className="mb-2">
            <h6 className="fw-bold text-muted fs-12 text-uppercase mb-3">
              <i className="bi bi-grid-3x3-gap me-2" />Specs by Group
            </h6>
          </div>
          <Row className="gy-4">
            {Object.entries(grouped).map(([group, svs]) => (
              <Col key={group} xl={6} xs={12}>
                <SpecGroupCard group={group} specValues={svs} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </React.Fragment>
  )
}

