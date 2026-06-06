'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, Form, Spinner } from 'react-bootstrap';
import { apiClient } from '@/lib/api-client';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface FacilityEnergyChartProps {
  facilityId: string | null;
}

const timeFrames = [
  { label: 'Yesterday', days: 1 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'This Month', type: 'thisMonth' },
  { label: 'Last Month', type: 'lastMonth' },
  { label: 'This Year', type: 'thisYear' },
  { label: 'Last Year', type: 'lastYear' },
];

export default function FacilityEnergyChart({ facilityId }: FacilityEnergyChartProps) {
  const [selectedFrame, setSelectedFrame] = useState(timeFrames[2]); // Last 30 Days
  const [data, setData] = useState<{ date: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    // Calculate date ranges based on selected frame
    const today = new Date();
    let fromDate = new Date();
    let toDate = new Date();

    if (selectedFrame.days) {
      fromDate.setDate(today.getDate() - selectedFrame.days);
      if (selectedFrame.days === 1) toDate.setDate(today.getDate() - 1);
    } else if (selectedFrame.type === 'thisMonth') {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (selectedFrame.type === 'lastMonth') {
      fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      toDate = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (selectedFrame.type === 'thisYear') {
      fromDate = new Date(today.getFullYear(), 0, 1);
    } else if (selectedFrame.type === 'lastYear') {
      fromDate = new Date(today.getFullYear() - 1, 0, 1);
      toDate = new Date(today.getFullYear() - 1, 11, 31);
    }

    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    setDateRange({ from: fmt(fromDate), to: fmt(toDate) });
  }, [selectedFrame]);

  const fetchData = async () => {
    if (!facilityId || !dateRange.from || !dateRange.to) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        facility_id: facilityId,
        date_from: dateRange.from,
        date_to: dateRange.to
      });
      const res = await apiClient.get(`/monitoring/acuvim/daily-energy?${params}`);
      setData(res.data || []);
    } catch (e) {
      console.error('Failed to fetch energy data', e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [facilityId, dateRange]);

  const categories = data.map(d => {
    const dt = new Date(d.date);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  });
  const seriesData = data.map(d => d.value);

  const options: any = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ['#0dcaf0'],
    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 2
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: categories,
      labels: {
        style: { colors: 'var(--text-muted)' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      title: {
        text: 'Days',
        style: { color: 'var(--text-muted)', fontWeight: 600 }
      }
    },
    yaxis: {
      title: {
        text: 'Daily Energy (kWh)',
        style: { color: 'var(--text-muted)', fontWeight: 600 }
      },
      labels: {
        style: { colors: 'var(--text-muted)' },
        formatter: (val: number) => {
          if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
          return val;
        }
      }
    },
    grid: {
      borderColor: 'var(--default-border)',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } }
    },
    theme: { mode: 'light' },
    tooltip: { theme: 'dark' }
  };

  const series = [{
    name: 'Energy',
    data: seriesData
  }];

  return (
    <Card className="custom-card shadow-sm border-0 mb-4">
      <Card.Header className="border-bottom pb-3 pt-3 d-flex flex-wrap justify-content-between align-items-center bg-transparent">
        <div className="d-flex align-items-center gap-3">
          <span className="fw-medium text-muted fs-14">Select a Time Frame:</span>
          <Form.Select 
            size="sm" 
            style={{ width: '150px' }} 
            className="shadow-none border-default"
            value={selectedFrame.label}
            onChange={(e) => {
              const frame = timeFrames.find(f => f.label === e.target.value);
              if (frame) setSelectedFrame(frame);
            }}
          >
            {timeFrames.map(f => (
              <option key={f.label} value={f.label}>{f.label}</option>
            ))}
          </Form.Select>
          <div className="d-flex align-items-center gap-2 text-muted fs-13 bg-light px-3 py-1 rounded border border-default">
            <i className="bi bi-calendar"></i>
            {dateRange.from} &nbsp;To&nbsp; {dateRange.to}
          </div>
        </div>
        <button 
          onClick={fetchData} 
          className="btn btn-teal rounded-pill btn-sm px-4 fw-medium shadow-sm"
        >
          update chart
        </button>
      </Card.Header>
      <Card.Body className="pt-4">
        <Card.Title className="fw-bold fs-15 text-dark mb-4">
          Consumption for the {selectedFrame.label}
        </Card.Title>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: 350 }}>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center text-muted fs-14" style={{ height: 350 }}>
            No energy consumption data found for this period.
          </div>
        ) : (
          <div id="facility-energy-chart">
            <ReactApexChart options={options} series={series} type="bar" height={350} />
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
