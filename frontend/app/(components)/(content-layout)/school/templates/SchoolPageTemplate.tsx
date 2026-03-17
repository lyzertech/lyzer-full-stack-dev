'use client'

import React, { Fragment, useEffect, useRef, useState } from 'react'
import Seo from '@/shared/layouts-components/seo/seo'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import { Button, Card, Col, Row, Form } from 'react-bootstrap'

export default function SchoolPageTemplate({
  title = 'School',
  subtitle = 'Settings',
  pageTitle = 'Page Title',
  children,
  editable = false,
  onSave,
  onCancel,
}: any) {
  const [editing, setEditing] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)

  return (
    <Fragment>
      <Seo title={pageTitle} />
      <Pageheader
        title={title}
        subtitle={subtitle}
        currentpage={subtitle}
        activepage={subtitle}
      />

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between d-flex align-items-center">
              <div className="card-title">{pageTitle}</div>
              {editable && (
                <div>
                  {!editing ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="btn-wave"
                      onClick={() => setEditing(true)}
                    >
                      <i className="ri-edit-line me-1 align-middle" /> Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setEditing(false)
                          onCancel && onCancel()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="btn-wave"
                        onClick={() => formRef.current?.requestSubmit()}
                      >
                        <i className="ri-save-line me-1 align-middle" /> Save
                      </Button>
                    </>
                  )}
                </div>
              )}
            </Card.Header>

            <Card.Body className="custom-data-table">
              <Form ref={formRef} onSubmit={onSave}>
                {children({ editing })}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}
