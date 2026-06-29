'use client'

import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import React, { Fragment } from 'react'
import SingleLineView from './SingleLineView'

const SingleLinePage: React.FC = () => {
  return (
    <Fragment>
      <Seo title="Single Line View" />
      <Pageheader
        title="Monitoring"
        subtitle="Single Line View"
        currentpage="Electrical Single Line Diagram"
        activepage="Monitoring"
      />
      <SingleLineView />
    </Fragment>
  )
}

export default SingleLinePage
