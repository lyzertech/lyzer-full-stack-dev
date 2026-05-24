'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row, Form, Accordion, Modal, Alert, Spinner, Badge } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import { SYSTEM_TYPE_OPTIONS, PARAM_SELECT_OPTIONS, IO_MAP, MODBUS_CARDS, READING_LIST, SPECIAL_ADDRESSES } from './modbusConfig'

interface ModbusData {
  [key: string]: {
    value: any
    address: number
  }
}

interface AlertMessage {
  id: number
  type: 'success' | 'danger' | 'warning'
  message: string
}

export default function RishConMPlusPage() {
  const [groupsData, setGroupsData] = useState<Record<number, ModbusData>>({})
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<AlertMessage[]>([])
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState<any>({})
  const [modalLoading, setModalLoading] = useState(false)
  const [writingGroup, setWritingGroup] = useState<number | null>(null)
  const [editedValues, setEditedValues] = useState<Record<number, string>>({})

  // Fetch all groups on mount
  useEffect(() => {
    fetchAllGroups()
  }, [])

  const fetchAllGroups = async () => {
    setLoading(true)
    try {
      const results: Record<number, ModbusData> = {}
      for (const card of MODBUS_CARDS) {
        const data = await fetchModbusData(card.address, card.count)
        results[card.address] = data
      }
      setGroupsData(results)
    } catch (error) {
      showAlert('Failed to load configuration data', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const fetchModbusData = async (address: number, count: number): Promise<ModbusData> => {
    const response = await fetch(`/api/v1/modbus/read/${address}/${count}`)
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    return await response.json()
  }

  const writeAllChanges = async (groupAddress: number, groupData: ModbusData) => {
    // Find all changed values in this group
    const changes: { address: number; value: string }[] = []
    
    Object.values(groupData).forEach((item) => {
      const editedValue = editedValues[item.address]
      if (editedValue !== undefined && editedValue !== String(item.value)) {
        changes.push({ address: item.address, value: editedValue })
      }
    })

    if (changes.length === 0) {
      showAlert('No changes to save', 'warning')
      return
    }

    setWritingGroup(groupAddress)
    let successCount = 0
    let failCount = 0

    try {
      for (const change of changes) {
        try {
          const response = await fetch('/api/v1/modbus/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: change.address, value: parseFloat(change.value) })
          })

          const result = await response.json()

          if (result.status === 'ok' || result.success) {
            successCount++
          } else {
            failCount++
          }
        } catch (error) {
          failCount++
        }
      }

      if (successCount > 0) {
        showAlert(`Successfully saved ${successCount} parameter(s)${failCount > 0 ? `, ${failCount} failed` : ''}`, failCount > 0 ? 'warning' : 'success')
        await fetchAllGroups()
        // Clear all edited values
        setEditedValues({})
      } else {
        showAlert('All writes failed', 'danger')
      }
    } catch (error: any) {
      showAlert(error.message || 'Write failed', 'danger')
    } finally {
      setWritingGroup(null)
    }
  }

  const showAlert = (message: string, type: 'success' | 'danger' | 'warning') => {
    const id = Date.now()
    setAlerts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id))
    }, 4000)
  }

  const handleInputChange = (address: number, value: string) => {
    setEditedValues(prev => ({ ...prev, [address]: value }))
  }

  const isValueChanged = (address: number, currentValue: any): boolean => {
    const editedValue = editedValues[address]
    return editedValue !== undefined && editedValue !== String(currentValue)
  }

  const getInputValue = (address: number, currentValue: any): string => {
    if (editedValues[address] !== undefined) {
      return editedValues[address]
    }
    return currentValue !== null && currentValue !== undefined ? String(currentValue) : ''
  }

  const openReadingModal = async () => {
    setShowModal(true)
    setModalLoading(true)
    try {
      // Fetch data from multiple ranges
      const [data1, data2, data3] = await Promise.all([
        fetchModbusData(0, 40),
        fetchModbusData(40, 40),
        fetchModbusData(200, 30)
      ])

      // Merge all data into a single map by address
      const mergedData: Record<number, any> = {}
      ;[data1, data2, data3].forEach(dataObj => {
        Object.values(dataObj).forEach((item: any) => {
          if (item.address !== undefined) {
            mergedData[item.address] = item.value
          }
        })
      })

      setModalData(mergedData)
    } catch (error) {
      showAlert('Failed to load measurement data', 'danger')
    } finally {
      setModalLoading(false)
    }
  }

  const renderParameterInput = (key: string, item: any) => {
    const address = item.address
    const currentValue = item.value

    // Helper function to get the selected value for dropdowns
    const getDropdownValue = (options: Record<number | string, string>): string => {
      // If user has edited this field, use the edited value
      if (editedValues[address] !== undefined) {
        return editedValues[address]
      }
      
      // Otherwise, find the key that matches the current value (label)
      // First try exact match on value
      for (const [key, label] of Object.entries(options)) {
        if (String(currentValue) === String(key) || String(currentValue) === String(label)) {
          return String(key)
        }
      }
      
      // If no match found, return the first key as fallback
      return String(Object.keys(options)[0] || '')
    }

    // System Type dropdown
    if (address === SPECIAL_ADDRESSES.SYSTEM_TYPE) {
      return (
        <Form.Select
          value={getDropdownValue(SYSTEM_TYPE_OPTIONS)}
          onChange={(e) => handleInputChange(address, e.target.value)}
          size="sm"
        >
          {Object.entries(SYSTEM_TYPE_OPTIONS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </Form.Select>
      )
    }

    // Parameter Select dropdowns
    if (SPECIAL_ADDRESSES.PARAM_SELECTS.includes(address)) {
      return (
        <Form.Select
          value={getDropdownValue(PARAM_SELECT_OPTIONS)}
          onChange={(e) => handleInputChange(address, e.target.value)}
          size="sm"
        >
          {Object.entries(PARAM_SELECT_OPTIONS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </Form.Select>
      )
    }

    // IO Type dropdowns
    if (SPECIAL_ADDRESSES.IO_TYPES.includes(address)) {
      return (
        <Form.Select
          value={getDropdownValue(IO_MAP)}
          onChange={(e) => handleInputChange(address, e.target.value)}
          size="sm"
        >
          {Object.entries(IO_MAP).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </Form.Select>
      )
    }

    // Regular numeric input
    return (
      <Form.Control
        type="number"
        step="any"
        value={getInputValue(address, currentValue)}
        onChange={(e) => handleInputChange(address, e.target.value)}
        size="sm"
      />
    )
  }

  const formatValue = (value: any, unit: string): string => {
    if (value === null || value === undefined || value === 'ERR' || value === '--') {
      return value || '--'
    }

    const numVal = parseFloat(value)
    if (isNaN(numVal)) return String(value)

    // Scale large values
    if (['V', 'A', 'W', 'VA', 'VAr'].includes(unit)) {
      if (Math.abs(numVal) >= 1000000) {
        return `${(numVal / 1000000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} M${unit}`
      } else if (Math.abs(numVal) >= 1000) {
        return `${(numVal / 1000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} k${unit}`
      }
    }

    return `${numVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${unit}`
  }

  const renderModalContent = () => {
    // Group by category
    const categories: Record<string, any[]> = {}
    const categoryOrder = ['Voltage', 'Current', 'Power', 'PF and Angle']

    Object.entries(READING_LIST).forEach(([addr, item]) => {
      const category = item.category || 'Other'
      if (!categories[category]) categories[category] = []
      categories[category].push({ address: parseInt(addr), ...item })
    })

    // Sort items within Power and PF and Angle categories
    const sortPowerAndPF = (items: any[], category: string) => {
      if (category === 'Power') {
        const types = ['Watt', 'VAr', 'VA']
        const suffixes = ['L1', 'L2', 'L3', 'System']
        const sorted: any[] = []
        types.forEach(type => {
          suffixes.forEach(suffix => {
            const item = items.find(i => i.name.startsWith(type) && i.name.endsWith(suffix))
            if (item) sorted.push(item)
          })
        })
        return sorted
      }
      if (category === 'PF and Angle') {
        const types = ['PF', 'PA']
        const suffixes = ['L1', 'L2', 'L3', 'System']
        const sorted: any[] = []
        types.forEach(type => {
          suffixes.forEach(suffix => {
            const item = items.find(i => i.name.startsWith(type) && i.name.endsWith(suffix))
            if (item) sorted.push(item)
          })
        })
        return sorted
      }
      return items
    }

    return (
      <Row className="g-3">
        {categoryOrder.map(cat => {
          if (!categories[cat] || categories[cat].length === 0) return null
          const items = sortPowerAndPF(categories[cat], cat)
          const firstItem = items[0]

          return (
            <Col xl={3} lg={4} md={6} sm={12} key={cat}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-white border-0 pb-2 pt-3 px-3 text-center">
                  <h6 className="mb-0 d-flex flex-column align-items-center gap-1">
                    <span className="d-flex align-items-center justify-content-center" style={{ fontSize: '1.5rem' }}>
                      <i className={`ti ${firstItem.icon} text-${firstItem.color}`}></i>
                    </span>
                    <span className="fw-bold">{cat}</span>
                  </h6>
                </Card.Header>
                <Card.Body className="pt-2 pb-3 px-3">
                  <div className="d-flex flex-column gap-0">
                    {items.map(item => {
                      const value = modalData[item.address]
                      return (
                        <div key={item.address} className="d-flex align-items-center gap-2 py-1">
                          <div className="flex-grow-1">
                            <h6 className="mb-0 fw-semibold" style={{ fontSize: '1rem' }}>
                              {item.name}
                            </h6>
                            <small className="text-muted" style={{ fontSize: '0.85rem' }}>
                              {item.address}
                            </small>
                          </div>
                          <span className="fw-bold text-dark" style={{ fontSize: '1.25rem', minWidth: '56px' }}>
                            {modalLoading ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <span>{formatValue(value, item.unit)}</span>
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )
        })}
      </Row>
    )
  }

  return (
    <Fragment>
      <Seo title="Rish Con M+" />
      <Pageheader 
        title="Rish Con M+" 
        heading="Config Tools" 
        active="Rish Con M+"
      />

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">Rish Con M+</h5>
                <p className="card-subtitle mb-0">Modbus Reading Result</p>
              </div>
              <Button variant="primary" onClick={openReadingModal}>
                Reading measurement
              </Button>
            </Card.Header>
            <Card.Body>
              {/* Alerts */}
              <div className="mb-3">
                {alerts.map(alert => (
                  <Alert key={alert.id} variant={alert.type} dismissible onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}>
                    <i className="ti ti-alert-triangle me-2"></i>
                    {alert.message}
                  </Alert>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Loading configuration data...</p>
                </div>
              ) : Object.keys(groupsData).length === 0 ? (
                <Alert variant="danger">
                  <i className="ti ti-alert-triangle me-2"></i>
                  No data returned from device.
                </Alert>
              ) : (
                <div className="border rounded p-4">
                  <Accordion>
                    {MODBUS_CARDS.map((card, idx) => {
                      const data = groupsData[card.address]
                      if (!data) return null
                      
                      // Check if this group has any changes
                      const hasChanges = Object.values(data).some(item => isValueChanged(item.address, item.value))

                      return (
                        <Accordion.Item eventKey={String(idx)} key={idx}>
                          <Accordion.Header>
                            <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                              <div className="d-flex flex-column">
                                <strong>{card.title}</strong>
                                <small className="text-muted">Click to expand</small>
                              </div>
                              {hasChanges && (
                                <Badge bg="warning" text="dark">
                                  <i className="ti ti-pencil me-1"></i>
                                  Modified
                                </Badge>
                              )}
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            {/* Save All Changes Button */}
                            <div className="mb-3 p-3 bg-light rounded">
                              <Row className="align-items-center">
                                <Col>
                                  <small className="text-muted">
                                    {hasChanges 
                                      ? 'You have unsaved changes. Click the button to save all modified parameters.' 
                                      : 'No changes to save. Modify parameters below and click Save All Changes.'}
                                  </small>
                                </Col>
                                <Col xs="auto">
                                  <Button
                                    variant={hasChanges ? "primary" : "secondary"}
                                    onClick={() => writeAllChanges(card.address, data)}
                                    disabled={!hasChanges || writingGroup === card.address}
                                  >
                                    {writingGroup === card.address ? (
                                      <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <i className="ti ti-device-floppy me-2"></i>
                                        Save All Changes
                                      </>
                                    )}
                                  </Button>
                                </Col>
                              </Row>
                            </div>

                            <Row>
                              {Object.entries(data).map(([key, item]) => {
                                const hasChanged = isValueChanged(item.address, item.value)
                                
                                return (
                                  <Col sm={4} key={item.address} className="mb-4">
                                    <div className={`border rounded p-3 ${hasChanged ? 'border-warning border-2 bg-warning bg-opacity-10' : ''}`}>
                                      <div className="d-flex gap-2 align-items-center mb-2">
                                        <Badge bg={hasChanged ? "warning" : "primary"} className="p-1" text={hasChanged ? "dark" : "white"}>
                                          <i className={`ti ${hasChanged ? 'ti-pencil' : 'ti-activity'} ti-sm`}></i>
                                        </Badge>
                                        <h6 className="mb-0 fw-normal">{key}</h6>
                                      </div>

                                      <Row>
                                        <Col xs={4}>
                                          <small className="text-muted d-block">Current</small>
                                          <h4 className="my-2">{item.value}</h4>
                                        </Col>
                                        <Col xs={8}>
                                          <Form.Label className="mb-1 small">
                                            New Value
                                            {hasChanged && <span className="text-warning ms-1">*</span>}
                                          </Form.Label>
                                          {renderParameterInput(key, item)}
                                        </Col>
                                      </Row>

                                      <div className="progress mt-2" style={{ height: '6px' }}>
                                        <div
                                          className={`progress-bar ${hasChanged ? 'bg-warning' : ''}`}
                                          role="progressbar"
                                          style={{ width: '100%' }}
                                          aria-valuenow={100}
                                          aria-valuemin={0}
                                          aria-valuemax={100}
                                        ></div>
                                      </div>
                                    </div>
                                  </Col>
                                )
                              })}
                            </Row>
                          </Accordion.Body>
                        </Accordion.Item>
                      )
                    })}
                  </Accordion>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Reading Measurement Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <i className="ti ti-gauge"></i>
            <span>Reading Measurement</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          {renderModalContent()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}
