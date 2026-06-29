'use client'

import React from 'react'
import DashboardWidgetCard from './DashboardWidgetCard'

const WEATHER_DETAILS = [
  { label: 'Pressure', value: '1013 hPa' },
  { label: 'Clouds', value: '0%' },
  { label: 'Humidity', value: '93%' },
  { label: 'Wind', value: '1.5 km/h' },
]

const WeatherWidget: React.FC = () => {
  return (
    <DashboardWidgetCard
      title="Lumel"
      subtitle="04-06-2019 06:38:02+01:00"
      icon="bi-geo-alt"
      iconClass="text-info"
    >
      <div className="text-center py-2">
        <div className="text-muted fs-13 mb-1">Zielona Góra, PL</div>
        <div className="text-muted fs-12 mb-3">Tue 10:16 AM · Clear sky</div>

        <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
          <span className="display-4 fw-semibold mb-0">19°C</span>
          <i
            className="bi bi-sun-fill fs-1"
            style={{ color: 'rgb(var(--warning-rgb))' }}
          />
        </div>

        <div className="row g-2 text-start">
          {WEATHER_DETAILS.map((item) => (
            <div key={item.label} className="col-6">
              <div className="fs-12 text-muted">{item.label}</div>
              <div className="fs-13 fw-medium">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardWidgetCard>
  )
}

export default WeatherWidget
