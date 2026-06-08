'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { WaveformChart, SingleWaveChart } from './WaveformChart'
import PhasorDiagram from './PhasorDiagram'
import DeviceTree, { DeviceNode } from './DeviceTree'
import { apiClient } from '@/lib/api-client'
import { useAnalysisTheme, statusBadge, type AnalysisTheme } from './useAnalysisTheme'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AcuvimRow {
  Timestamp: string
  V1?: number; V2?: number; V3?: number
  V12?: number; V23?: number; V31?: number
  Vnavg_V?: number; Vlavg_V?: number
  I1?: number; I2?: number; I3?: number; Iavg_A?: number; In?: number
  Freq_Hz?: number
  Psum_kW?: number; Qsum_kvar?: number; Ssum_kVA?: number
  PF1?: number; PF2?: number; PF3?: number; PF?: number
  EP_IMP_kWh?: number; EP_EXP_kWh?: number;
  EQ_IMP_kvarh?: number; EQ_EXP_kvarh?: number;
  ES_kVAh?: number;
  Ang_Vb?: number; Ang_Vc?: number;
  Ang_Ia?: number; Ang_Ib?: number; Ang_Ic?: number;
}

interface ChartData {
  time: string
  l1: number | null
  l2: number | null
  l3: number | null
}
interface SingleData {
  time: string
  value: number | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const n = (v: number | string | undefined, fallback: number | null = null) => {
  if (v === null || v === undefined || v === '') return fallback
  const x = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(x) ? x : fallback
}

/** Round clock time to nearest interval slot (e.g. 10:47 + 5min → 10:45). */
function roundToSlot(h: number, m: number, intervalMin: number): string {
  let hours = h
  let minutes = Math.round(m / intervalMin) * intervalMin
  if (minutes >= 60) {
    hours = (hours + Math.floor(minutes / 60)) % 24
    minutes = minutes % 60
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/** Map API Timestamp → HH:mm slot key (avoids timezone shifting the slot). */
function toSlotKey(ts: string, intervalMin: number): string {
  if (!ts) return ''
  const iso = ts.includes('T') ? ts : ts.replace(' ', 'T')
  const d = new Date(iso)
  if (!Number.isNaN(d.getTime())) {
    return roundToSlot(d.getHours(), d.getMinutes(), intervalMin)
  }
  const m = ts.match(/(\d{1,2}):(\d{2})/)
  if (m) return roundToSlot(parseInt(m[1], 10), parseInt(m[2], 10), intervalMin)
  return ''
}

function toTime(ts: string) {
  const key = toSlotKey(ts, 5)
  if (key) return key
  try {
    return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ts?.slice(11, 16) ?? ''
  }
}

// Generate slots for a full day based on interval in minutes
function makeDaySlots(intervalMin: number): string[] {
  const slots: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += intervalMin) {
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    }
  }
  return slots
}

function buildByTime(rows: AcuvimRow[], intervalMin: number): Map<string, AcuvimRow> {
  const byTime = new Map<string, AcuvimRow>()
  const sorted = [...rows].sort(
    (a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime()
  )
  for (const r of sorted) {
    const t = toSlotKey(r.Timestamp, intervalMin)
    if (!t) continue
    byTime.set(t, r)
  }
  return byTime
}

// Build full-day charts: merge real rows into the scaffold.
function buildCharts(rows: AcuvimRow[], slots: string[], intervalMin: number) {
  const byTime = buildByTime(rows, intervalMin)

  const current:  ChartData[]  = []
  const lnVolt:   ChartData[]  = []
  const llVolt:   ChartData[]  = []
  const freq:     SingleData[] = []
  const active:   SingleData[] = []
  const reactive: SingleData[] = []
  const apparent: SingleData[] = []
  const pf:       ChartData[]  = []

  for (const slot of slots) {
    const r = byTime.get(slot) ?? null
    current.push ({ time: slot, l1: r ? n(r.I1) : null,      l2: r ? n(r.I2) : null,       l3: r ? n(r.I3) : null })
    lnVolt.push  ({ time: slot, l1: r ? n(r.V1) : null,      l2: r ? n(r.V2) : null,       l3: r ? n(r.V3) : null })
    llVolt.push  ({ time: slot, l1: r ? n(r.V12) : null,     l2: r ? n(r.V23) : null,      l3: r ? n(r.V31) : null })
    freq.push    ({ time: slot, value: r ? n(r.Freq_Hz) : null })
    active.push  ({ time: slot, value: r ? n(r.Psum_kW) : null })
    reactive.push({ time: slot, value: r ? n(r.Qsum_kvar) : null })
    apparent.push({ time: slot, value: r ? n(r.Ssum_kVA) : null })
    pf.push      ({ time: slot, l1: r ? n(r.PF1) : null,     l2: r ? n(r.PF2) : null,      l3: r ? n(r.PF3) : null })
  }

  return { current, lnVolt, llVolt, freq, active, reactive, apparent, pf }
}

function buildEnergyCharts(rows: AcuvimRow[], slots: string[], intervalMin: number) {
  const byTime = buildByTime(rows, intervalMin)

  const epImp: SingleData[] = []
  const epExp: SingleData[] = []
  const eqImp: SingleData[] = []
  const eqExp: SingleData[] = []
  const es: SingleData[] = []

  let lastVals: {
    EP_IMP_kWh: number | null
    EP_EXP_kWh: number | null
    EQ_IMP_kvarh: number | null
    EQ_EXP_kvarh: number | null
    ES_kVAh: number | null
  } | null = null
  let lastFilledIdx = -1

  for (let idx = 0; idx < slots.length; idx++) {
    const slot = slots[idx]
    const r = byTime.get(slot)

    if (r) {
      const consecutive = lastFilledIdx >= 0 && idx - lastFilledIdx === 1
      if (lastVals && consecutive) {
        epImp.push({ time: slot, value: n(r.EP_IMP_kWh) !== null && lastVals.EP_IMP_kWh !== null ? Number(Math.max(0, r.EP_IMP_kWh! - lastVals.EP_IMP_kWh).toFixed(2)) : null })
        epExp.push({ time: slot, value: n(r.EP_EXP_kWh) !== null && lastVals.EP_EXP_kWh !== null ? Number(Math.max(0, r.EP_EXP_kWh! - lastVals.EP_EXP_kWh).toFixed(2)) : null })
        eqImp.push({ time: slot, value: n(r.EQ_IMP_kvarh) !== null && lastVals.EQ_IMP_kvarh !== null ? Number(Math.max(0, r.EQ_IMP_kvarh! - lastVals.EQ_IMP_kvarh).toFixed(2)) : null })
        eqExp.push({ time: slot, value: n(r.EQ_EXP_kvarh) !== null && lastVals.EQ_EXP_kvarh !== null ? Number(Math.max(0, r.EQ_EXP_kvarh! - lastVals.EQ_EXP_kvarh).toFixed(2)) : null })
        es.push({ time: slot, value: n(r.ES_kVAh) !== null && lastVals.ES_kVAh !== null ? Number(Math.max(0, r.ES_kVAh! - lastVals.ES_kVAh).toFixed(2)) : null })
      } else {
        epImp.push({ time: slot, value: null })
        epExp.push({ time: slot, value: null })
        eqImp.push({ time: slot, value: null })
        eqExp.push({ time: slot, value: null })
        es.push({ time: slot, value: null })
      }
      lastVals = {
        EP_IMP_kWh: n(r.EP_IMP_kWh),
        EP_EXP_kWh: n(r.EP_EXP_kWh),
        EQ_IMP_kvarh: n(r.EQ_IMP_kvarh),
        EQ_EXP_kvarh: n(r.EQ_EXP_kvarh),
        ES_kVAh: n(r.ES_kVAh),
      }
      lastFilledIdx = idx
    } else {
      epImp.push({ time: slot, value: null })
      epExp.push({ time: slot, value: null })
      eqImp.push({ time: slot, value: null })
      eqExp.push({ time: slot, value: null })
      es.push({ time: slot, value: null })
    }
  }

  return { epImp, epExp, eqImp, eqExp, es }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const LiveDot = ({ live }: { live: boolean }) => (
  <span style={{
    display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
    background: live ? '#22c55e' : '#6b7280',
    boxShadow: live ? '0 0 9px #22c55e' : 'none',
    marginRight: 5, animation: live ? 'pulse 1.5s infinite' : 'none', flexShrink: 0,
  }} />
)

const PhaseTable = ({ rows, colors, theme }: {
  rows: { label: string; l1: string; l2: string; l3: string }[]
  colors: [string, string, string]
  theme: AnalysisTheme
}) => {
  const th: React.CSSProperties = {
    color: theme.tableHeader, fontSize: 12, padding: '5px 7px', textAlign: 'right', fontWeight: 600,
  }
  const td: React.CSSProperties = {
    color: theme.tableCell, fontSize: 12, padding: '5px 7px', textAlign: 'right',
    borderTop: `1px solid ${theme.tableBorder}`,
  }
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr>
          <th style={th} />
          <th style={{ ...th, color: colors[0] }}>L1</th>
          <th style={{ ...th, color: colors[1] }}>L2</th>
          <th style={{ ...th, color: colors[2] }}>L3</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.label}>
            <td style={{ ...td, color: theme.textMuted }}>{r.label}</td>
            <td style={td}>{r.l1}</td>
            <td style={td}>{r.l2}</td>
            <td style={td}>{r.l3}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Empty / Loading / Error states ──────────────────────────────────────────

const CenterMsg = ({ icon, title, sub, theme }: { icon: string; title: string; sub?: string; theme: AnalysisTheme }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40 }}>
    <i className={icon} style={{ fontSize: 43, color: theme.textDim }} />
    <div style={{ color: theme.textMuted, fontWeight: 600, fontSize: 16 }}>{title}</div>
    {sub && <div style={{ color: theme.textDim, fontSize: 14, textAlign: 'center', maxWidth: 240, lineHeight: 1.6 }}>{sub}</div>}
  </div>
)

// ─── Dashboard ────────────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}` // YYYY-MM-DD in local timezone
}

const PowerAnalysisDashboard: React.FC = () => {
  const theme = useAnalysisTheme()
  const [activeTab, setActiveTab]            = useState<'Real-time' | 'Energy'>('Real-time')
  const [isLive, setIsLive]                = useState(false)
  const [selectedDevice, setSelectedDevice]  = useState<DeviceNode | null>(null)
  const [selectedDate, setSelectedDate]      = useState<string>(todayStr)
  const [intervalMin, setIntervalMin]      = useState<number>(5)
  const [rows, setRows]                    = useState<AcuvimRow[]>([])
  const [loading, setLoading]              = useState(false)
  const [error, setError]                  = useState<string | null>(null)

  // Fetch bucketed records for device + date + interval (server-side aggregation)
  const fetchData = useCallback(async (
    deviceName: string,
    deviceSerial: string | undefined,
    date: string,
    interval: number,
  ) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        device_name:  deviceName,
        date_from:    date,
        date_to:      date,
        interval_min: String(interval),
        page:         '1',
      })
      if (deviceSerial) {
        params.set('device_serial', deviceSerial)
      }
      const res = await apiClient.get(`/monitoring/acuvim/data?${params}`)
      setRows(Array.isArray(res.data?.data) ? res.data.data : [])
    } catch (e: any) {
      setError(e.message ?? 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Refetch when device, date, or interval changes
  useEffect(() => {
    if (selectedDevice?.meta?.device_name) {
      fetchData(
        selectedDevice.meta.device_name,
        selectedDevice.meta.device_code,
        selectedDate,
        intervalMin,
      )
    } else {
      setRows([])
    }
  }, [selectedDevice, selectedDate, intervalMin, fetchData])

  // Live auto-refresh every 30s (only for today)
  const isToday = selectedDate === todayStr()
  useEffect(() => {
    if (!isLive || !isToday || !selectedDevice?.meta?.device_name) return
    const id = setInterval(
      () => fetchData(
        selectedDevice.meta!.device_name!,
        selectedDevice.meta!.device_code,
        selectedDate,
        intervalMin,
      ),
      30_000
    )
    return () => clearInterval(id)
  }, [isLive, isToday, selectedDevice, selectedDate, intervalMin, fetchData])

  // Always build full-day scaffold; empty slots = null (renders as gap)
  const slots = React.useMemo(() => makeDaySlots(intervalMin), [intervalMin])
  const charts = React.useMemo(
    () => buildCharts(rows, slots, intervalMin),
    [rows, slots, intervalMin]
  )
  const energyCharts = React.useMemo(
    () => buildEnergyCharts(rows, slots, intervalMin),
    [rows, slots, intervalMin]
  )
  const mappedPointCount = rows.length
  const latest = rows[0] // newest record (desc order from API)
  const statusInfo = statusBadge(selectedDevice?.status, theme.isDark)
  const now = new Date().toLocaleTimeString('en-GB')
  const panelTitle: React.CSSProperties = {
    color: theme.tableHeader, fontSize: 13, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 8, borderBottom: `1px solid ${theme.border}`, paddingBottom: 4,
  }

  return (
    <div style={dash}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .pma-charts { display:grid; grid-template-columns:repeat(3,1fr); gap:11px; }
        .pma-bottom { display:grid; grid-template-columns:repeat(3,1fr); gap:11px; }
        @media(max-width:1403px){.pma-charts{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:1003px){.pma-charts,.pma-bottom{grid-template-columns:1fr;}}
        .pma-main-layout { display: grid; grid-template-columns: 263px 1fr; gap: 11px; flex: 1; min-height: 0; }
        .pma-top-row { display: grid; grid-template-columns: 193px 1fr; gap: 11px; }
        .pma-phasor-row { display: flex; gap: 15px; }
        .pma-kpi-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 11px; }
        .pma-mid-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 11px; }
        @media(max-width: 1203px) {
          .pma-kpi-row { grid-template-columns: repeat(3, 1fr); }
        }
        @media(max-width: 1003px) {
          .pma-top-row { grid-template-columns: 1fr; }
        }
        .pma-sidebar { height: calc(100vh - 103px); position: sticky; top: 0; min-height: 203px; z-index: 10; }
        @media(max-width: 803px) {
          .pma-main-layout { grid-template-columns: 1fr; }
          .pma-sidebar { height: 353px; position: relative; }
          .pma-phasor-row { flex-direction: column; }
          .pma-mid-row { grid-template-columns: 1fr; }
          .pma-header-controls { margin-top: 13px; }
        }
        @media(max-width: 603px) {
          .pma-kpi-row { grid-template-columns: repeat(2, 1fr); }
        }
        .tree-scroll::-webkit-scrollbar{width:6px}
        .tree-scroll::-webkit-scrollbar-thumb{background:${theme.isDark ? '#2d3748' : '#cbd5e1'};border-radius:5px}
        .pma-scroll::-webkit-scrollbar{width:7px}
        .pma-scroll::-webkit-scrollbar-thumb{background:${theme.isDark ? '#2d3748' : '#cbd5e1'};border-radius:5px}
      `}</style>

      {/* ── Header ── */}
      <div style={headerStyle(theme)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ri-pulse-line" style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <div style={{ color: theme.text, fontWeight: 700, fontSize: 17, letterSpacing: 0.8 }}>MONITORING ANALYSIS</div>
          </div>
          <div style={{ display: 'flex', background: theme.tabBg, borderRadius: 6, padding: 3, marginLeft: 15 }}>
            <button onClick={() => setActiveTab('Real-time')} style={{ background: activeTab === 'Real-time' ? '#22c55e' : 'transparent', color: activeTab === 'Real-time' ? theme.tabActiveText : theme.tabInactive, border: 'none', borderRadius: 4, padding: '5px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Real-time</button>
            <button onClick={() => setActiveTab('Energy')} style={{ background: activeTab === 'Energy' ? '#22c55e' : 'transparent', color: activeTab === 'Energy' ? theme.tabActiveText : theme.tabInactive, border: 'none', borderRadius: 4, padding: '5px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Energy</button>
          </div>
        </div>

        <div className="pma-header-controls" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {selectedDevice && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '8px 13px' }}>
              <i className="ri-cpu-line" style={{ color: '#60a5fa', fontSize: 15 }} />
              <div>
                <div style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>{selectedDevice.label}</div>
                <div style={{ color: theme.textDim, fontSize: 12 }}>
                  {selectedDevice.meta?.model} · {selectedDevice.meta?.ip}:{selectedDevice.meta?.port}
                </div>
              </div>
              {statusInfo && (
                <div style={{ background: statusInfo.bg, border: `1px solid ${statusInfo.color}44`, borderRadius: 4, padding: '5px 9px', color: statusInfo.color, fontSize: 12, fontWeight: 700 }}>
                  {statusInfo.label}
                </div>
              )}
            </div>
          )}

          {/* Date picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '7px 13px' }}>
            <i className="ri-calendar-line" style={{ color: '#60a5fa', fontSize: 15, flexShrink: 0 }} />
            <input
              type="date"
              value={selectedDate}
              max={todayStr()}
              onChange={e => {
                setSelectedDate(e.target.value)
                setIsLive(false)
              }}
              style={{
                background: 'transparent', border: 'none', color: theme.inputText,
                fontSize: 14, outline: 'none', cursor: 'pointer',
                colorScheme: theme.isDark ? 'dark' : 'light',
              }}
            />
            {!isToday && (
              <button
                onClick={() => { setSelectedDate(todayStr()); setIsLive(false) }}
                title="Jump to today"
                style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: 13, cursor: 'pointer', padding: 0 }}
              >
                Today
              </button>
            )}
          </div>

          {/* Interval picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '7px 13px' }}>
            <i className="ri-timer-line" style={{ color: '#60a5fa', fontSize: 15, flexShrink: 0 }} />
            <select
              value={intervalMin}
              onChange={e => setIntervalMin(Number(e.target.value))}
              style={{
                background: 'transparent', border: 'none', color: theme.inputText,
                fontSize: 14, outline: 'none', cursor: 'pointer',
                colorScheme: theme.isDark ? 'dark' : 'light',
              }}
            >
              {[5, 10, 15, 30, 60].map(v => (
                <option key={v} value={v} style={{ background: theme.panelBg, color: theme.inputText }}>
                  {v === 60 ? '1 hour' : `${v} min`}
                </option>
              ))}
            </select>
          </div>

          {latest && (
            <div style={{ color: theme.textDim, fontSize: 12 }}>
              Last: {toTime(latest.Timestamp)}
            </div>
          )}

          <div style={{ color: theme.textDim, fontSize: 13 }}>{now}</div>

          <button
            onClick={() => { setIsLive(v => !v) }}
            disabled={!isToday}
            style={{ background: isLive && isToday ? (theme.isDark ? '#052e16' : '#dcfce7') : theme.tabBg, border: `1px solid ${isLive && isToday ? '#22c55e' : theme.border}`, borderRadius: 4, color: isLive && isToday ? '#22c55e' : theme.textDim, fontSize: 14, padding: '8px 13px', cursor: isToday ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 4, opacity: isToday ? 1 : 0.5 }}
          >
            <LiveDot live={isLive && isToday} />
            {isLive && isToday ? 'LIVE' : 'PAUSED'}
          </button>

          {selectedDevice?.meta?.device_name && (
            <button
              onClick={() => fetchData(selectedDevice.meta!.device_name!, selectedDate, intervalMin)}
              title="Refresh now"
              style={{ background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 4, color: theme.textDim, fontSize: 15, padding: '8px 11px', cursor: 'pointer' }}
            >
              <i className="ri-refresh-line" />
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="pma-main-layout">

        {/* Left: Device Tree */}
        <div className="pma-sidebar">
          <DeviceTree selectedId={selectedDevice?.id ?? null} onSelect={setSelectedDevice} />
        </div>

        {/* Right: Charts */}
        <div className="pma-scroll" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>

          {!selectedDevice ? (
            <div style={{ ...panelStyle(theme), flex: 1, minHeight: 400 }}>
              <CenterMsg icon="ri-cpu-line" title="Select a device" sub="Click any device in the tree to load its real-time power data." theme={theme} />
            </div>
          ) : loading ? (
            <div style={{ ...panelStyle(theme), flex: 1, minHeight: 400 }}>
              <CenterMsg icon="ri-loader-4-line" title="Loading data…" sub={`Fetching records for ${selectedDevice.label}`} theme={theme} />
            </div>
          ) : error ? (
            <div style={{ ...panelStyle(theme), flex: 1, minHeight: 400 }}>
              <CenterMsg icon="ri-error-warning-line" title="Error loading data" sub={error} theme={theme} />
            </div>
          ) : (
            <>
              {activeTab === 'Real-time' ? (
                <>
                  {/* Info + Phasor row */}
                  <div className="pma-top-row">
                    {/* Device Meta */}
                    <div style={panelStyle(theme)}>
                      <div style={panelTitle}>Device Info</div>
                      {[
                        ['Model',      selectedDevice.meta?.model],
                        ['Type',       selectedDevice.meta?.device_type],
                        ['Brand',      selectedDevice.meta?.brand],
                        ['IP',         selectedDevice.meta?.ip],
                        ['Port',       selectedDevice.meta?.port != null ? String(selectedDevice.meta.port) : undefined],
                        ['Protocol',   selectedDevice.meta?.protocol],
                        ['Connection', selectedDevice.meta?.connection_type],
                        ['Facility',   selectedDevice.meta?.facility_name],
                        ['Org',        selectedDevice.meta?.org_name],
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', gap: 4, marginBottom: 4 }}>
                          <span style={{ color: theme.textDim, fontSize: 12, flexShrink: 0 }}>{k}</span>
                          <span style={{ color: theme.text, fontSize: 12, fontWeight: 600, textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
                        </div>
                      ))}
                    </div>

                    {/* Phasor + Phase Table + Current Summary */}
                    <div className="pma-phasor-row" style={panelStyle(theme)}>
                      <div style={{ flex: '0 0 143px' }}>
                        <div style={panelTitle}>Phasor</div>
                        <div style={{ height: 120 }}>
                          <PhasorDiagram 
                            l1Mag={n(latest?.V1) ?? 230} 
                            l2Mag={n(latest?.V2) ?? 230} 
                            l3Mag={n(latest?.V3) ?? 230}
                            l1Angle={0}
                            l2Angle={n(latest?.Ang_Vb) ?? -120}
                            l3Angle={n(latest?.Ang_Vc) ?? 120}
                            i1Mag={n(latest?.I1) ?? 0}
                            i2Mag={n(latest?.I2) ?? 0}
                            i3Mag={n(latest?.I3) ?? 0}
                            i1Angle={n(latest?.Ang_Ia) ?? 0}
                            i2Angle={n(latest?.Ang_Ib) ?? -120}
                            i3Angle={n(latest?.Ang_Ic) ?? 120}
                          />
                        </div>
                      </div>
                    <div style={{ flex: 1 }}>
                        <div style={panelTitle}>Phase Values</div>
                        {rows.length === 0 ? (
                          <div style={{ color: theme.textDim, fontSize: 13, marginTop: 8 }}>No data for {selectedDate}</div>
                        ) : (
                        <PhaseTable
                          theme={theme}
                          colors={['#ef4444', '#eab308', '#3b82f6']}
                          rows={[
                            { label: 'V L-N (V)', l1: (n(latest?.V1) ?? 0).toFixed(1), l2: (n(latest?.V2) ?? 0).toFixed(1), l3: (n(latest?.V3) ?? 0).toFixed(1) },
                            { label: 'V L-L (V)', l1: (n(latest?.V12) ?? 0).toFixed(1), l2: (n(latest?.V23) ?? 0).toFixed(1), l3: (n(latest?.V31) ?? 0).toFixed(1) },
                            { label: 'I (A)',     l1: (n(latest?.I1) ?? 0).toFixed(2), l2: (n(latest?.I2) ?? 0).toFixed(2), l3: (n(latest?.I3) ?? 0).toFixed(2) },
                            { label: 'PF',        l1: (n(latest?.PF1) ?? 0).toFixed(3), l2: (n(latest?.PF2) ?? 0).toFixed(3), l3: (n(latest?.PF3) ?? 0).toFixed(3) },
                          ]}
                        />
                        )}
                      </div>
                      <div style={{ flex: '0 0 123px' }}>
                        <div style={panelTitle}>Live Summary</div>
                        {[
                          { label: 'I avg', val: (n(latest?.Iavg_A) ?? 0).toFixed(2), unit: 'A', color: '#00e5ff' },
                          { label: 'I N',   val: (n(latest?.In) ?? 0).toFixed(2),     unit: 'A', color: '#8b5cf6' },
                          { label: 'V avg', val: (n(latest?.Vnavg_V) ?? 0).toFixed(1),unit: 'V', color: '#ef4444' },
                          { label: 'PF avg',val: (n(latest?.PF) ?? 0).toFixed(3),     unit: '',  color: '#a3e635' },
                        ].map(({ label, val, unit, color }) => (
                          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                            <span style={{ color, fontSize: 12, fontWeight: 700 }}>{label}</span>
                            <span style={{ color: theme.text, fontSize: 13, fontWeight: 700 }}>{val} <span style={{ color: theme.textDim, fontSize: 12 }}>{unit}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* KPI Row */}
                  <div className="pma-kpi-row">
                    {[
                      { label: 'Frequency',  val: (n(latest?.Freq_Hz) ?? 50).toFixed(4),  unit: 'Hz',   color: '#a3e635', icon: 'ri-pulse-line' },
                      { label: 'Active P',   val: (n(latest?.Psum_kW) ?? 0).toFixed(2),       unit: 'kW',   color: '#f97316', icon: 'ri-flashlight-line' },
                      { label: 'Reactive P', val: (n(latest?.Qsum_kvar) ?? 0).toFixed(2),     unit: 'kvar', color: '#00e5ff', icon: 'ri-contrast-2-line' },
                      { label: 'Apparent P', val: (n(latest?.Ssum_kVA) ?? 0).toFixed(2),      unit: 'kVA',  color: '#a78bfa', icon: 'ri-bar-chart-line' },
                      { label: 'Avg V L-N',  val: (n(latest?.Vnavg_V) ?? 0).toFixed(1),       unit: 'V',    color: '#ef4444', icon: 'ri-battery-charge-line' },
                      { label: 'Avg I',      val: (n(latest?.Iavg_A) ?? 0).toFixed(2),        unit: 'A',    color: '#22d3ee', icon: 'ri-funds-line' },
                    ].map(({ label, val, unit, color, icon }) => (
                      <div key={label} style={{ background: theme.panelBg, border: `1px solid ${theme.border}`, borderTop: `2px solid ${color}55`, borderRadius: 6, padding: '13px 15px', textAlign: 'center' }}>
                        <i className={icon} style={{ color, fontSize: 17, marginBottom: 4, display: 'block' }} />
                        <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 3 }}>{label}</div>
                        <div style={{ color, fontSize: 19, fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>{val}</div>
                        <div style={{ color: theme.textDim, fontSize: 12, marginTop: 2 }}>{unit}</div>
                      </div>
                    ))}
                  </div>

                  {/* Charts row 1: Current / L-N Voltage / L-L Voltage */}
                  <div className="pma-charts">
                    <WaveformChart title="Current" data={charts.current}colors={['#00e5ff', '#ff6b35', '#a3e635']} unit="A" />
                    <WaveformChart title="L-N Voltage" data={charts.lnVolt}colors={['#ef4444', '#eab308', '#3b82f6']} unit="V" labels={['V1', 'V2', 'V3']} />
                    <WaveformChart title="L-L Voltage" data={charts.llVolt}colors={['#ef4444', '#eab308', '#3b82f6']} unit="V" labels={['V12', 'V23', 'V31']} />
                  </div>

                  {/* Frequency & PF */}
                  <div className="pma-mid-row">
                    <SingleWaveChart title="Frequency" data={charts.freq}color="#a3e635" unit="Hz" />
                    <WaveformChart title="Power Factor" data={charts.pf}colors={['#ef4444', '#eab308', '#3b82f6']} unit="" labels={['PF1', 'PF2', 'PF3']} />
                  </div>

                  {/* Power charts */}
                  <div className="pma-bottom">
                    <SingleWaveChart title="Active Power (Total)" data={charts.active}color="#f97316" unit="kW" forceTooltipRight={true} />
                    <SingleWaveChart title="Reactive Power (Total)" data={charts.reactive}color="#00e5ff" unit="kvar" />
                    <SingleWaveChart title="Apparent Power (Total)" data={charts.apparent}color="#a78bfa" unit="kVA" />
                  </div>
                </>
              ) : (
                <>
                  <div className="pma-mid-row">
                    <SingleWaveChart title="Active Energy (Imp)" data={energyCharts.epImp}color="#10b981" unit="kWh" />
                    <SingleWaveChart title="Active Energy (Exp)" data={energyCharts.epExp}color="#ef4444" unit="kWh" />
                  </div>
                  <div className="pma-mid-row">
                    <SingleWaveChart title="Reactive Energy (Imp)" data={energyCharts.eqImp}color="#3b82f6" unit="kvarh" />
                    <SingleWaveChart title="Reactive Energy (Exp)" data={energyCharts.eqExp}color="#8b5cf6" unit="kvarh" />
                  </div>
                  <div className="pma-bottom" style={{ display: 'block' }}>
                    <SingleWaveChart title="Apparent Energy" data={energyCharts.es}color="#f59e0b" unit="kVAh" />
                  </div>
                </>
              )}


              {/* Record count footer */}
              <div style={{ color: theme.textDim, fontSize: 13, textAlign: 'right', paddingRight: 4 }}>
                {rows.length} records · {mappedPointCount} on chart ({intervalMin} min slots) ·{' '}
                {selectedDate} · {selectedDevice.meta?.device_name}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const dash: React.CSSProperties = {
  background: 'transparent', minHeight: '100vh',
  fontFamily: '"JetBrains Mono","Fira Code",monospace',
  display: 'flex', flexDirection: 'column', gap: 8,
}
const headerStyle = (theme: AnalysisTheme): React.CSSProperties => ({
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '13px',
  background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '13px 17px', flexShrink: 0,
})
const panelStyle = (theme: AnalysisTheme): React.CSSProperties => ({
  background: theme.panelBg, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '13px 15px',
})

export default PowerAnalysisDashboard
