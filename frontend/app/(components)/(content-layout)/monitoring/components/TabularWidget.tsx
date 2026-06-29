'use client'

import React from 'react'
import { Table } from 'react-bootstrap'
import DashboardWidgetCard from './DashboardWidgetCard'

type TableRow = {
  node: string
  volts1: string
  volts2: string
  volts3: string
  current1: string
  current2: string
  current3: string
  lastUpdate: string
}

const TABLE_DATA: TableRow[] = [
  {
    node: 'ND20_Test',
    volts1: '4,549.67',
    volts2: '4,610.65',
    volts3: '4,580.12',
    current1: '12.45',
    current2: '11.80',
    current3: '10.92',
    lastUpdate: '06:38:02',
  },
  {
    node: 'ND30',
    volts1: '4,520.10',
    volts2: '4,595.30',
    volts3: '4,560.88',
    current1: '13.10',
    current2: '12.05',
    current3: '11.40',
    lastUpdate: '06:38:01',
  },
]

interface TabularWidgetProps {
  selectedDeviceName?: string
}

const TabularWidget: React.FC<TabularWidgetProps> = ({ selectedDeviceName }) => {
  return (
    <DashboardWidgetCard
      title="Tabular"
      subtitle="Realtime"
      icon="bi-table"
      iconClass="text-success"
      bodyClassName="p-0"
    >
      <div className="table-responsive">
        <Table className="text-nowrap mb-0" hover>
          <thead>
            <tr>
              <th className="ps-3">Node</th>
              <th>Volts 1</th>
              <th>Volts 2</th>
              <th>Volts 3</th>
              <th>Current 1</th>
              <th>Current 2</th>
              <th>Current 3</th>
              <th className="pe-3">Last Update</th>
            </tr>
          </thead>
          <tbody>
            {TABLE_DATA.map((row) => (
              <tr
                key={row.node}
                className={selectedDeviceName === row.node ? 'table-active' : undefined}
              >
                <td className="ps-3">
                  <span className="d-inline-flex align-items-center gap-2">
                    <i className="bi bi-cpu text-primary" />
                    {row.node}
                  </span>
                </td>
                <td>{row.volts1}</td>
                <td>{row.volts2}</td>
                <td>{row.volts3}</td>
                <td>{row.current1}</td>
                <td>{row.current2}</td>
                <td>{row.current3}</td>
                <td className="pe-3 text-muted">{row.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </DashboardWidgetCard>
  )
}

export default TabularWidget


