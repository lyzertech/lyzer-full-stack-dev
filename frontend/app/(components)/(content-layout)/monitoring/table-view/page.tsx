'use client'

import Seo from '@/shared/layouts-components/seo/seo'
import React, { Fragment } from 'react'
import TableViewDashboard from './TableViewDashboard'

const TableViewPage: React.FC = () => {
  return (
    <Fragment>
      <Seo title="Monitoring Table View" />
      <TableViewDashboard />
    </Fragment>
  )
}

export default TableViewPage
