'use client'

import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import React, { Fragment } from 'react'
import IiotDashboardView from './IiotDashboardView'

const IiotPage: React.FC = () => {
  return (
    <Fragment>
      <Seo title="IIoT Monitoring Dashboard" />
      <Pageheader
        title="Monitoring"
        subtitle="IIoT Dashboard"
        currentpage="Real-time Electrical Monitoring"
        activepage="Monitoring"
      />
      <IiotDashboardView />
    </Fragment>
  )
}

export default IiotPage
