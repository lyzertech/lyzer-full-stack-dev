'use client'

import React, { useState } from 'react'
import DeviceTree, { DeviceNode } from '../analysis/DeviceTree'
import { useAnalysisTheme, statusBadge, type AnalysisTheme } from '../analysis/useAnalysisTheme'

const TableViewDashboard: React.FC = () => {
  const theme = useAnalysisTheme()
  const [selectedDevice, setSelectedDevice] = useState<DeviceNode | null>(null)
  const statusInfo = statusBadge(selectedDevice?.status, theme.isDark)

  return (
    <div style={dash}>
      <style>{`
        .tv-main-layout { display: grid; grid-template-columns: 263px 1fr; gap: 11px; flex: 1; min-height: 0; }
        .tv-sidebar { height: calc(100vh - 103px); position: sticky; top: 0; min-height: 203px; z-index: 10; }
        @media(max-width: 803px) {
          .tv-main-layout { grid-template-columns: 1fr; }
          .tv-sidebar { height: 353px; position: relative; }
        }
        .tree-scroll::-webkit-scrollbar{width:6px}
        .tree-scroll::-webkit-scrollbar-thumb{background:${theme.isDark ? '#2d3748' : '#cbd5e1'};border-radius:5px}
      `}</style>

      {/* Header */}
      <div style={headerStyle(theme)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ri-table-line" style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <div style={{ color: theme.text, fontWeight: 700, fontSize: 17, letterSpacing: 0.8 }}>TABLE VIEW</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
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
        </div>
      </div>

      {/* Body */}
      <div className="tv-main-layout">
        {/* Left: Device Tree */}
        <div className="tv-sidebar">
          <DeviceTree selectedId={selectedDevice?.id ?? null} onSelect={setSelectedDevice} />
        </div>

        {/* Right: Empty for now */}
        <div style={{ ...panelStyle(theme), flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div style={{ textAlign: 'center', color: theme.textMuted }}>
            <i className="ri-table-2" style={{ fontSize: 48, color: theme.textDim, marginBottom: 16, display: 'block' }} />
            <div style={{ fontSize: 16, fontWeight: 600 }}>Table View</div>
            <div style={{ fontSize: 14, color: theme.textDim, marginTop: 8 }}>Content coming soon</div>
          </div>
        </div>
      </div>
    </div>
  )
}

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

export default TableViewDashboard
