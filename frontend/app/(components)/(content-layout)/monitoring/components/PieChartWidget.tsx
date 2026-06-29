'use client'

import React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import DashboardWidgetCard from './DashboardWidgetCard'

const PIE_DATA = [
  { name: 'Segment A', value: 87 },
  { name: 'Segment B', value: 13 },
]

const COLORS = ['rgba(var(--info-rgb), 0.85)', 'rgb(var(--success-rgb))']

const PieChartWidget: React.FC = () => {
  return (
    <DashboardWidgetCard
      title="Pie Chart"
      subtitle="Current 1, Last Week"
      icon="bi-pie-chart"
      iconClass="text-secondary"
    >
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={PIE_DATA}
              cx="50%"
              cy="50%"
              outerRadius={85}
              dataKey="value"
              stroke="none"
            >
              {PIE_DATA.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </DashboardWidgetCard>
  )
}

export default PieChartWidget
