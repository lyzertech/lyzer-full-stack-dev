'use client'

import React from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { useAnalysisTheme } from './useAnalysisTheme'

// ─── Stats (ignores nulls) ────────────────────────────────────────────────────

function calcStats(data: (number | null)[]) {
  const real = data.filter((v): v is number => v !== null && isFinite(v))
  if (real.length === 0) return { min: '—', max: '—', avg: '—' }
  return {
    min: Math.min(...real).toFixed(2),
    max: Math.max(...real).toFixed(2),
    avg: (real.reduce((a, b) => a + b, 0) / real.length).toFixed(2),
  }
}

function solidYAxis(chart: { axisLine: string; textMuted: string; gridLine: string }) {
  return {
    type: 'value' as const,
    scale: true,
    splitLine: {
      show: true,
      lineStyle: { color: chart.gridLine, type: 'dashed' as const, width: 1 },
    },
    axisLine: {
      show: true,
      onZero: false,
      lineStyle: { color: chart.axisLine, type: 'solid' as const, width: 1 },
    },
    axisTick: {
      show: true,
      inside: false,
      length: 4,
      lineStyle: { color: chart.axisLine, width: 1 },
    },
    axisLabel: { color: chart.textMuted, fontSize: 11, margin: 6 },
  }
}

// ─── WaveformChart (3 Phase) ──────────────────────────────────────────────────

function countNonNull(data: Array<{ l1: number | null; l2: number | null; l3?: number | null }>) {
  return data.filter(
    d => d.l1 !== null || d.l2 !== null || (d.l3 !== null && d.l3 !== undefined)
  ).length
}

function lineSeriesOpts(sparse: boolean, color: string) {
  return {
    lineStyle: { width: 1.5 },
    showSymbol: sparse,
    symbolSize: sparse ? 4 : 0,
    smooth: !sparse,
    // Do not bridge across null slots (empty interval buckets stay empty).
    connectNulls: false,
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: color + '4D' },
        { offset: 1, color: color + '00' },
      ]),
    },
  }
}

interface Props {
  title: string
  data: Array<{ time: string; l1: number | null; l2: number | null; l3?: number | null }>
  colors?: [string, string, string]
  unit: string
  labels?: [string, string, string]
}

export const WaveformChart: React.FC<Props> = ({
  title, data, colors = ['#00e5ff', '#ff6b35', '#a3e635'], unit, labels = ['L1', 'L2', 'L3'],
}) => {
  const t = useAnalysisTheme()
  const chart = t.chart

  const nonNullCount = countNonNull(data)
  const sparse = nonNullCount > 0 && nonNullCount <= 48

  const s1 = calcStats(data.map(d => d.l1))
  const s2 = calcStats(data.map(d => d.l2))
  const s3 = calcStats(data.map(d => d.l3 ?? null))

  const xAxisData = data.map(d => d.time)

  const option = {
    animation: false,
    tooltip: {
      trigger: 'axis',
      backgroundColor: chart.tooltipBg,
      borderColor: chart.tooltipBorder,
      textStyle: { color: chart.textMain, fontSize: 13 },
      valueFormatter: (val: unknown) => val === undefined || val === null ? '—' : val,
    },
    grid: { top: 10, right: 10, left: 35, bottom: 25 },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: { lineStyle: { color: chart.axisLine } },
      axisLabel: { color: chart.textMuted, fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: solidYAxis(chart),
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, filterMode: 'filter' },
      {
        type: 'slider',
        xAxisIndex: 0,
        height: 12,
        bottom: 0,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        fillerColor: 'rgba(96, 165, 250, 0.2)',
        handleStyle: { color: '#60a5fa' },
        textStyle: { color: 'transparent' },
        dataBackground: {
          lineStyle: { color: chart.zoomTrack },
          areaStyle: { color: chart.zoomTrack },
        },
      },
    ],
    series: [
      {
        name: labels[0],
        type: 'line',
        data: data.map(d => d.l1),
        itemStyle: { color: colors[0] },
        ...lineSeriesOpts(sparse, colors[0]),
      },
      {
        name: labels[1],
        type: 'line',
        data: data.map(d => d.l2),
        itemStyle: { color: colors[1] },
        ...lineSeriesOpts(sparse, colors[1]),
      },
      {
        name: labels[2],
        type: 'line',
        data: data.map(d => d.l3 ?? null),
        itemStyle: { color: colors[2] },
        ...lineSeriesOpts(sparse, colors[2]),
      },
    ],
  }

  return (
    <div style={{ ...cardStyle, background: t.panelBg, border: `1px solid ${chart.border}` }}>
      <div style={{ ...titleStyle, color: t.textMuted }}>{title}</div>
      <div style={{ height: 120 }}>
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />
      </div>
      <div style={{ ...statsRow, borderTop: `1px solid ${chart.border}` }}>
        {[
          { label: labels[0], s: s1, c: colors[0] },
          { label: labels[1], s: s2, c: colors[1] },
          { label: labels[2], s: s3, c: colors[2] },
        ].map(({ label, s, c }, i) => (
          <div key={`${title}-stat-${i}`} style={{ flex: 1 }}>
            <span style={{ color: c, fontSize: 12, fontWeight: 700 }}>— {label}</span>
            <div style={statLine}>
              <span style={{ ...statLabel, color: chart.textMuted }}>min</span>
              <span style={{ color: t.statValue, fontSize: 12 }}>{s.min}{s.min !== '—' ? ` ${unit}` : ''}</span>
            </div>
            <div style={statLine}>
              <span style={{ ...statLabel, color: chart.textMuted }}>max</span>
              <span style={{ color: '#ff6b6b', fontSize: 12 }}>{s.max}{s.max !== '—' ? ` ${unit}` : ''}</span>
            </div>
            <div style={statLine}>
              <span style={{ ...statLabel, color: chart.textMuted }}>avg</span>
              <span style={{ color: t.avgGreen, fontSize: 12 }}>{s.avg}{s.avg !== '—' ? ` ${unit}` : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SingleWaveChart ──────────────────────────────────────────────────────────

interface SingleProps {
  title: string
  data: Array<{ time: string; value: number | null }>
  color?: string
  unit: string
  forceTooltipRight?: boolean
  /** First point sits on the Y-axis (no gap before 00:00). */
  flushLeft?: boolean
}

export const SingleWaveChart: React.FC<SingleProps> = ({
  title, data, color = '#a3e635', unit, forceTooltipRight, flushLeft,
}) => {
  const t = useAnalysisTheme()
  const chart = t.chart

  const nonNullCount = data.filter(d => d.value !== null).length
  const sparse = nonNullCount > 0 && nonNullCount <= 48

  const s = calcStats(data.map(d => d.value))
  const avg = s.avg !== '—' ? parseFloat(s.avg) : null

  const xAxisData = data.map(d => d.time)

  const option = {
    animation: false,
    tooltip: {
      trigger: 'axis',
      backgroundColor: chart.tooltipBg,
      borderColor: chart.tooltipBorder,
      textStyle: { color: chart.textMain, fontSize: 13 },
      valueFormatter: (val: unknown) => val === undefined || val === null ? '—' : val,
      position: forceTooltipRight
        ? function (pt: number[]) { return [pt[0] + 15, '10%'] }
        : undefined,
    },
    grid: { top: 10, right: 10, left: flushLeft ? 48 : 35, bottom: 25 },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: !flushLeft,
      axisLine: { lineStyle: { color: chart.axisLine }, onZero: flushLeft ?? false },
      axisLabel: {
        color: chart.textMuted,
        fontSize: 11,
        ...(flushLeft
          ? {
              interval: (index: number) => index === 0 || index === xAxisData.length - 1,
              showMinLabel: true,
              showMaxLabel: true,
            }
          : {}),
      },
      axisTick: { show: false },
    },
    yAxis: solidYAxis(chart),
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, filterMode: 'filter' },
      {
        type: 'slider',
        xAxisIndex: 0,
        height: 12,
        bottom: 0,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        fillerColor: 'rgba(96, 165, 250, 0.2)',
        handleStyle: { color: '#60a5fa' },
        textStyle: { color: 'transparent' },
        dataBackground: {
          lineStyle: { color: chart.zoomTrack },
          areaStyle: { color: chart.zoomTrack },
        },
      },
    ],
    series: [
      {
        name: title,
        type: 'line',
        data: data.map(d => d.value),
        itemStyle: { color },
        ...lineSeriesOpts(sparse, color),
        markLine: avg !== null ? {
          silent: true,
          symbol: 'none',
          label: { show: false },
          lineStyle: { color, type: 'dashed', opacity: 0.5 },
          data: [{ yAxis: avg }],
        } : undefined,
      },
    ],
  }

  return (
    <div style={{ ...cardStyle, background: t.panelBg, border: `1px solid ${chart.border}` }}>
      <div style={{ ...titleStyle, color: t.textMuted }}>{title}</div>
      <div style={{ height: 120 }}>
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />
      </div>
      <div style={{ ...statsRow, borderTop: `1px solid ${chart.border}` }}>
        <div style={{ flex: 1 }}>
          <span style={{ color, fontSize: 12, fontWeight: 700 }}>— {title}</span>
          <div style={statLine}>
            <span style={{ ...statLabel, color: chart.textMuted }}>min</span>
            <span style={{ color: t.statValue, fontSize: 12 }}>{s.min}{s.min !== '—' ? ` ${unit}` : ''}</span>
          </div>
          <div style={statLine}>
            <span style={{ ...statLabel, color: chart.textMuted }}>max</span>
            <span style={{ color: '#ff6b6b', fontSize: 12 }}>{s.max}{s.max !== '—' ? ` ${unit}` : ''}</span>
          </div>
          <div style={statLine}>
            <span style={{ ...statLabel, color: chart.textMuted }}>avg</span>
            <span style={{ color: t.avgGreen, fontSize: 12 }}>{s.avg}{s.avg !== '—' ? ` ${unit}` : ''}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  borderRadius: 6,
  padding: '13px 15px',
  height: '100%',
}
const titleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}
const statsRow: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  marginTop: 6,
  paddingTop: 6,
}
const statLine: React.CSSProperties = { display: 'flex', gap: 4, alignItems: 'center' }
const statLabel: React.CSSProperties = { fontSize: 12, width: 20 }
