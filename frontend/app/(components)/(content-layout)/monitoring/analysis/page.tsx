'use client'

import Seo from '@/shared/layouts-components/seo/seo'
import React, { Fragment } from 'react'
import PowerAnalysisDashboard from './PowerAnalysisDashboard'

const PowerAnalysisPage: React.FC = () => {
  return (
    <Fragment>
      <Seo title="Monitoring Analysis" />
      <PowerAnalysisDashboard />
    </Fragment>
  )
}

export default PowerAnalysisPage
