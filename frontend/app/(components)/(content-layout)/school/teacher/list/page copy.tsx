'use client'

import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import SpkDropdown from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import { JobsListData } from '@/shared/data/dashboards/jobs/joblistdata'
import StickyHeadTable, {
  CustomizedTables,
  DataTabless,
  Deletetable,
  ExportCSV,
} from '@/shared/data/tables/tablesdata'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import Image from 'next/image'
import Link from 'next/link'
import React, { Fragment } from 'react'
import { Card, Col, Dropdown, Form, Pagination, Row } from 'react-bootstrap'

interface JobsListProps {}

const JobsList: React.FC<JobsListProps> = () => {
  return (
    <Fragment>
      {/* <!-- Page Header --> */}

      <Seo title="Teacher List" />

      <Pageheader
        title="School"
        subtitle="Teacher"
        currentpage="Teacher List"
        activepage="Teacher List"
      />

      {/* <!-- Page Header Close --> */}

      {/* <!-- Start::row-1 --> */}

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between">
              <div className="card-title">All Teacher List</div>
              <div className="d-flex flex-wrap gap-2">
                <Link
                  scroll={false}
                  href="/dashboards/jobs/job-post"
                  className="btn btn-primary btn-wave"
                >
                  <i className="ri-add-line me-1 align-middle"></i>Add Teacher
                </Link>
                <SpkDropdown
                  Customtoggleclass="btn btn-primary btn-wave no-caret"
                  Toggletext="Sort By"
                  Arrowicon={true}
                >
                  <Dropdown.Item as="li" href="#!">
                    Posted Date
                  </Dropdown.Item>
                  <Dropdown.Item href="#!">Status</Dropdown.Item>
                  <Dropdown.Item href="#!">Department</Dropdown.Item>
                  <Dropdown.Item href="#!">Job Type</Dropdown.Item>
                  <Dropdown.Item href="#!">Newest</Dropdown.Item>
                  <Dropdown.Item href="#!">Oldest</Dropdown.Item>
                </SpkDropdown>
              </div>
            </Card.Header>
            <Card.Body className="custom-data-table">
              <DataTabless />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* <!--End::row-1 --> */}
    </Fragment>
  )
}

export default JobsList
