'use client'

import React, { ReactNode } from 'react'
import { Card, Dropdown } from 'react-bootstrap'

interface DashboardWidgetCardProps {
  title: string
  subtitle?: string
  icon?: string
  iconClass?: string
  children: ReactNode
  className?: string
  bodyClassName?: string
}

const DashboardWidgetCard: React.FC<DashboardWidgetCardProps> = ({
  title,
  subtitle,
  icon = 'bi-cpu',
  iconClass = 'text-primary',
  children,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <Card className={`custom-card overflow-hidden h-100 ${className}`}>
      <Card.Header className="d-flex justify-content-between align-items-start py-3 px-3 border-bottom">
        <div className="d-flex align-items-start gap-2 min-w-0">
          <span
            className={`avatar avatar-sm avatar-rounded bg-primary-transparent flex-shrink-0 d-flex align-items-center justify-content-center ${iconClass}`}
          >
            <i className={`bi ${icon} fs-14`} />
          </span>
          <div className="min-w-0">
            <div className="fw-semibold fs-14 text-truncate">{title}</div>
            {subtitle && (
              <div className="text-muted fs-11 text-truncate">{subtitle}</div>
            )}
          </div>
        </div>
        <div className="d-flex align-items-center gap-1 flex-shrink-0">
          <button
            type="button"
            className="btn btn-sm btn-icon btn-light border-0"
            aria-label="Widget info"
          >
            <i className="bi bi-info-circle text-muted" />
          </button>
          <Dropdown align="end">
            <Dropdown.Toggle
              as="button"
              className="btn btn-sm btn-icon btn-light border-0 no-caret"
              aria-label="Widget menu"
            >
              <i className="bi bi-three-dots-vertical text-muted" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>Export data</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Card.Header>
      <Card.Body className={`p-3 ${bodyClassName}`}>{children}</Card.Body>
    </Card>
  )
}

export default DashboardWidgetCard
