'use client'

import React from 'react'
import { Card } from 'react-bootstrap'

interface SingleValueWidgetProps {
  title: string
  value: string
  subtitle: string
}

const SingleValueWidget: React.FC<SingleValueWidgetProps> = ({
  title,
  value,
  subtitle,
}) => {
  return (
    <Card className="custom-card overflow-hidden h-100">
      <Card.Header className="d-flex justify-content-between align-items-start py-2 px-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <span className="avatar avatar-sm avatar-rounded bg-primary-transparent d-flex align-items-center justify-content-center text-primary">
            <i className="bi bi-cpu fs-14" />
          </span>
          <span className="fw-semibold fs-13">{title}</span>
        </div>
        <div className="d-flex gap-1">
          <button
            type="button"
            className="btn btn-sm btn-icon btn-light border-0"
            aria-label="Widget info"
          >
            <i className="bi bi-info-circle text-muted" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-icon btn-light border-0"
            aria-label="Widget menu"
          >
            <i className="bi bi-three-dots-vertical text-muted" />
          </button>
        </div>
      </Card.Header>
      <Card.Body className="d-flex flex-column justify-content-center py-4 px-3">
        <div className="fs-11 text-muted mb-2">{subtitle}</div>
        <div className="fw-semibold fs-18 lh-sm">{value}</div>
      </Card.Body>
    </Card>
  )
}

export default SingleValueWidget
