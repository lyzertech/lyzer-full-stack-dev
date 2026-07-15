'use client'

import React, { Fragment, useState } from 'react'
import { Badge, Col, Dropdown, Row } from 'react-bootstrap'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import DeviceSelector from '../components/DeviceSelector'
import CurrentGaugeWidget from '../components/CurrentGaugeWidget'
import LineChartWidget from '../components/LineChartWidget'
import CurrentTrendsWidget from '../components/CurrentTrendsWidget'
import PhasorDiagramWidget from '../components/PhasorDiagramWidget'
import QuadrantPhasorWidget from '../components/QuadrantPhasorWidget'
import DeviceMetricsWidget from '../components/DeviceMetricsWidget'
import EnergyMetricsWidget from '../components/EnergyMetricsWidget'
import type { DeviceNode } from '../utils/deviceTree'

const DashboardsView: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceNode | null>(null)
  const deviceName = selectedDevice?.label ?? 'ND20_Test'

  return (
    <Fragment>
      <Pageheader
        title="Monitoring"
        subtitle="Dashboards"
        currentpage={selectedDevice?.label ?? 'Select device'}
        activepage="Dashboards"
      />
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <DeviceSelector
              selected={selectedDevice}
              onSelect={setSelectedDevice}
            />
            <Badge bg="light" className="text-muted border">
              Public
            </Badge>
          </div>
          {selectedDevice?.meta && (
            <div className="text-muted fs-12 mt-1">
              {selectedDevice.meta.facility_name}
              {selectedDevice.meta.model
                ? ` · ${selectedDevice.meta.model}`
                : ''}
              {selectedDevice.meta.ip ? ` · ${selectedDevice.meta.ip}` : ''}
            </div>
          )}
        </div>
      </div>

      <Row className="g-3">
        <Col xl={9} lg={6} md={6}>
          <Row className="g-3">
            <Col xl={4} lg={6} md={6}>
              <CurrentGaugeWidget device={selectedDevice} />
            </Col>
            <Col xl={4} lg={6} md={6}>
              <PhasorDiagramWidget device={selectedDevice} />
            </Col>
            <Col xl={4} lg={6} md={6}>
              <QuadrantPhasorWidget device={selectedDevice} />
            </Col>
            <Col xl={12} lg={12} md={12}>
              <EnergyMetricsWidget device={selectedDevice} />
            </Col>
          </Row>
        </Col> 
        <Col xl={3} lg={6} md={6}>
          <DeviceMetricsWidget device={selectedDevice} />
        </Col>

        <Col xl={6} lg={12}>
          <LineChartWidget device={selectedDevice} />
        </Col>
        <Col xl={6} lg={12}>
          <CurrentTrendsWidget device={selectedDevice} />
        </Col>
      </Row>
    </Fragment>
  )
}

export default DashboardsView

