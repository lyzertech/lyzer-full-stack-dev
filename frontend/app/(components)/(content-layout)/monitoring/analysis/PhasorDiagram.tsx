'use client'

import React, { useEffect, useRef } from 'react'
import { useAnalysisTheme } from './useAnalysisTheme'

interface Props {
  l1Angle?: number
  l2Angle?: number
  l3Angle?: number
  l1Mag?: number
  l2Mag?: number
  l3Mag?: number
  i1Angle?: number
  i2Angle?: number
  i3Angle?: number
  i1Mag?: number
  i2Mag?: number
  i3Mag?: number
}

const PhasorDiagram: React.FC<Props> = ({
  l1Angle = 0, l2Angle = -120, l3Angle = 120,
  l1Mag = 232, l2Mag = 234, l3Mag = 230,
  i1Angle = 0, i2Angle = -120, i3Angle = 120,
  i1Mag = 0, i2Mag = 0, i3Mag = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useAnalysisTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2
    const R = Math.min(W, H) / 2 - 16
    const gridColor = theme.phasorGrid

    ctx.clearRect(0, 0, W, H)

    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1
    for (let r = R / 3; r <= R; r += R / 3) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(cx - R - 8, cy)
    ctx.lineTo(cx + R + 8, cy)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx, cy - R - 8)
    ctx.lineTo(cx, cy + R + 8)
    ctx.stroke()

    const maxMag = Math.max(l1Mag, l2Mag, l3Mag)
    const effectiveMaxMag = maxMag === 0 ? 1 : maxMag
    const maxIMag = Math.max(i1Mag, i2Mag, i3Mag)
    const effectiveMaxIMag = maxIMag === 0 ? 1 : maxIMag

    const drawPhasor = (
      angleDeg: number,
      mag: number,
      maxM: number,
      color: string,
      label: string,
      isCurrent: boolean
    ) => {
      const rad = ((angleDeg - 90) * Math.PI) / 180
      const len = (mag / maxM) * R
      const ex = cx + len * Math.cos(rad)
      const ey = cy + len * Math.sin(rad)

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(ex, ey)
      ctx.strokeStyle = color
      ctx.lineWidth = isCurrent ? 1.5 : 2.5
      ctx.setLineDash(isCurrent ? [4, 4] : [])
      ctx.stroke()
      ctx.setLineDash([])

      const headLen = isCurrent ? 6 : 8
      const angle = Math.atan2(ey - cy, ex - cx)
      ctx.beginPath()
      ctx.moveTo(ex, ey)
      ctx.lineTo(ex - headLen * Math.cos(angle - 0.4), ey - headLen * Math.sin(angle - 0.4))
      ctx.lineTo(ex - headLen * Math.cos(angle + 0.4), ey - headLen * Math.sin(angle + 0.4))
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()

      const lx = cx + (len + 12) * Math.cos(rad)
      const ly = cy + (len + 12) * Math.sin(rad)
      ctx.fillStyle = color
      ctx.font = isCurrent ? '11px monospace' : 'bold 13px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, lx, ly)
    }

    drawPhasor(l1Angle, l1Mag, effectiveMaxMag, '#ef4444', 'V1', false)
    drawPhasor(l2Angle, l2Mag, effectiveMaxMag, '#eab308', 'V2', false)
    drawPhasor(l3Angle, l3Mag, effectiveMaxMag, '#3b82f6', 'V3', false)

    if (i1Mag > 0 || i2Mag > 0 || i3Mag > 0) {
      drawPhasor(i1Angle, i1Mag, effectiveMaxIMag, '#ef4444', 'I1', true)
      drawPhasor(i2Angle, i2Mag, effectiveMaxIMag, '#eab308', 'I2', true)
      drawPhasor(i3Angle, i3Mag, effectiveMaxIMag, '#3b82f6', 'I3', true)
    }

    ctx.beginPath()
    ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx.fillStyle = theme.phasorCenter
    ctx.fill()
  }, [
    l1Angle, l2Angle, l3Angle, l1Mag, l2Mag, l3Mag,
    i1Angle, i2Angle, i3Angle, i1Mag, i2Mag, i3Mag,
    theme.phasorGrid, theme.phasorCenter,
  ])

  return <canvas ref={canvasRef} width={200} height={200} style={{ width: '100%', height: '100%' }} />
}

export default PhasorDiagram
