'use client'

import { useEffect, useMemo, useState } from 'react'

export type AnalysisTheme = {
  isDark: boolean
  text: string
  textSecondary: string
  textMuted: string
  textDim: string
  border: string
  panelBg: string
  tabBg: string
  tabInactive: string
  tabActiveText: string
  hoverBg: string
  selectedBg: string
  selectedBorder: string
  badgeBg: string
  inputText: string
  statValue: string
  avgGreen: string
  tableHeader: string
  tableCell: string
  tableBorder: string
  phasorGrid: string
  phasorCenter: string
  chart: {
    tooltipBg: string
    tooltipBorder: string
    textMain: string
    textMuted: string
    axisLine: string
    gridLine: string
    border: string
    zoomTrack: string
  }
}

function readCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function buildTheme(isDark: boolean): AnalysisTheme {
  const text = readCssVar('--default-text-color', isDark ? 'rgba(255, 255, 255, 0.85)' : '#011a42')
  const textMuted = readCssVar('--text-muted', isDark ? 'rgba(255, 255, 255, 0.5)' : '#5d6576')
  const border = readCssVar('--default-border', isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8ee')
  const panelBg = readCssVar('--custom-white', isDark ? 'rgb(22, 22, 35)' : '#ffffff')

  return {
    isDark,
    text,
    textSecondary: isDark ? '#cbd5e1' : '#334155',
    textMuted,
    textDim: isDark ? '#6b7280' : '#64748b',
    border,
    panelBg,
    tabBg: isDark ? '#1a1f2e' : '#f1f5f9',
    tabInactive: isDark ? '#9ca3af' : '#64748b',
    tabActiveText: isDark ? '#052e16' : '#14532d',
    hoverBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    selectedBg: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.1)',
    selectedBorder: isDark ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.35)',
    badgeBg: isDark ? '#1e2433' : '#f1f5f9',
    inputText: text,
    statValue: text,
    avgGreen: isDark ? '#a3e635' : '#65a30d',
    tableHeader: isDark ? '#8899aa' : '#64748b',
    tableCell: isDark ? '#e2e8f0' : '#334155',
    tableBorder: border,
    phasorGrid: isDark ? '#2d3748' : '#e2e8ee',
    phasorCenter: isDark ? '#e2e8f0' : '#334155',
    chart: {
      tooltipBg: isDark ? '#1a1f2e' : '#ffffff',
      tooltipBorder: border,
      textMain: text,
      textMuted: isDark ? '#9ca3af' : '#64748b',
      axisLine: isDark ? '#4b5563' : '#cbd5e1',
      gridLine: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E1E1E1',
      border,
      zoomTrack: isDark ? '#1e2433' : '#e2e8f0',
    },
  }
}

function readIsDark(): boolean {
  if (typeof window === 'undefined') return false
  return document.documentElement.getAttribute('data-theme-mode') === 'dark'
}

export function useAnalysisTheme(): AnalysisTheme {
  const [isDark, setIsDark] = useState(readIsDark)

  useEffect(() => {
    const sync = () => {
      setIsDark(document.documentElement.getAttribute('data-theme-mode') === 'dark')
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme-mode'],
    })
    return () => observer.disconnect()
  }, [])

  return useMemo(() => buildTheme(isDark), [isDark])
}

export function statusBadge(
  status: string | undefined,
  isDark: boolean
): { label: string; bg: string; color: string } | null {
  if (!status) return null
  const key = status.toLowerCase()
  const map: Record<string, { label: string; color: string; bgDark: string; bgLight: string }> = {
    online: { label: 'ONLINE', color: '#22c55e', bgDark: '#052e16', bgLight: '#dcfce7' },
    offline: { label: 'OFFLINE', color: '#6b7280', bgDark: '#1f2937', bgLight: '#f1f5f9' },
    warning: { label: 'WARNING', color: '#f59e0b', bgDark: '#422006', bgLight: '#fef3c7' },
    idle: { label: 'IDLE', color: '#60a5fa', bgDark: '#1e3a5f', bgLight: '#dbeafe' },
  }
  const item = map[key]
  if (!item) return null
  return { label: item.label, color: item.color, bg: isDark ? item.bgDark : item.bgLight }
}
