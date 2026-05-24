'use client'

import React, { useState, useEffect } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Row, Col, Nav, Card } from 'react-bootstrap'
import BrandsTab from './BrandsTab'
import CategoriesTab from './CategoriesTab'
import SpecDefinitionsTab from './SpecDefinitionsTab'
import CategorySpecMapTab from './CategorySpecMapTab'
import ProductsTab from './ProductsTab'

type TabKey = 'products' | 'brands' | 'categories' | 'specs' | 'mapping'

interface TabConfig {
  key: TabKey
  label: string
  icon: string
  description: string
}

const TABS: TabConfig[] = [
  {
    key: 'products',
    label: 'Products',
    icon: 'bi-box-seam',
    description: 'Manage product catalog with dynamic specifications',
  },
  {
    key: 'brands',
    label: 'Brands',
    icon: 'bi-building',
    description: 'Manage product manufacturers and brands',
  },
  {
    key: 'categories',
    label: 'Categories',
    icon: 'bi-layers',
    description: 'Organize products into categories',
  },
  {
    key: 'specs',
    label: 'Spec Definitions',
    icon: 'bi-list-ul',
    description: 'Define reusable specification types',
  },
  {
    key: 'mapping',
    label: 'Spec Mapping',
    icon: 'bi-diagram-3',
    description: 'Assign spec definitions to categories',
  },
]

export default function LabsProductsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('products')
  const [stats, setStats] = useState({
    products: '—' as string | number,
    brands: '—' as string | number,
    categories: '—' as string | number,
    specs: '—' as string | number,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const fetchCount = async (url: string) => {
          const res = await fetch(url)
          if (!res.ok) return '—'
          const data = await res.json()
          return data.total !== undefined 
            ? data.total 
            : (Array.isArray(data) ? data.length : data.data?.length ?? '—')
        }

        const [products, brands, categories, specs] = await Promise.all([
          fetchCount('/api/v1/labs/products?per_page=1'),
          fetchCount('/api/v1/labs/brands?per_page=1'),
          fetchCount('/api/v1/labs/categories?per_page=1'),
          fetchCount('/api/v1/labs/spec-definitions?per_page=1')
        ])

        setStats({ products, brands, categories, specs })
      } catch (err) {
        console.error('Failed to fetch stats', err)
      }
    }
    fetchStats()
  }, [])

  const currentTab = TABS.find((t) => t.key === activeTab)!

  return (
    <React.Fragment>
      <Seo title="Product Spec System - Labs" />

      <Pageheader
        title="Products"
        subtitle="Labs"
        currentpage="Product Spec System"
        activepage="Labs"
      />

      {/* System Overview Stats */}
      <Row className="mb-4 gy-3">
        {[
          {
            icon: 'bi-box-seam',
            label: 'Products',
            color: 'primary',
            desc: 'In catalog',
            value: stats.products
          },
          {
            icon: 'bi-building',
            label: 'Brands',
            color: 'warning',
            desc: 'Registered',
            value: stats.brands
          },
          {
            icon: 'bi-layers',
            label: 'Categories',
            color: 'info',
            desc: 'Active',
            value: stats.categories
          },
          {
            icon: 'bi-list-ul',
            label: 'Spec Types',
            color: 'success',
            desc: 'Defined',
            value: stats.specs
          },
        ].map((s, i) => (
          <Col key={i} xxl={3} xl={3} md={6} xs={6}>
            <Card
              className="custom-card shadow-sm border-0"
              style={{ borderRadius: 16 }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-center gap-3">
                  <span
                    className={`avatar avatar-md bg-${s.color}-transparent text-${s.color} avatar-rounded border border-${s.color}-transparent shadow-sm`}
                  >
                    <i className={`${s.icon} fs-18`} />
                  </span>
                  <div>
                    <div className={`fs-18 fw-bold text-${s.color}`}>{s.value}</div>
                    <div className="fs-12 text-muted fw-semibold">
                      {s.label}{' '}
                      <span className="fw-normal opacity-75">{s.desc}</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tab Navigation */}
      <Card
        className="custom-card shadow-sm border-0 mb-4"
        style={{ borderRadius: 16 }}
      >
        <Card.Body className="p-0">
          <Nav
            variant="pills"
            className="p-3 gap-1 flex-nowrap overflow-auto"
            style={{ background: 'var(--custom-white)', borderRadius: 16 }}
          >
            {TABS.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`d-flex align-items-center gap-2 fw-semibold fs-13 px-3 py-2 rounded-pill text-nowrap ${
                    activeTab === tab.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted'
                  }`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  id={`tab-${tab.key}`}
                >
                  <i className={`${tab.icon} fs-14`} />
                  {tab.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Body>
      </Card>

      {/* Tab description banner */}
      <div
        className="p-3 mb-4 rounded-3 border border-primary-transparent bg-primary-transparent d-flex align-items-center gap-3"
        style={{ borderRadius: 12 }}
      >
        <span className="avatar avatar-sm bg-primary text-white avatar-rounded shadow-sm">
          <i className={`${currentTab.icon} fs-14`} />
        </span>
        <div>
          <span className="fw-bold fs-14 text-primary">{currentTab.label}</span>
          <span className="text-muted fs-13 ms-2">
            {currentTab.description}
          </span>
        </div>
        {activeTab === 'mapping' && (
          <span className="ms-auto badge bg-info-transparent text-info border border-default fs-11">
            <i className="bi bi-info-circle me-1" />
            Tip: Add specs on the left, reorder with arrows on the right
          </span>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && <ProductsTab />}
      {activeTab === 'brands' && <BrandsTab />}
      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'specs' && <SpecDefinitionsTab />}
      {activeTab === 'mapping' && <CategorySpecMapTab />}
    </React.Fragment>
  )
}
