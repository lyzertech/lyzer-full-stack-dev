'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card } from 'react-bootstrap'
import type { AccountBalanceHistory } from '@/app/actions/finance/dashboard.actions'

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface AccountBalanceChartProps {
  data: AccountBalanceHistory[]
  loading?: boolean
}

const formatCurrencyWithSpaces = (amount: number): string => {
  const [integerPart, decimalPart = '00'] = amount.toFixed(2).split('.')
  const spacedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${spacedInteger}.${decimalPart}`
}

const AccountBalanceChart: React.FC<AccountBalanceChartProps> = ({
  data,
  loading = false,
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        series: [],
        options: {},
      }
    }

    // Transform data for ApexCharts
    const series = data.map((account) => ({
      name: `${account.bank_name} - ${account.account_name}`,
      data: account.data.map((point) => ({
        x: new Date(point.date).getTime(),
        y: point.balance,
      })),
    }))

    const options: any = {
      chart: {
        type: 'line',
        height: 350,
        zoom: {
          enabled: true,
          type: 'x',
          autoScaleYaxis: true,
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
      },
      stroke: {
        width: 2,
        curve: 'smooth',
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 4,
        hover: {
          size: 6,
        },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          format: 'dd MMM',
          datetimeUTC: false,
        },
      },
      yaxis: {
        labels: {
          formatter: (value: number) => {
            return `Rp ${formatCurrencyWithSpaces(value)}`
          },
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
          const date = new Date(w.globals.seriesX[seriesIndex][dataPointIndex])
          const dateStr = date.toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          })
          
          let tooltipContent = `<div class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;">${dateStr}</div>`
          
          series.forEach((seriesData: any, idx: number) => {
            const seriesName = w.config.series[idx].name
            const value = seriesData[dataPointIndex]
            if (value != null) {
              tooltipContent += `
                <div class="apexcharts-tooltip-series-group" style="display: flex; align-items: center; padding: 4px 8px;">
                  <span class="apexcharts-tooltip-marker" style="background-color: ${w.config.colors[idx]}; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px;"></span>
                  <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;">
                    <div class="apexcharts-tooltip-y-group">
                      <span class="apexcharts-tooltip-text-y-label">${seriesName}: </span>
                      <span class="apexcharts-tooltip-text-y-value" style="font-weight: 600;">Rp ${formatCurrencyWithSpaces(value)}</span>
                    </div>
                  </div>
                </div>
              `
            }
          })
          
          return `<div class="apexcharts-tooltip-custom" style="background: #fff; padding: 8px; border: 1px solid #e3e3e3; border-radius: 4px;">${tooltipContent}</div>`
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        floating: false,
        offsetY: 0,
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['transparent', 'transparent'],
          opacity: 0.5,
        },
      },
      colors: [
        '#6366f1',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6',
        '#ec4899',
        '#06b6d4',
        '#84cc16',
      ],
    }

    return { series, options }
  }, [data])

  if (loading) {
    return (
      <Card className="custom-card">
        <Card.Header>
          <div className="card-title">Account Balance History</div>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="custom-card">
        <Card.Header>
          <div className="card-title">Account Balance History</div>
        </Card.Header>
        <Card.Body>
          <div className="text-center text-muted py-5">
            No balance history data available
          </div>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card className="custom-card">
      <Card.Header>
        <div className="card-title">Account Balance History</div>
        <div className="text-muted fs-12">
          Balance changes over time for each account
        </div>
      </Card.Header>
      <Card.Body>
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="line"
          height={350}
        />
      </Card.Body>
    </Card>
  )
}

export default AccountBalanceChart
