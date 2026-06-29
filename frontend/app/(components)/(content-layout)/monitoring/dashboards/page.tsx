'use client'

import Seo from '@/shared/layouts-components/seo/seo'
import React, { Fragment } from 'react'
import DashboardsView from './DashboardsView'

const MonitoringDashboardsPage: React.FC = () => {
  return (
    <Fragment>
      <Seo title="Monitoring Dashboards" />
      <DashboardsView />
    </Fragment>
  )
}

export default MonitoringDashboardsPage
