'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Form, Modal, Row, Col, Badge } from 'react-bootstrap'
import { apiClient } from '@/lib/api-client'

// Types
interface ElectricalNode {
  id: string
  name: string
  type: 'feeder' | 'transformer' | 'breaker' | 'switchboard' | 'panel' | 'powermeter'
  parentId: string | null
  children: ElectricalNode[]
  data?: {
    voltage?: string
    current?: string
    power?: string
    frequency?: string
    powerFactor?: string
  }
  position?: { x: number; y: number }
  status?: 'online' | 'offline' | 'warning' | 'idle' | string
  meta?: any
}

// Helper function to format metrics from API or return zeros if no data
const formatMetrics = (metrics: any) => {
  if (!metrics) {
    // Return zeros when no metrics available
    return {
      voltage: '0.00',
      current: '0.00',
      power: '0.00',
      frequency: '0.00',
      powerFactor: '0.00',
    }
  }
  
  return {
    voltage: metrics.voltage?.toFixed(2) || '0.00',
    current: metrics.current?.toFixed(2) || '0.00',
    power: metrics.power?.toFixed(2) || '0.00',
    frequency: metrics.frequency?.toFixed(2) || '0.00',
    powerFactor: metrics.powerFactor?.toFixed(2) || '0.00',
  }
}

// Transform device tree API data to ElectricalNode format
function transformDeviceTreeToElectricalNodes(apiData: any[]): ElectricalNode[] {
  const result: ElectricalNode[] = []
  
  apiData.forEach((org, orgIndex) => {
    // Organization level → Feeder (main power source)
    const orgNode: ElectricalNode = {
      id: `org-${org.id}`,
      name: org.name || `Organization ${orgIndex + 1}`,
      type: 'feeder',
      parentId: null,
      children: [],
      data: formatMetrics(null), // Org level has no real device, show zeros
      status: 'online',
      meta: { orgId: org.id, orgName: org.name }
    }
    
    const facilities = org.facilities || []
    facilities.forEach((facility: any) => {
      const devices = facility.devices || []
      
      if (devices.length === 0) return
      
      // Find device with device_type = 'Incoming' to promote to facility level
      const incomingDevice = devices.find((d: any) => 
        d.device_type?.toLowerCase() === 'incoming'
      )
      
      if (incomingDevice) {
        // PROMOTED DEVICE: Incoming device becomes facility level (parent)
        const facilityNode: ElectricalNode = {
          id: `dev-${incomingDevice.id}`,
          name: incomingDevice.name || incomingDevice.device_code || `Incoming ${incomingDevice.id}`,
          type: 'switchboard', // Visual representation as switchboard
          parentId: orgNode.id,
          children: [],
          data: formatMetrics(incomingDevice.latest_metrics),
          status: incomingDevice.status?.toLowerCase() || 'offline',
          meta: {
            deviceId: incomingDevice.id,
            deviceCode: incomingDevice.device_code,
            deviceName: incomingDevice.name,
            model: incomingDevice.model,
            ip: incomingDevice.ip_address,
            port: incomingDevice.port,
            deviceType: incomingDevice.device_type,
            brand: incomingDevice.brand,
            isPromoted: true, // Flag to indicate this is a promoted device
            originalFacility: facility.name,
            hasRealMetrics: !!incomingDevice.latest_metrics
          }
        }
        
        // OTHER DEVICES: Become children of the promoted incoming device
        devices
          .filter((d: any) => d.id !== incomingDevice.id)
          .forEach((device: any) => {
            const deviceNode: ElectricalNode = {
              id: `dev-${device.id}`,
              name: device.name || device.device_code || `Device ${device.id}`,
              type: 'powermeter',
              parentId: facilityNode.id,
              children: [],
              data: formatMetrics(device.latest_metrics),
              status: device.status?.toLowerCase() || 'offline',
              meta: {
                deviceId: device.id,
                deviceCode: device.device_code,
                deviceName: device.name,
                model: device.model,
                ip: device.ip_address,
                port: device.port,
                deviceType: device.device_type,
                brand: device.brand,
                hasRealMetrics: !!device.latest_metrics
              }
            }
            
            facilityNode.children.push(deviceNode)
          })
        
        orgNode.children.push(facilityNode)
      } else {
        // NO INCOMING DEVICE: Use traditional facility structure
        const facilityNode: ElectricalNode = {
          id: `fac-${facility.id}`,
          name: facility.name || `Facility ${facility.id}`,
          type: 'switchboard',
          parentId: orgNode.id,
          children: [],
          data: formatMetrics(null), // Facility node has no real device, show zeros
          status: 'online',
          meta: { facilityId: facility.id, facilityName: facility.name }
        }
        
        // All devices become children of facility
        devices.forEach((device: any) => {
          const deviceNode: ElectricalNode = {
            id: `dev-${device.id}`,
            name: device.name || device.device_code || `Device ${device.id}`,
            type: 'powermeter',
            parentId: facilityNode.id,
            children: [],
            data: formatMetrics(device.latest_metrics),
            status: device.status?.toLowerCase() || 'offline',
            meta: {
              deviceId: device.id,
              deviceCode: device.device_code,
              deviceName: device.name,
              model: device.model,
              ip: device.ip_address,
              port: device.port,
              deviceType: device.device_type,
              brand: device.brand,
              hasRealMetrics: !!device.latest_metrics
            }
          }
          
          facilityNode.children.push(deviceNode)
        })
        
        orgNode.children.push(facilityNode)
      }
    })
    
    result.push(orgNode)
  })
  
  return result
}

// Visual Components
interface DataDisplayProps {
  x: number
  y: number
  data?: {
    voltage?: string
    current?: string
    power?: string
    frequency?: string
    powerFactor?: string
  }
}

const DataDisplay: React.FC<DataDisplayProps> = ({ x, y, data }) => {
  if (!data) return null

  return (
    <g transform={`translate(${x}, ${y})`}>
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5"/>
        </filter>
      </defs>
      <rect
        x="-40"
        y="-38"
        width="80"
        height="76"
        fill="rgba(10, 15, 30, 0.95)"
        stroke="#00d4ff"
        strokeWidth="1.5"
        rx="6"
        filter="url(#shadow)"
      />
      <rect
        x="-38"
        y="-36"
        width="76"
        height="20"
        fill="rgba(0, 212, 255, 0.2)"
        rx="4"
      />
      <text x="0" y="-22" textAnchor="middle" fill="#00d4ff" fontSize="10" fontWeight="bold">
        METRICS
      </text>
      <text x="0" y="-6" textAnchor="middle" fill="#00ff88" fontSize="10" fontWeight="600">
        V: {data.voltage}V
      </text>
      <text x="0" y="6" textAnchor="middle" fill="#ffaa00" fontSize="10" fontWeight="600">
        I: {data.current}A
      </text>
      <text x="0" y="18" textAnchor="middle" fill="#ff6b6b" fontSize="10" fontWeight="600">
        P: {data.power}kW
      </text>
      <text x="0" y="30" textAnchor="middle" fill="#a0a0a0" fontSize="9">
        {data.frequency}Hz | PF:{data.powerFactor}
      </text>
    </g>
  )
}

interface NodeComponentProps {
  node: ElectricalNode
  x: number
  y: number
}

const NodeComponent: React.FC<NodeComponentProps> = ({ node, x, y }) => {
  const getNodeColor = () => {
    switch (node.type) {
      case 'feeder': return '#ff4444'
      case 'transformer': return '#ff8800'
      case 'breaker': return '#00aaff'
      case 'switchboard': return '#00ff88'
      case 'panel': return '#ffaa00'
      default: return '#888'
    }
  }

  const renderByType = () => {
    const color = getNodeColor()
    
    switch (node.type) {
      case 'feeder':
        return (
          <>
            <defs>
              <linearGradient id={`grad-${node.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="100%" stopColor={color} stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <line x1="0" y1="-10" x2="0" y2="25" stroke={color} strokeWidth="4" />
            <circle cx="0" cy="-10" r="8" fill={`url(#grad-${node.id})`} stroke={color} strokeWidth="2" />
            <line x1="-6" y1="-13" x2="0" y2="-7" stroke="#fff" strokeWidth="1.5" />
            <line x1="0" y1="-13" x2="6" y2="-7" stroke="#fff" strokeWidth="1.5" />
          </>
        )
      case 'transformer':
        return (
          <>
            <circle cx="0" cy="0" r="18" fill="rgba(255, 136, 0, 0.1)" stroke={color} strokeWidth="2.5" />
            <circle cx="0" cy="0" r="12" fill="none" stroke={color} strokeWidth="2.5" />
            <circle cx="0" cy="0" r="6" fill="none" stroke={color} strokeWidth="2" />
            <path d="M -8,-8 L 8,8 M -8,8 L 8,-8" stroke={color} strokeWidth="1.5" opacity="0.6" />
          </>
        )
      case 'breaker':
        return (
          <>
            <rect 
              x="-10" y="-18" width="20" height="36" 
              fill="rgba(0, 170, 255, 0.2)" 
              stroke={color} 
              strokeWidth="2.5" 
              rx="4" 
            />
            <rect 
              x="-6" y="-12" width="12" height="8" 
              fill={color} 
              opacity="0.8" 
              rx="2" 
            />
            <rect 
              x="-6" y="4" width="12" height="8" 
              fill={color} 
              opacity="0.8" 
              rx="2" 
            />
            <line x1="0" y1="-4" x2="0" y2="4" stroke={color} strokeWidth="2" />
          </>
        )
      case 'switchboard':
        return (
          <>
            <rect 
              x="-25" y="-18" width="50" height="36" 
              fill="rgba(0, 255, 136, 0.15)" 
              stroke={color} 
              strokeWidth="2" 
              rx="4" 
            />
            <rect 
              x="-22" y="-15" width="44" height="12" 
              fill="rgba(0, 255, 136, 0.3)" 
              stroke={color} 
              strokeWidth="1" 
              rx="2" 
            />
            {[-15, -5, 5, 15].map((xPos, i) => (
              <g key={i}>
                <line x1={xPos} y1="-3" x2={xPos} y2="12" stroke={color} strokeWidth="2" />
                <circle cx={xPos} cy="10" r="2" fill={color} />
              </g>
            ))}
          </>
        )
      case 'panel':
        return (
          <>
            <rect 
              x="-18" y="-15" width="36" height="30" 
              fill="rgba(255, 170, 0, 0.2)" 
              stroke={color} 
              strokeWidth="2.5" 
              rx="3" 
            />
            <rect 
              x="-15" y="-12" width="30" height="6" 
              fill={color} 
              opacity="0.6" 
              rx="1" 
            />
            {[0, 8, 16].map((yPos, i) => (
              <rect 
                key={i}
                x="-12" y={-4 + yPos} width="24" height="4" 
                fill={color} 
                opacity="0.4" 
                rx="1" 
              />
            ))}
          </>
        )
      case 'powermeter':
        return (
          <>
            <defs>
              <linearGradient id={`meter-grad-${node.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Main meter body */}
            <rect 
              x="-20" y="-22" width="40" height="44" 
              fill="rgba(157, 78, 221, 0.15)" 
              stroke={color} 
              strokeWidth="2.5" 
              rx="4" 
            />
            {/* Display screen */}
            <rect 
              x="-16" y="-18" width="32" height="12" 
              fill="rgba(0, 20, 40, 0.9)" 
              stroke={color} 
              strokeWidth="1.5" 
              rx="2" 
            />
            {/* Display content - digital numbers */}
            <text 
              x="0" y="-9" 
              textAnchor="middle" 
              fill="#00ff88" 
              fontSize="8" 
              fontWeight="bold"
              fontFamily="monospace"
            >
              888.8
            </text>
            {/* Connection terminals at bottom */}
            <rect 
              x="-14" y="12" width="8" height="6" 
              fill={color} 
              opacity="0.8" 
              rx="1" 
            />
            <rect 
              x="-2" y="12" width="8" height="6" 
              fill={color} 
              opacity="0.8" 
              rx="1" 
            />
            <rect 
              x="8" y="12" width="8" height="6" 
              fill={color} 
              opacity="0.8" 
              rx="1" 
            />
            {/* Status indicators */}
            <circle cx="-8" cy="2" r="2" fill="#00ff88" opacity="0.8" />
            <circle cx="0" cy="2" r="2" fill="#ffaa00" opacity="0.6" />
            <circle cx="8" cy="2" r="2" fill="#ff4444" opacity="0.4" />
            {/* Meter label */}
            <rect 
              x="-12" y="6" width="24" height="4" 
              fill="rgba(255, 255, 255, 0.1)" 
              rx="1" 
            />
            <text 
              x="0" y="9" 
              textAnchor="middle" 
              fill={color} 
              fontSize="6" 
              fontWeight="bold"
            >
              kWh
            </text>
          </>
        )
      default:
        return <circle cx="0" cy="0" r="10" fill="none" stroke={color} strokeWidth="2" />
    }
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
      {renderByType()}
      <text 
        x="0" 
        y="45" 
        textAnchor="middle" 
        fill="#fff" 
        fontSize="12" 
        fontWeight="bold"
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
      >
        {node.name}
      </text>
      <text 
        x="0" 
        y="58" 
        textAnchor="middle" 
        fill="#888" 
        fontSize="10"
      >
        {node.type}
      </text>
    </g>
  )
}

// Main SLD Renderer
interface SLDRendererProps {
  nodes: ElectricalNode[]
}

const SLDRenderer: React.FC<SLDRendererProps> = ({ nodes }) => {
  const [positionedNodes, setPositionedNodes] = useState<ElectricalNode[]>([])

  useEffect(() => {
    // Calculate positions - preserve parent-child vertical alignment
    const calculatePositions = () => {
      const positioned: ElectricalNode[] = []
      const nodeSpacing = 225 // Horizontal spacing between nodes (reduced to 3/4)
      const levelHeight = 200 // Vertical spacing between levels
      const startY = 120
      const startX = 250

      // Calculate the width needed for each organization (max descendants at any level)
      const calculateOrgWidth = (org: ElectricalNode): number => {
        let maxWidth = 1 // At minimum, the org itself takes 1 column
        
        if (org.children && org.children.length > 0) {
          // Calculate width for each facility
          const facilityWidths = org.children.map(facility => {
            if (facility.children && facility.children.length > 0) {
              return facility.children.length // Number of devices
            }
            return 1 // Facility with no devices still takes 1 column
          })
          maxWidth = Math.max(maxWidth, ...facilityWidths, org.children.length)
        }
        
        return maxWidth
      }

      // Assign column ranges to each org
      let currentColumn = 0
      const orgColumnRanges: { startCol: number; width: number; org: ElectricalNode }[] = []
      
      nodes.forEach(org => {
        const width = calculateOrgWidth(org)
        orgColumnRanges.push({
          startCol: currentColumn,
          width: width,
          org: org
        })
        currentColumn += width
      })

      // Position nodes within their assigned column ranges
      orgColumnRanges.forEach((orgRange, orgIndex) => {
        const org = orgRange.org
        const orgCenterCol = orgRange.startCol + (orgRange.width / 2) - 0.5
        
        // Position organization at center of its zone
        const orgNode: ElectricalNode = {
          ...org,
          position: {
            x: startX + orgCenterCol * nodeSpacing,
            y: startY
          }
        }
        positioned.push(orgNode)

        // Position facilities (level 1)
        if (org.children && org.children.length > 0) {
          org.children.forEach((facility, facIndex) => {
            let facilityX: number
            
            if (org.children.length === 1) {
              // Single facility: center it in org's zone
              facilityX = startX + orgCenterCol * nodeSpacing
            } else {
              // Multiple facilities: distribute across org's zone
              const facSpacing = orgRange.width / org.children.length
              facilityX = startX + (orgRange.startCol + facIndex * facSpacing + facSpacing / 2) * nodeSpacing
            }

            const facilityNode: ElectricalNode = {
              ...facility,
              position: {
                x: facilityX,
                y: startY + levelHeight
              }
            }
            positioned.push(facilityNode)

            // Position devices (level 2)
            if (facility.children && facility.children.length > 0) {
              facility.children.forEach((device, devIndex) => {
                let deviceX: number
                
                if (facility.children.length === 1) {
                  // Single device: align with facility
                  deviceX = facilityX
                } else {
                  // Multiple devices: distribute around facility
                  const devicesPerFacility = facility.children.length
                  const deviceSpacing = (orgRange.width / org.children.length) / devicesPerFacility
                  const facilityStartCol = orgRange.startCol + facIndex * (orgRange.width / org.children.length)
                  deviceX = startX + (facilityStartCol + devIndex * deviceSpacing + deviceSpacing / 2) * nodeSpacing
                }

                const deviceNode: ElectricalNode = {
                  ...device,
                  position: {
                    x: deviceX,
                    y: startY + levelHeight * 2
                  }
                }
                positioned.push(deviceNode)
              })
            }
          })
        }
      })

      setPositionedNodes(positioned)
    }

    calculatePositions()
  }, [nodes])

  const renderConnections = () => {
    const connections: React.ReactElement[] = []
    
    // Create a map for quick node lookup by ID
    const nodeMap = new Map<string, ElectricalNode>()
    positionedNodes.forEach((node) => {
      nodeMap.set(node.id, node)
    })

    positionedNodes.forEach((node) => {
      if (node.children.length > 0) {
        node.children.forEach((child, childIndex) => {
          const childNode = nodeMap.get(child.id)
          if (childNode && node.position && childNode.position) {
            const startX = node.position.x
            const startY = node.position.y + 30
            const endX = childNode.position.x
            const endY = childNode.position.y - 40
            
            // Calculate midpoint for connection
            const midY = startY + (endY - startY) / 2
            
            // Vertical line from parent down
            connections.push(
              <line
                key={`${node.id}-${child.id}-v1`}
                x1={startX}
                y1={startY}
                x2={startX}
                y2={midY - 30}
                stroke="#ff3333"
                strokeWidth="2.5"
              />
            )
            
            // Horizontal line to child X position
            connections.push(
              <line
                key={`${node.id}-${child.id}-h`}
                x1={startX}
                y1={midY - 30}
                x2={endX}
                y2={midY - 30}
                stroke="#ff3333"
                strokeWidth="2.5"
              />
            )
            
            // Connection points (circles at corners)
            connections.push(
              <circle
                key={`${node.id}-${child.id}-c1`}
                cx={startX}
                cy={midY - 30}
                r="4"
                fill="#ff3333"
              />
            )
            connections.push(
              <circle
                key={`${node.id}-${child.id}-c2`}
                cx={endX}
                cy={midY - 30}
                r="4"
                fill="#ff3333"
              />
            )
            
            // Vertical line down to breaker
            connections.push(
              <line
                key={`${node.id}-${child.id}-v2`}
                x1={endX}
                y1={midY - 30}
                x2={endX}
                y2={midY - 10}
                stroke="#ff3333"
                strokeWidth="2.5"
              />
            )
            
            // Circuit Breaker symbol
            connections.push(
              <g key={`${node.id}-${child.id}-breaker`} transform={`translate(${endX}, ${midY + 10})`}>
                {/* Line segment from top to fixed contact */}
                <line 
                  x1="0" 
                  y1="-20" 
                  x2="0" 
                  y2="-8" 
                  stroke="#ff3333" 
                  strokeWidth="3" 
                />
                
                {/* Fixed contact (bottom) */}
                <circle 
                  cx="0" 
                  cy="-6" 
                  r="2" 
                  fill="#ff3333"
                />
                
                {/* Moveable contact arm (angled away) */}
                <line 
                  x1="0" 
                  y1="8" 
                  x2="10" 
                  y2="-2" 
                  stroke="#ff3333" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
                
                {/* Moveable contact point */}
                <circle 
                  cx="10" 
                  cy="-2" 
                  r="2" 
                  fill="#ff3333"
                />
                
                {/* Line segment from moveable contact to bottom */}
                <line 
                  x1="0" 
                  y1="8" 
                  x2="0" 
                  y2="20" 
                  stroke="#ff3333" 
                  strokeWidth="3" 
                />
                
                {/* Contact gap indicator (small arc) */}
                <path 
                  d="M 2,-4 Q 6,0 10,-2" 
                  fill="none" 
                  stroke="#ff3333" 
                  strokeWidth="1" 
                  strokeDasharray="2,1"
                  opacity="0.6"
                />
                
                {/* Breaker label */}
                <text 
                  x="15" 
                  y="3" 
                  fill="#ff3333" 
                  fontSize="9"
                  fontWeight="bold"
                >
                  CB-{childIndex + 1}
                </text>
              </g>
            )
            
            // Vertical line from breaker to child
            connections.push(
              <line
                key={`${node.id}-${child.id}-v3`}
                x1={endX}
                y1={midY + 30}
                x2={endX}
                y2={endY}
                stroke="#ff3333"
                strokeWidth="2.5"
              />
            )
          }
        })
      }
    })

    return connections
  }

  if (positionedNodes.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 50px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        border: '2px dashed rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
        <h4 style={{ color: '#fff', marginBottom: '10px' }}>Belum ada diagram</h4>
        <p style={{ color: '#888' }}>Silakan tunggu data dimuat dari device tree.</p>
      </div>
    )
  }

  // Calculate SVG dimensions based on actual positioned nodes
  const maxX = Math.max(...positionedNodes.map(n => n.position?.x || 0))
  const maxY = Math.max(...positionedNodes.map(n => n.position?.y || 0))
  const svgWidth = Math.max(1600, maxX + 400) // Add padding
  const svgHeight = Math.max(800, maxY + 300) // Add padding

  return (
    <div 
      className="sld-scroll-container"
      style={{ 
        width: '100%', 
        height: '700px', 
        overflow: 'auto', 
        background: 'linear-gradient(135deg, rgba(10, 15, 30, 0.8), rgba(20, 25, 40, 0.8))',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      <style>{`
        /* Custom scrollbar styling for better visibility */
        .sld-scroll-container::-webkit-scrollbar {
          width: 14px;
          height: 14px;
        }
        .sld-scroll-container::-webkit-scrollbar-track {
          background: rgba(20, 25, 40, 0.95);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .sld-scroll-container::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          border: 2px solid rgba(20, 25, 40, 0.95);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
        }
        .sld-scroll-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #7c8ff0 0%, #8a5bb0 100%);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6);
          cursor: pointer;
        }
        .sld-scroll-container::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
        }
        .sld-scroll-container::-webkit-scrollbar-corner {
          background: rgba(20, 25, 40, 0.95);
        }
      `}</style>
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ 
          background: 'transparent',
          minWidth: `${svgWidth}px`
        }}
      >
        {/* Background Grid Pattern */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path 
              d="M 50 0 L 0 0 0 50" 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.03)" 
              strokeWidth="1"
            />
          </pattern>
          <pattern id="grid-large" width="200" height="200" patternUnits="userSpaceOnUse">
            <path 
              d="M 200 0 L 0 0 0 200" 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.06)" 
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        
        {/* Apply grid backgrounds */}
        <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />
        <rect width={svgWidth} height={svgHeight} fill="url(#grid-large)" />
        
        {/* Title with background */}
        <rect
          x={svgWidth / 2 - 250}
          y="20"
          width="500"
          height="60"
          fill="rgba(102, 126, 234, 0.15)"
          stroke="rgba(102, 126, 234, 0.5)"
          strokeWidth="2"
          rx="8"
        />
        <text 
          x={svgWidth / 2} 
          y="48" 
          textAnchor="middle" 
          fill="#fff" 
          fontSize="24" 
          fontWeight="bold"
          style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
        >
          Single Line Diagram
        </text>
        <text 
          x={svgWidth / 2} 
          y="65" 
          textAnchor="middle" 
          fill="#888" 
          fontSize="12"
        >
          Dynamic Electrical Distribution View
        </text>

        {/* Render connections */}
        {renderConnections()}

        {/* Render nodes */}
        {positionedNodes.map((node) => (
          <g key={node.id}>
            {node.position && <NodeComponent node={node} x={node.position.x} y={node.position.y} />}
            {node.position && node.data && (
              <>
                {/* Connection line from node to metrics - much shorter distance */}
                <line
                  x1={node.position.x + 10}
                  y1={node.position.y}
                  x2={node.position.x + 30}
                  y2={node.position.y}
                  stroke="#00d4ff"
                  strokeWidth="2"
                  strokeDasharray="2,1"
                  opacity="0.8"
                />
                {/* Connection point on node */}
                <circle
                  cx={node.position.x + 10}
                  cy={node.position.y}
                  r="2"
                  fill="#00d4ff"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
                {/* Connection point on metrics box */}
                <circle
                  cx={node.position.x + 10}
                  cy={node.position.y}
                  r="2"
                  fill="#00d4ff"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
                {/* Metrics box positioned much closer */}
                <DataDisplay x={node.position.x + 70} y={node.position.y - 8} data={node.data} />
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

// Main Component
const SingleLineView: React.FC = () => {
  const [treeData, setTreeData] = useState<ElectricalNode[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch device tree from API
  const fetchDeviceTree = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/monitoring/device-tree')
      const apiData = Array.isArray(response.data) ? response.data : []
      const transformedData = transformDeviceTreeToElectricalNodes(apiData)
      setTreeData(transformedData)
    } catch (e: any) {
      setError(e.message || 'Failed to load device tree')
      console.error('Error fetching device tree:', e)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchDeviceTree()
  }, [])

  // Note: Removed auto-refresh interval. Use manual refresh button to update real-time metrics.

  return (
    <div className="row">
      <div className="col-xl-12">
        {loading ? (
          <Card 
            className="custom-card" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.95), rgba(30, 35, 50, 0.95))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Card.Body style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'spin 1s linear infinite' }}>⚡</div>
              <h5 style={{ color: '#fff', marginBottom: '10px' }}>Loading Device Tree...</h5>
              <p style={{ color: '#888', fontSize: '14px' }}>Fetching organization, facility, and device data</p>
              <style jsx>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </Card.Body>
          </Card>
        ) : error ? (
          <Card 
            className="custom-card" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.95), rgba(30, 35, 50, 0.95))',
              border: '1px solid rgba(255, 68, 68, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Card.Body style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
              <h5 style={{ color: '#ff4444', marginBottom: '10px' }}>Error Loading Data</h5>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>{error}</p>
              <Button 
                variant="outline-light"
                onClick={fetchDeviceTree}
                style={{ padding: '10px 30px', fontWeight: '600' }}
              >
                🔄 Retry
              </Button>
            </Card.Body>
          </Card>
        ) : treeData.length === 0 ? (
          <Card 
            className="custom-card" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.95), rgba(30, 35, 50, 0.95))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Card.Body style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
              <h5 style={{ color: '#fff', marginBottom: '10px' }}>No Data Available</h5>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
                No organizations, facilities, or devices found in the system
              </p>
              <Button 
                variant="outline-light"
                onClick={fetchDeviceTree}
                style={{ padding: '10px 30px', fontWeight: '600' }}
              >
                🔄 Refresh
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            <Card 
              className="custom-card mb-3" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.95), rgba(30, 35, 50, 0.95))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Card.Body style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <Button 
                    variant="outline-light"
                    onClick={fetchDeviceTree}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 24px',
                      fontWeight: '600',
                      borderWidth: '2px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>🔄</span>
                    <span>Refresh Data</span>
                  </Button>
                  <div style={{ 
                    flex: 1, 
                    height: '2px', 
                    background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.5), transparent)' 
                  }} />
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    padding: '8px 16px',
                    background: 'rgba(56, 239, 125, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 239, 125, 0.3)',
                  }}>
                    <div 
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        background: '#38ef7d',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite',
                      }} 
                    />
                    <span style={{ color: '#38ef7d', fontSize: '14px', fontWeight: '600' }}>
                      Live Data
                    </span>
                  </div>
                  <div style={{
                    padding: '8px 16px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                  }}>
                    <span style={{ color: '#667eea', fontSize: '14px', fontWeight: '600' }}>
                      {treeData.length} Org • {treeData.reduce((acc, org) => acc + (org.children?.length || 0), 0)} Facilities
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
            <Card 
              className="custom-card" 
              style={{ 
                background: 'transparent', 
                border: 'none' 
              }}
            >
              <Card.Body style={{ background: 'transparent', padding: '0' }}>
                <SLDRenderer nodes={treeData} />
              </Card.Body>
            </Card>
            <style jsx>{`
              @keyframes pulse {
                0%, 100% {
                  opacity: 1;
                }
                50% {
                  opacity: 0.5;
                }
              }
            `}</style>
          </>
        )}
      </div>
    </div>
  )
}

export default SingleLineView
