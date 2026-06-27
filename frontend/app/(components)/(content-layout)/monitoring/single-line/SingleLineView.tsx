'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Form, Modal, Row, Col, Badge } from 'react-bootstrap'

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
}

interface TreeBuilderProps {
  onSave: (tree: ElectricalNode[]) => void
  initialData?: ElectricalNode[]
}

// Dummy data generator
const generateElectricalData = () => ({
  voltage: (220 + Math.random() * 20).toFixed(1),
  current: (5 + Math.random() * 5).toFixed(1),
  power: (1 + Math.random() * 5).toFixed(1),
  frequency: (50 + Math.random() * 0.5).toFixed(2),
  powerFactor: (0.85 + Math.random() * 0.1).toFixed(2),
})

// Tree Builder Component
const TreeBuilder: React.FC<TreeBuilderProps> = ({ onSave, initialData = [] }) => {
  const [numParents, setNumParents] = useState<number>(2)
  const [showParentForm, setShowParentForm] = useState<boolean>(false)
  const [nodes, setNodes] = useState<ElectricalNode[]>(initialData)
  const [currentNode, setCurrentNode] = useState<ElectricalNode | null>(null)
  const [showChildModal, setShowChildModal] = useState<boolean>(false)
  const [childCount, setChildCount] = useState<number>(0)

  const nodeTypes = [
    { value: 'feeder', label: 'Feeder' },
    { value: 'transformer', label: 'Transformer' },
    { value: 'breaker', label: 'Circuit Breaker' },
    { value: 'switchboard', label: 'Switchboard' },
    { value: 'panel', label: 'Panel' },
    { value: 'powermeter', label: 'Power Meter' },
  ]

  const handleCreateParents = () => {
    setShowParentForm(true)
  }

  const handleAddParentNode = (index: number, name: string, type: string) => {
    const newNode: ElectricalNode = {
      id: `parent-${Date.now()}-${index}`,
      name: name || `Parent ${index + 1}`,
      type: type as any,
      parentId: null,
      children: [],
      data: generateElectricalData(),
    }
    setNodes((prev) => [...prev, newNode])
  }

  const handleAddChildren = (parentNode: ElectricalNode) => {
    setCurrentNode(parentNode)
    setShowChildModal(true)
  }

  const handleCreateChildren = () => {
    if (!currentNode) return

    const newChildren: ElectricalNode[] = []
    for (let i = 0; i < childCount; i++) {
      newChildren.push({
        id: `child-${Date.now()}-${i}`,
        name: `Child ${i + 1}`,
        type: 'powermeter',
        parentId: currentNode.id,
        children: [],
        data: generateElectricalData(),
      })
    }

    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === currentNode.id) {
          return { ...node, children: [...node.children, ...newChildren] }
        }
        return updateNodeChildren(node, currentNode.id, newChildren)
      })
    )

    setShowChildModal(false)
    setChildCount(0)
  }

  const updateNodeChildren = (
    node: ElectricalNode,
    targetId: string,
    newChildren: ElectricalNode[]
  ): ElectricalNode => {
    if (node.id === targetId) {
      return { ...node, children: [...node.children, ...newChildren] }
    }
    return {
      ...node,
      children: node.children.map((child) => updateNodeChildren(child, targetId, newChildren)),
    }
  }

  const handleUpdateNodeName = (nodeId: string, newName: string) => {
    setNodes((prev) => prev.map((node) => updateNodeName(node, nodeId, newName)))
  }

  const updateNodeName = (node: ElectricalNode, targetId: string, newName: string): ElectricalNode => {
    if (node.id === targetId) {
      return { ...node, name: newName }
    }
    return {
      ...node,
      children: node.children.map((child) => updateNodeName(child, targetId, newName)),
    }
  }

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== nodeId).map((node) => deleteNodeById(node, nodeId)))
  }

  const deleteNodeById = (node: ElectricalNode, targetId: string): ElectricalNode => {
    return {
      ...node,
      children: node.children.filter((child) => child.id !== targetId).map((child) => deleteNodeById(child, targetId)),
    }
  }

  const getAllNodes = (nodes: ElectricalNode[]): ElectricalNode[] => {
    let allNodes: ElectricalNode[] = []
    nodes.forEach((node) => {
      allNodes.push(node)
      if (node.children.length > 0) {
        allNodes = [...allNodes, ...getAllNodes(node.children)]
      }
    })
    return allNodes
  }

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      feeder: '#ff4444',
      transformer: '#ff8800',
      breaker: '#00aaff',
      switchboard: '#00ff88',
      panel: '#ffaa00',
      powermeter: '#9d4edd',
    }
    return colors[type] || '#888'
  }

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      feeder: '⚡',
      transformer: '🔄',
      breaker: '⚙️',
      switchboard: '📊',
      panel: '📋',
      powermeter: '🔌',
    }
    return icons[type] || '●'
  }

  const renderNodeTree = (node: ElectricalNode, level: number = 0) => {
    return (
      <div key={node.id} style={{ marginLeft: `${level * 25}px`, marginBottom: '12px' }}>
        <div
          style={{
            padding: '12px 15px',
            background: level === 0 
              ? 'linear-gradient(135deg, rgba(255, 68, 68, 0.1), rgba(255, 136, 0, 0.1))'
              : 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: `2px solid ${level === 0 ? getTypeColor(node.type) : 'rgba(255, 255, 255, 0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.3s ease',
            boxShadow: level === 0 ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
          }}
          className="node-item-hover"
        >
          <span style={{ fontSize: '20px' }}>{getTypeIcon(node.type)}</span>
          <Form.Control
            type="text"
            value={node.name}
            onChange={(e) => handleUpdateNodeName(node.id, e.target.value)}
            style={{ 
              width: '220px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontWeight: '500',
            }}
          />
          <Badge 
            bg="" 
            style={{ 
              background: getTypeColor(node.type),
              fontSize: '11px',
              padding: '5px 10px',
            }}
          >
            {node.type.toUpperCase()}
          </Badge>
          <Badge bg="secondary">{node.children.length} child</Badge>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <Button 
              size="sm" 
              variant="outline-success" 
              onClick={() => handleAddChildren(node)}
              style={{ fontSize: '12px' }}
            >
              + Child
            </Button>
            <Button 
              size="sm" 
              variant="outline-danger" 
              onClick={() => handleDeleteNode(node.id)}
              style={{ fontSize: '12px' }}
            >
              🗑️
            </Button>
          </div>
        </div>
        {node.children.map((child) => renderNodeTree(child, level + 1))}
      </div>
    )
  }

  return (
    <div>
      <style jsx>{`
        .node-item-hover:hover {
          transform: translateX(5px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
        }
        .custom-card-gradient {
          background: linear-gradient(135deg, rgba(20, 25, 40, 0.95), rgba(30, 35, 50, 0.95));
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .btn-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          transition: all 0.3s ease;
        }
        .btn-gradient-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        .btn-gradient-success {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          border: none;
          transition: all 0.3s ease;
        }
        .btn-gradient-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(56, 239, 125, 0.4);
        }
      `}</style>
      <Card className="custom-card custom-card-gradient mb-3">
        <Card.Header style={{ 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
          borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
        }}>
          <Card.Title style={{ fontSize: '20px', fontWeight: '600', color: '#fff' }}>
            🔧 Tree Structure Builder
          </Card.Title>
        </Card.Header>
        <Card.Body style={{ padding: '25px' }}>
          {nodes.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '2px dashed rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
              <h5 style={{ color: '#fff', marginBottom: '15px' }}>Mulai Buat Single Line Diagram</h5>
              <p style={{ color: '#888', marginBottom: '25px' }}>
                Tentukan jumlah parent nodes (feeder utama) untuk memulai
              </p>
              <Form.Group className="mb-3" style={{ maxWidth: '300px', margin: '0 auto 20px' }}>
                <Form.Label style={{ color: '#aaa', fontWeight: '500' }}>
                  Jumlah Parent Nodes (Feeder Utama)
                </Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="10"
                  value={numParents}
                  onChange={(e) => setNumParents(parseInt(e.target.value) || 1)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    fontSize: '18px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                />
              </Form.Group>
              <Button 
                className="btn-gradient-primary" 
                size="lg"
                onClick={handleCreateParents}
                style={{ padding: '12px 40px', fontSize: '16px', fontWeight: '600' }}
              >
                🚀 Buat Parent Nodes
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-4" style={{ 
                display: 'flex', 
                gap: '12px',
                padding: '15px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
              }}>
                <Button 
                  className="btn-gradient-success" 
                  onClick={() => onSave(nodes)}
                  style={{ flex: 1, padding: '12px', fontWeight: '600' }}
                >
                  ✨ Generate SLD
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setNodes([])}
                  style={{ padding: '12px 30px' }}
                >
                  🔄 Reset
                </Button>
              </div>
              <div style={{ 
                maxHeight: '500px', 
                overflowY: 'auto',
                padding: '10px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
              }}>
                {nodes.map((node) => renderNodeTree(node))}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal for creating parent nodes */}
      <Modal 
        show={showParentForm} 
        onHide={() => setShowParentForm(false)} 
        size="lg"
        centered
      >
        <Modal.Header 
          closeButton
          style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
            borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
          }}
        >
          <Modal.Title style={{ color: '#fff', fontWeight: '600' }}>
            ⚙️ Setup Parent Nodes
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'rgba(20, 25, 40, 0.95)', padding: '30px' }}>
          {Array.from({ length: numParents }, (_, i) => (
            <div 
              key={i} 
              style={{
                marginBottom: '20px',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h6 style={{ color: '#fff', marginBottom: '15px', fontSize: '14px' }}>
                🔌 Parent Node {i + 1}
              </h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-0">
                    <Form.Label style={{ color: '#aaa', fontSize: '13px' }}>Nama Parent</Form.Label>
                    <Form.Control 
                      type="text" 
                      id={`parent-name-${i}`} 
                      placeholder={`Feeder ${i + 1}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#fff',
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-0">
                    <Form.Label style={{ color: '#aaa', fontSize: '13px' }}>Type</Form.Label>
                    <Form.Select 
                      id={`parent-type-${i}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#fff',
                      }}
                    >
                      {nodeTypes.map((type) => (
                        <option key={type.value} value={type.value} style={{ background: '#1a1f30' }}>
                          {type.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer style={{ background: 'rgba(20, 25, 40, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowParentForm(false)}
          >
            Cancel
          </Button>
          <Button
            className="btn-gradient-primary"
            onClick={() => {
              for (let i = 0; i < numParents; i++) {
                const nameInput = document.getElementById(`parent-name-${i}`) as HTMLInputElement
                const typeSelect = document.getElementById(`parent-type-${i}`) as HTMLSelectElement
                handleAddParentNode(i, nameInput?.value || '', typeSelect?.value || 'feeder')
              }
              setShowParentForm(false)
            }}
          >
            ✨ Create Parents
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for adding children */}
      <Modal 
        show={showChildModal} 
        onHide={() => setShowChildModal(false)}
        centered
      >
        <Modal.Header 
          closeButton
          style={{
            background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.2), rgba(56, 239, 125, 0.2))',
            borderBottom: '2px solid rgba(56, 239, 125, 0.3)',
          }}
        >
          <Modal.Title style={{ color: '#fff', fontWeight: '600' }}>
            ➕ Add Children to {currentNode?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'rgba(20, 25, 40, 0.95)', padding: '30px' }}>
          <div style={{
            padding: '20px',
            background: 'rgba(56, 239, 125, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(56, 239, 125, 0.2)',
            marginBottom: '20px',
          }}>
            <p style={{ color: '#38ef7d', marginBottom: '5px', fontSize: '14px' }}>
              Parent: <strong>{currentNode?.name}</strong>
            </p>
            <p style={{ color: '#888', marginBottom: '0', fontSize: '12px' }}>
              Type: {currentNode?.type}
            </p>
          </div>
          <Form.Group>
            <Form.Label style={{ color: '#aaa', fontSize: '14px', fontWeight: '500' }}>
              Jumlah Child Nodes
            </Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="10"
              value={childCount}
              onChange={(e) => setChildCount(parseInt(e.target.value) || 0)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontSize: '16px',
                padding: '12px',
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ background: 'rgba(20, 25, 40, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowChildModal(false)}
          >
            Cancel
          </Button>
          <Button 
            className="btn-gradient-success"
            onClick={handleCreateChildren}
          >
            ✨ Create Children
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
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
    // Calculate positions for all nodes
    const calculatePositions = () => {
      const positioned: ElectricalNode[] = []
      const startY = 120
      const parentSpacing = 500 // Increased spacing between parents
      const childSpacing = 150 // Increased spacing between children
      const levelHeight = 180 // Increased vertical spacing

      nodes.forEach((parent, parentIndex) => {
        const parentX = 250 + parentIndex * parentSpacing
        const parentNode = {
          ...parent,
          position: { x: parentX, y: startY },
        }
        positioned.push(parentNode)

        // Position children recursively
        positionChildren(parent, parentX, startY + levelHeight, childSpacing, positioned, 1, levelHeight)
      })

      setPositionedNodes(positioned)
    }

    const positionChildren = (
      parent: ElectricalNode,
      parentX: number,
      currentY: number,
      spacing: number,
      positioned: ElectricalNode[],
      level: number,
      levelHeight: number
    ) => {
      const totalWidth = (parent.children.length - 1) * spacing
      const startX = parentX - totalWidth / 2

      parent.children.forEach((child, index) => {
        const childX = startX + index * spacing
        const childNode = {
          ...child,
          position: { x: childX, y: currentY },
        }
        positioned.push(childNode)

        if (child.children.length > 0) {
          positionChildren(child, childX, currentY + levelHeight, spacing * 0.8, positioned, level + 1, levelHeight)
        }
      })
    }

    calculatePositions()
  }, [nodes])

  const renderConnections = () => {
    const connections: React.ReactElement[] = []
    const allNodes = positionedNodes

    allNodes.forEach((node) => {
      if (node.children.length > 0) {
        node.children.forEach((child, childIndex) => {
          const childNode = allNodes.find((n) => n.id === child.id)
          if (childNode && node.position && childNode.position) {
            const startX = node.position.x
            const startY = node.position.y + 30
            const endX = childNode.position.x
            const endY = childNode.position.y - 40
            
            // Calculate midpoint for angular path
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
            
            // Horizontal line to align with child
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
            
            // Open contact circuit breaker in the line
            connections.push(
              <g key={`${node.id}-${child.id}-breaker`} transform={`translate(${endX}, ${midY + 10})`}>
                {/* Line segment before contact */}
                <line 
                  x1="0" 
                  y1="-10" 
                  x2="0" 
                  y2="-3" 
                  stroke="#ff3333" 
                  strokeWidth="2.5" 
                />
                {/* Line segment after contact */}
                <line 
                  x1="0" 
                  y1="3" 
                  x2="0" 
                  y2="10" 
                  stroke="#ff3333" 
                  strokeWidth="2.5" 
                />
                {/* Open contact position (angled away) */}
                <line 
                  x1="0" 
                  y1="-3" 
                  x2="4" 
                  y2="-6" 
                  stroke="#ff3333" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
                {/* Contact point */}
                <circle 
                  cx="0" 
                  cy="3" 
                  r="1.5" 
                  fill="#ff3333"
                />
                {/* Breaker label */}
                <text 
                  x="8" 
                  y="1" 
                  fill="#ff3333" 
                  fontSize="8"
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
        <p style={{ color: '#888' }}>Silakan buat struktur tree terlebih dahulu menggunakan builder di atas.</p>
      </div>
    )
  }

  const svgWidth = Math.max(1600, positionedNodes.length * 300)
  const svgHeight = 1000

  return (
    <div style={{ 
      width: '100%', 
      height: '700px', 
      overflow: 'auto', 
      background: 'linear-gradient(135deg, rgba(10, 15, 30, 0.8), rgba(20, 25, 40, 0.8))',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    }}>
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
                <DataDisplay x={node.position.x + 70} y={node.position.y} data={node.data} />
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
  const [showDiagram, setShowDiagram] = useState<boolean>(false)

  const handleSaveTree = (tree: ElectricalNode[]) => {
    setTreeData(tree)
    setShowDiagram(true)
  }

  const handleEditTree = () => {
    setShowDiagram(false)
  }

  useEffect(() => {
    // Update electrical data every 2 seconds
    const interval = setInterval(() => {
      setTreeData((prev) => updateAllData(prev))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const updateAllData = (nodes: ElectricalNode[]): ElectricalNode[] => {
    return nodes.map((node) => ({
      ...node,
      data: generateElectricalData(),
      children: updateAllData(node.children),
    }))
  }

  return (
    <div className="row">
      <div className="col-xl-12">
        {!showDiagram ? (
          <TreeBuilder onSave={handleSaveTree} initialData={treeData} />
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
                    onClick={handleEditTree}
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
                      e.currentTarget.style.transform = 'translateX(-5px)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>←</span>
                    <span>Edit Structure</span>
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
