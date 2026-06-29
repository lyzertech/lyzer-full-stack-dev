'use client'

import React, { Fragment, useState } from 'react'
import { Badge, Col, Dropdown, Row } from 'react-bootstrap'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import DeviceSelector from '../components/DeviceSelector'
import CurrentGaugeWidget from '../components/CurrentGaugeWidget'
import LineChartWidget from '../components/LineChartWidget'
import PieChartWidget from '../components/PieChartWidget'
import SingleValueWidget from '../components/SingleValueWidget'
import TabularWidget from '../components/TabularWidget'
import DeviceMetricsWidget from '../components/DeviceMetricsWidget'
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
        <Col xl={3} lg={6} md={6}>
          <CurrentGaugeWidget device={selectedDevice} />
        </Col>
        <Col xl={3} lg={6} md={6}>
          <DeviceMetricsWidget device={selectedDevice} />
        </Col>
        <Col xl={3} lg={6} md={6}>
          <PieChartWidget />
        </Col>
        <Col xl={3} lg={6} md={6}>
          <div className="d-flex flex-column gap-3 h-100">
            <SingleValueWidget
              title={deviceName}
              subtitle="04-06-2019 06:38:02+01:00"
              value="4,549.67 Volts 1 (V)"
            />
            <SingleValueWidget
              title={deviceName}
              subtitle="Yesterday"
              value="4,610.65 Volts 1 (V)"
            />
          </div>
        </Col>

        <Col xl={7} lg={12}>
          <LineChartWidget device={selectedDevice} />
        </Col>
        <Col xl={5} lg={12}>
          <TabularWidget selectedDeviceName={deviceName} />
        </Col>
      </Row>
    </Fragment>
  )
}

export default DashboardsView

