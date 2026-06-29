'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dropdown, Form, Spinner } from 'react-bootstrap'
import { apiClient } from '@/lib/api-client'
import {
  buildDeviceTree,
  collectDevices,
  filterDevices,
  getDeviceStatusColor,
  type DeviceNode,
} from '../utils/deviceTree'

interface DeviceSelectorProps {
  selected: DeviceNode | null
  onSelect: (node: DeviceNode) => void
  className?: string
}

interface TreeNodeProps {
  node: DeviceNode
  depth: number
  selectedId: string | null
  onSelect: (node: DeviceNode) => void
  onClose: () => void
}

const StatusDot = ({ status }: { status?: string }) => {
  const color = getDeviceStatusColor(status)
  const isOnline = status === 'online' || status === 'Online'
  return (
    <span
      className="rounded-circle d-inline-block flex-shrink-0"
      style={{
        width: 7,
        height: 7,
        background: color,
        boxShadow: isOnline ? `0 0 6px ${color}` : 'none',
      }}
    />
  )
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  depth,
  selectedId,
  onSelect,
  onClose,
}) => {
  const hasChildren = !!(node.children && node.children.length > 0)
  const [open, setOpen] = useState(depth < 2)
  const isSelected = selectedId === node.id
  const isDevice = node.type === 'device'

  const handleClick = () => {
    if (isDevice) {
      onSelect(node)
      onClose()
      return
    }
    setOpen((v) => !v)
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={`btn btn-sm w-100 text-start d-flex align-items-center gap-2 border-0 rounded-1 py-1 ${
          isSelected ? 'bg-primary-transparent text-primary' : 'btn-light'
        }`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <span className="text-muted" style={{ width: 12, fontSize: 11 }}>
          {hasChildren ? (open ? '▾' : '▸') : ''}
        </span>
        {node.icon && <i className={`bi ${node.icon} fs-12 flex-shrink-0`} />}
        <span className="text-truncate flex-grow-1 fs-13">{node.label}</span>
        {isDevice && <StatusDot status={node.status} />}
        {!isDevice && hasChildren && (
          <span className="badge bg-light text-muted border fs-10">
            {collectDevices(node.children!).length}
          </span>
        )}
      </button>
      {hasChildren && open && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selected,
  onSelect,
  className = '',
}) => {
  const [show, setShow] = useState(false)
  const [tree, setTree] = useState<DeviceNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const didAutoSelect = useRef(false)

  const fetchTree = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/monitoring/device-tree')
      const data = response.data
      const built = buildDeviceTree(Array.isArray(data) ? data : [])
      setTree(built)

      if (!didAutoSelect.current) {
        const firstDevice = collectDevices(built)[0]
        if (firstDevice) {
          onSelect(firstDevice)
          didAutoSelect.current = true
        }
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load devices')
    } finally {
      setLoading(false)
    }
  }, [onSelect])

  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  const allDevices = collectDevices(tree)
  const filteredDevices = search.trim() ? filterDevices(allDevices, search) : null

  return (
    <Dropdown show={show} onToggle={(next) => setShow(!!next)} className={className}>
      <Dropdown.Toggle
        as="button"
        className="btn btn-link text-decoration-none p-0 border-0 d-flex align-items-center gap-2 no-caret"
      >
        <h1 className="page-title fw-semibold fs-20 mb-0">
          {selected?.label ?? 'Select device'}
        </h1>
        <i className="bi bi-chevron-down text-muted fs-14" />
      </Dropdown.Toggle>

      <Dropdown.Menu
        className="p-0 shadow-sm"
        style={{ width: 320, maxHeight: 420 }}
      >
        <div className="p-2 border-bottom">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="fw-semibold fs-13 text-uppercase">Devices</span>
            <button
              type="button"
              className="btn btn-sm btn-icon btn-light border-0"
              onClick={fetchTree}
              aria-label="Refresh devices"
            >
              <i className="bi bi-arrow-clockwise text-muted" />
            </button>
          </div>
          <Form.Control
            size="sm"
            type="search"
            placeholder="Search name, IP, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="p-2 overflow-auto" style={{ maxHeight: 320 }}>
          {loading ? (
            <div className="text-center py-4 text-muted">
              <Spinner size="sm" animation="border" className="me-2" />
              Loading devices...
            </div>
          ) : error ? (
            <div className="text-center py-3">
              <div className="text-danger fs-13 mb-2">{error}</div>
              <button
                type="button"
                className="btn btn-sm btn-light border"
                onClick={fetchTree}
              >
                Retry
              </button>
            </div>
          ) : filteredDevices ? (
            filteredDevices.length === 0 ? (
              <div className="text-center text-muted fs-13 py-3">No devices found</div>
            ) : (
              filteredDevices.map((device) => (
                <TreeNode
                  key={device.id}
                  node={device}
                  depth={0}
                  selectedId={selected?.id ?? null}
                  onSelect={onSelect}
                  onClose={() => setShow(false)}
                />
              ))
            )
          ) : tree.length === 0 ? (
            <div className="text-center text-muted fs-13 py-3">
              No organizations found
            </div>
          ) : (
            tree.map((root) => (
              <TreeNode
                key={root.id}
                node={root}
                depth={0}
                selectedId={selected?.id ?? null}
                onSelect={onSelect}
                onClose={() => setShow(false)}
              />
            ))
          )}
        </div>

        <div className="px-3 py-2 border-top d-flex justify-content-between">
          <span className="text-muted fs-11">Total devices</span>
          <span className="fw-semibold fs-12">{loading ? '...' : allDevices.length}</span>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default DeviceSelector

