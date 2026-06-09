'use client'

import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import {
  Card,
  Col,
  Row,
  Button,
  Table,
  Badge,
  Form,
  InputGroup,
  Pagination,
  ProgressBar,
  Tooltip,
  OverlayTrigger,
  Modal,
} from 'react-bootstrap'
import FacilityEnergyChart from './FacilityEnergyChart'
import { useAuth } from '@/shared/auth/AuthContext'
import { canCreateMonitoringInstallation } from '@/shared/monitoring/roleAccess'

const DevicesPage = () => {
  const { user } = useAuth()
  const canCreate = canCreateMonitoringInstallation(user?.role)

  const router = useRouter()
  const searchParams = useSearchParams()
  const orgIdFromUrl = searchParams.get('org_id')
  const preferUrlFacility = useRef(
    Boolean(
      searchParams.get('facility_id') || searchParams.get('facility_name'),
    ),
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrg, setSelectedOrg] = useState(orgIdFromUrl ?? '')
  const [selectedFacility, setSelectedFacility] = useState(
    searchParams.get('facility_name') ?? '',
  )
  const [preselectedFacilityId, setPreselectedFacilityId] = useState(
    searchParams.get('facility_id'),
  )
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const [organizations, setOrganizations] = useState<any[]>([])
  const [facilities, setFacilities] = useState<any[]>([])
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Scan Network state
  const [showScanModal, setShowScanModal] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanResults, setScanResults] = useState<any[]>([])
  const [scanRegisteredElsewhere, setScanRegisteredElsewhere] = useState<any[]>(
    [],
  )
  const [scanError, setScanError] = useState<string | null>(null)
  const [selectedScanKeys, setSelectedScanKeys] = useState<Set<string>>(
    new Set(),
  )
  const [bulkFacilityId, setBulkFacilityId] = useState('')
  const [bulkRegistering, setBulkRegistering] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<{
    done: number
    total: number
    errors: string[]
  } | null>(null)

  const applyFacilitySelection = (
    facilityData: { id: number; name: string }[],
    useUrlParams: boolean,
  ) => {
    if (facilityData.length === 0) {
      setSelectedFacility('All')
      setPreselectedFacilityId(null)
      return
    }

    if (useUrlParams) {
      const urlFacilityId = searchParams.get('facility_id')
      if (urlFacilityId) {
        const matchedById = facilityData.find(
          (f) => String(f.id) === urlFacilityId,
        )
        if (matchedById) {
          setSelectedFacility(matchedById.name)
          setPreselectedFacilityId(urlFacilityId)
          return
        }
      }

      const urlFacilityName = searchParams.get('facility_name')
      if (urlFacilityName) {
        const matchedByName = facilityData.find(
          (f) => f.name === urlFacilityName,
        )
        if (matchedByName) {
          setSelectedFacility(matchedByName.name)
          setPreselectedFacilityId(String(matchedByName.id))
          return
        }
      }
    }

    setSelectedFacility(facilityData[0].name)
    setPreselectedFacilityId(String(facilityData[0].id))
  }

  const fetchInitialData = async () => {
    try {
      const orgRes = await apiClient.get('/monitoring/organizations')
      const orgData = Array.isArray(orgRes.data) ? orgRes.data : []
      setOrganizations(orgData)

      if (orgData.length === 0) {
        setLoading(false)
        return
      }

      const urlOrgId = searchParams.get('org_id')
      const matchedOrg = urlOrgId
        ? orgData.find((org: { id: number }) => String(org.id) === urlOrgId)
        : null

      if (matchedOrg) {
        setSelectedOrg(String(matchedOrg.id))
      } else {
        setSelectedOrg(String(orgData[0].id))
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
      setLoading(false)
    }
  }

  const fetchFacilities = async () => {
    if (!selectedOrg) return
    try {
      const res = await apiClient.get(
        `/monitoring/facilities?organization_id=${selectedOrg}`,
      )
      const facilityData = Array.isArray(res.data) ? res.data : []
      setFacilities(facilityData)
      applyFacilitySelection(facilityData, preferUrlFacility.current)
      preferUrlFacility.current = false
    } catch (error) {
      console.error('Failed to fetch facilities:', error)
    }
  }

  const fetchDevices = async () => {
    if (!selectedOrg) return
    if (facilities.length > 0 && !selectedFacility && !preselectedFacilityId) {
      return
    }
    setLoading(true)
    try {
      let url = `/monitoring/devices?organization_id=${selectedOrg}`
      // Prefer direct facility_id from query param, else match by name
      if (preselectedFacilityId) {
        url += `&facility_id=${preselectedFacilityId}`
      } else if (selectedFacility !== 'All') {
        const fac = facilities.find((f) => f.name === selectedFacility)
        if (fac) url += `&facility_id=${fac.id}`
      }
      const res = await apiClient.get(url)
      setDevices(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error('Failed to fetch devices:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedOrg) {
      fetchFacilities()
    }
  }, [selectedOrg])

  useEffect(() => {
    if (selectedOrg) {
      fetchDevices()
    }
  }, [selectedOrg, selectedFacility, preselectedFacilityId, facilities])

  // When the facility dropdown is changed manually, clear the preselected id
  const handleFacilityChange = (value: string) => {
    setSelectedFacility(value)
    setPreselectedFacilityId(null)
    setCurrentPage(1)
  }

  // Filtering Logic
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.ip_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.model?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [devices, searchQuery])

  // Facility Overview Stats
  const currentFacility = useMemo(() => {
    if (selectedFacility === 'All') return null
    return facilities.find((f) => f.name === selectedFacility) || null
  }, [facilities, selectedFacility])

  const deviceStats = useMemo(() => {
    const total = filteredDevices.length
    const online = filteredDevices.filter((d) => d.status === 'Online').length
    const offline = filteredDevices.filter(
      (d) => d.status === 'Offline' || d.status === 'Warning',
    ).length
    const dormant = filteredDevices.filter(
      (d) => d.status === 'Inactive' || d.status === 'Dormant',
    ).length

    // Assuming type parsing or using raw device type
    const electricity = filteredDevices.filter(
      (d) =>
        ['Meter', 'Gateway', 'Sensor', 'Acuvim'].includes(
          d.device_type || '',
        ) || !d.device_type,
    ).length
    const water = 0
    const gas = 0
    const activeAlerts = 0

    return {
      total,
      online,
      offline,
      dormant,
      electricity,
      water,
      gas,
      activeAlerts,
    }
  }, [filteredDevices])

  // Form State
  const [showAddModal, setShowAddModal] = useState(false)

  const emptyForm = {
    facility_id: '',
    name: '',
    device_code: '',
    device_type: 'Meter',
    brand: '',
    model: '',
    firmware_version: '',
    connection_type: 'Ethernet',
    protocol: 'Modbus-TCP',
    // General network
    ip_address: '',
    port: '',
    mac_address: '',
    // Modbus RTU
    modbus_slave_id: '',
    modbus_baudrate: '9600',
    modbus_parity: 'None',
    modbus_stop_bits: '1',
    modbus_data_bits: '8',
    // MQTT
    mqtt_broker_host: '',
    mqtt_client_id: '',
    mqtt_topic_pub: '',
    mqtt_topic_sub: '',
    mqtt_username: '',
    mqtt_password: '',
    mqtt_tls_enabled: false,
    mqtt_qos: '1',
    // SNMP
    snmp_version: 'v2c',
    snmp_community: 'public',
    snmp_username: '',
    snmp_auth_protocol: '',
    snmp_auth_password: '',
    snmp_priv_protocol: '',
    snmp_priv_password: '',
    // OPC-UA
    opcua_endpoint_url: '',
    opcua_namespace_uri: '',
    opcua_security_mode: 'None',
    opcua_security_policy: '',
    // HTTP
    http_base_url: '',
    http_auth_type: 'None',
    http_api_key: '',
    http_poll_interval_sec: '60',
    // LoRaWAN
    lorawan_dev_eui: '',
    lorawan_app_eui: '',
    lorawan_app_key: '',
    lorawan_class: 'A',
  }

  const [formData, setFormData] = useState<any>({ ...emptyForm })

  const setField = (key: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, [key]: value }))

  useEffect(() => {
    if (facilities.length > 0 && !formData.facility_id) {
      setField('facility_id', String(facilities[0].id))
    }
  }, [facilities])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreate) return
    try {
      await apiClient.post('/monitoring/devices', formData)
      alert('Device registered successfully!')
      setShowAddModal(false)
      setFormData({
        ...emptyForm,
        facility_id: String(facilities[0]?.id || ''),
      })
      fetchDevices()
    } catch (error: any) {
      console.error('Failed to register device:', error)
      alert(
        'Error: ' +
          (error.response?.data?.message ||
            error.message ||
            'Failed to register device'),
      )
    }
  }

  const handleDelete = async (id: number) => {
    if (!canCreate) return
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await apiClient.delete(`/monitoring/devices/${id}`)
        fetchDevices()
      } catch (error) {
        console.error('Failed to delete device:', error)
      }
    }
  }

  const sortByDeviceSerial = (items: any[]) =>
    [...items].sort((a, b) =>
      String(a.device_serial ?? '').localeCompare(
        String(b.device_serial ?? ''),
        undefined,
        { numeric: true, sensitivity: 'base' },
      ),
    )

  const handleScanNetwork = async () => {
    setShowScanModal(true)
    setScanning(true)
    setScanError(null)
    setScanResults([])
    setScanRegisteredElsewhere([])
    setSelectedScanKeys(new Set())
    setBulkProgress(null)
    setBulkFacilityId(facilities[0]?.id ? String(facilities[0].id) : '')
    try {
      const res = await apiClient.get('/monitoring/acuvim/scan')
      const payload = res.data
      if (Array.isArray(payload)) {
        setScanResults(sortByDeviceSerial(payload))
      } else if (payload && typeof payload === 'object') {
        const scanPayload = payload as {
          available?: any[]
          registered_elsewhere?: any[]
        }
        setScanResults(sortByDeviceSerial(scanPayload.available ?? []))
        setScanRegisteredElsewhere(
          sortByDeviceSerial(scanPayload.registered_elsewhere ?? []),
        )
      }
    } catch (err: any) {
      setScanError(
        err.response?.data?.message ||
          err.message ||
          'Network error. Could not reach the server.',
      )
    } finally {
      setScanning(false)
    }
  }

  const handleUseScannedDevice = (item: any) => {
    if (!canCreate) return
    setFormData((prev: any) => ({
      ...prev,
      name: item.device_name || '',
      device_code: item.device_serial || '',
      model: item.device_model || '',
      brand: 'Acuvim',
      device_type: 'Meter',
    }))
    setShowScanModal(false)
    setShowAddModal(true)
  }

  const scanItemKey = (item: any) => item.device_serial || item.device_name

  const toggleScanItem = (item: any) => {
    const key = scanItemKey(item)
    setSelectedScanKeys((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedScanKeys.size === scanResults.length) {
      setSelectedScanKeys(new Set())
    } else {
      setSelectedScanKeys(new Set(scanResults.map(scanItemKey)))
    }
  }

  const handleBulkRegister = async () => {
    if (!canCreate) return
    if (!bulkFacilityId) {
      alert('Please select a target facility before registering.')
      return
    }
    const toRegister = scanResults.filter((item) =>
      selectedScanKeys.has(scanItemKey(item)),
    )
    if (toRegister.length === 0) return

    setBulkRegistering(true)
    setBulkProgress({ done: 0, total: toRegister.length, errors: [] })

    let done = 0
    const errors: string[] = []

    for (const item of toRegister) {
      try {
        await apiClient.post('/monitoring/devices', {
          facility_id: bulkFacilityId,
          name: item.device_name || '',
          device_code: item.device_serial || '',
          model: item.device_model || '',
          brand: 'Acuvim',
          device_type: 'Meter',
          protocol: 'Modbus-TCP',
          connection_type: 'Ethernet',
        })
      } catch (err: any) {
        errors.push(
          `${item.device_name}: ${err.response?.data?.message || err.message || 'Failed'}`,
        )
      }
      done++
      setBulkProgress({ done, total: toRegister.length, errors: [...errors] })
    }

    setBulkRegistering(false)
    fetchDevices()
    // Remove successfully registered items from results
    const failedNames = new Set(errors.map((e) => e.split(':')[0].trim()))
    setScanResults((prev) =>
      prev.filter((item) => failedNames.has(item.device_name)),
    )
    setSelectedScanKeys(new Set())
  }

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredDevices.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage)

  const getStatusBadge = (status: string) => {
    const dot = (color: string) => (
      <span
        style={{
          display: 'inline-block',
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: color,
          marginRight: 6,
          verticalAlign: 'middle',
        }}
      />
    )
    const badge = (
      label: string,
      bg: string,
      color: string,
      border: string,
    ) => (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 10px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 600,
          backgroundColor: bg,
          color,
          border: `1px solid ${border}`,
          whiteSpace: 'nowrap',
        }}
      >
        {dot(color)}
        {label}
      </span>
    )
    switch (status) {
      case 'Online':
        return badge(
          'Online',
          'rgba(33,186,69,0.15)',
          '#21ba45',
          'rgba(33,186,69,0.35)',
        )
      case 'Offline':
        return badge(
          'Offline',
          'rgba(220,53,69,0.15)',
          '#f04860',
          'rgba(220,53,69,0.35)',
        )
      case 'Warning':
        return badge(
          'Warning',
          'rgba(255,193,7,0.15)',
          '#f5be00',
          'rgba(255,193,7,0.35)',
        )
      case 'Inactive':
        return badge(
          'Inactive',
          'rgba(108,117,125,0.12)',
          '#8a95a0',
          'rgba(108,117,125,0.3)',
        )
      default:
        return badge(
          status,
          'rgba(108,117,125,0.12)',
          '#8a95a0',
          'rgba(108,117,125,0.3)',
        )
    }
  }

  const getSignalColor = (signal: number) => {
    if (signal > 80) return 'success'
    if (signal > 40) return 'warning'
    return 'danger'
  }

  return (
    <React.Fragment>
      <Seo title="Device Configuration - Monitoring" />

      <Pageheader
        title="Devices"
        subtitle="Installation"
        currentpage="Device Configuration"
        activepage="Monitoring"
      />

      {/* Overview Cards Row */}
      <Row className="mb-4 gy-3">
        <Col xl={4} lg={12}>
          <Card className="custom-card shadow-sm border-0 h-100 overflow-hidden">
            <div
              className="card-bg-gradient"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #0dcaf0, #0d6efd)',
              }}
            ></div>
            <Card.Header className="border-bottom-0 pb-1 pt-3">
              <Card.Title className="fw-bold fs-15 text-primary">
                Building Details
              </Card.Title>
            </Card.Header>
            <Card.Body className="d-flex align-items-center">
              <div
                className="me-4 rounded-3 p-3 bg-primary-transparent border border-primary-transparent d-flex align-items-center justify-content-center"
                style={{ width: '120px', height: '100px' }}
              >
                <i
                  className="bi bi-building fs-1"
                  style={{ color: 'var(--primary-color)' }}
                ></i>
              </div>
              <div className="flex-fill">
                <div className="mb-2 d-flex align-items-center">
                  <i className="bi bi-buildings text-muted me-2 fs-14"></i>
                  <span
                    className="text-muted fw-medium fs-13 me-2"
                    style={{ width: '65px' }}
                  >
                    Name:
                  </span>
                  <span className="fw-bold fs-13">
                    {currentFacility?.name || 'All Facilities'}
                  </span>
                </div>
                <div className="mb-2 d-flex align-items-center">
                  <i className="bi bi-geo-alt text-muted me-2 fs-14"></i>
                  <span
                    className="text-muted fw-medium fs-13 me-2"
                    style={{ width: '65px' }}
                  >
                    Location:
                  </span>
                  <span
                    className="fw-bold fs-13 text-info text-truncate"
                    style={{ maxWidth: '140px' }}
                    title={
                      currentFacility?.full_address ||
                      currentFacility?.location_name ||
                      'N/A'
                    }
                  >
                    {currentFacility?.full_address ||
                      currentFacility?.location_name ||
                      'N/A'}
                  </span>
                </div>
                <div className="mb-2 d-flex align-items-center">
                  <i className="bi bi-bounding-box text-muted me-2 fs-14"></i>
                  <span
                    className="text-muted fw-medium fs-13 me-2"
                    style={{ width: '65px' }}
                  >
                    Area:
                  </span>
                  <span className="fw-bold fs-13">
                    {currentFacility?.metadata?.area || '1 sq. ft.'}
                  </span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-grid text-muted me-2 fs-14"></i>
                  <span
                    className="text-muted fw-medium fs-13 me-2"
                    style={{ width: '65px' }}
                  >
                    Category:
                  </span>
                  <span className="fw-bold fs-13">
                    {currentFacility?.facility_type || 'Other'}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} lg={12}>
          <Card className="custom-card shadow-sm border-0 h-100 overflow-hidden">
            <div
              className="card-bg-gradient"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #ffc107, #fd7e14)',
              }}
            ></div>
            <Card.Header className="border-bottom-0 pb-1 pt-3">
              <Card.Title className="fw-bold fs-15 text-warning">
                Weather Overview
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                  <i
                    className="bi bi-cloud-sun fs-1 text-warning me-3"
                    style={{ opacity: 0.8 }}
                  ></i>
                  <div>
                    <div
                      className="fs-24 fw-bold text-dark d-flex align-items-center"
                      style={{ color: 'var(--default-text-color)' }}
                    >
                      29.6<span className="fs-18 text-muted ms-1">°C</span>
                    </div>
                    <div className="fs-12 text-muted fw-medium">
                      Current Temperature
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="fs-12 fw-medium text-muted mb-1">
                    <i className="bi bi-thermometer-high text-danger me-1"></i>
                    High: <span className="fw-bold text-default">29.6°C</span>
                  </div>
                  <div className="fs-12 fw-medium text-muted">
                    <i className="bi bi-thermometer-low text-info me-1"></i>Low:{' '}
                    <span className="fw-bold text-default">29.6°C</span>
                  </div>
                </div>
              </div>
              <div className="bg-light p-3 rounded-3 d-flex justify-content-around align-items-center border border-default">
                <div className="text-center d-flex align-items-center">
                  <i className="bi bi-person-fill text-info fs-4 me-2"></i>
                  <div className="text-start">
                    <div className="fs-11 text-muted fw-bold text-uppercase">
                      Feels Like
                    </div>
                    <div className="fs-16 fw-bold">33°C</div>
                  </div>
                </div>
                <div
                  style={{
                    width: '1px',
                    height: '30px',
                    background: 'var(--default-border)',
                  }}
                ></div>
                <div className="text-center d-flex align-items-center">
                  <i className="bi bi-droplet-fill text-primary fs-4 me-2"></i>
                  <div className="text-start">
                    <div className="fs-11 text-muted fw-bold text-uppercase">
                      Humidity
                    </div>
                    <div className="fs-16 fw-bold">65%</div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} lg={12}>
          <Card className="custom-card shadow-sm border-0 h-100 overflow-hidden">
            <div
              className="card-bg-gradient"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #198754, #20c997)',
              }}
            ></div>
            <Card.Header className="border-bottom-0 pb-1 pt-3">
              <Card.Title className="fw-bold fs-15 text-success">
                Facility Device Overview
              </Card.Title>
            </Card.Header>
            <Card.Body className="p-3">
              <div className="d-flex align-items-start mb-3">
                <div
                  className="me-3 p-2 bg-light rounded-3 text-center border border-default"
                  style={{ minWidth: '80px' }}
                >
                  <div className="fs-22 fw-bold text-primary lh-1 mb-1">
                    {deviceStats.total}
                  </div>
                  <div className="fs-11 text-muted fw-medium">
                    Total Devices
                  </div>
                </div>
                <div className="flex-fill bg-light rounded-3 p-2 border border-default d-flex justify-content-between">
                  <div className="d-flex flex-column justify-content-center">
                    <i className="bi bi-server text-muted fs-4"></i>
                  </div>
                  <div className="flex-fill ms-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fs-12 fw-medium text-muted">
                        <span className="text-success me-1">●</span>Online
                      </span>
                      <span className="fs-12 fw-bold">
                        {deviceStats.online}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fs-12 fw-medium text-muted">
                        <span className="text-warning me-1">▲</span>Offline
                      </span>
                      <span className="fs-12 fw-bold">
                        {deviceStats.offline}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fs-12 fw-medium text-muted">
                        <span className="text-secondary me-1">●</span>Dormant
                      </span>
                      <span className="fs-12 fw-bold">
                        {deviceStats.dormant}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2">
                <div className="flex-fill bg-light rounded-3 p-2 border border-default">
                  <div className="d-flex justify-content-between mb-1 fs-12">
                    <span className="text-muted fw-medium">
                      <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
                      Electricity
                    </span>
                    <span className="fw-bold">{deviceStats.electricity}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1 fs-12">
                    <span className="text-muted fw-medium">
                      <i className="bi bi-droplet-fill text-info me-1"></i>Water
                    </span>
                    <span className="fw-bold">{deviceStats.water}</span>
                  </div>
                  <div className="d-flex justify-content-between fs-12">
                    <span className="text-muted fw-medium">
                      <i className="bi bi-fire text-danger me-1"></i>Gas
                    </span>
                    <span className="fw-bold">{deviceStats.gas}</span>
                  </div>
                </div>
                <div className="flex-fill bg-light rounded-3 p-2 border border-default">
                  <div className="d-flex justify-content-between mb-1 fs-12 border-bottom border-default pb-1">
                    <span className="text-muted fw-bold">
                      <i className="bi bi-bell-fill text-warning me-1"></i>
                      Active Alerts
                    </span>
                    <span className="fw-bold">{deviceStats.activeAlerts}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1 fs-11 mt-1">
                    <span className="text-muted">
                      <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
                      Electricity
                    </span>
                    <span className="fw-bold">0</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1 fs-11">
                    <span className="text-muted">
                      <i className="bi bi-droplet-fill text-info me-1"></i>Water
                    </span>
                    <span className="fw-bold">0</span>
                  </div>
                  <div className="d-flex justify-content-between fs-11">
                    <span className="text-muted">
                      <i className="bi bi-fire text-danger me-1"></i>Gas
                    </span>
                    <span className="fw-bold">0</span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <FacilityEnergyChart
            facilityId={
              currentFacility
                ? String(currentFacility.id)
                : selectedOrg
                  ? String(facilities[0]?.id || '')
                  : null
            }
          />
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="custom-card shadow-sm border-0">
            <Card.Header className="justify-content-between border-bottom-0 pb-0">
              <Card.Title className="fw-bold fs-16">
                Device Inventory
              </Card.Title>
              {canCreate ? (
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="shadow-sm"
                    onClick={() => setShowAddModal(true)}
                  >
                    <i className="bi bi-plus-lg me-1"></i> Register Device
                  </Button>
                  <Button
                    variant="secondary-light"
                    size="sm"
                    className="shadow-sm border-0"
                    onClick={handleScanNetwork}
                  >
                    <i className="bi bi-broadcast me-1"></i> Scan Network
                  </Button>
                </div>
              ) : null}
            </Card.Header>
            <Card.Body>
              <Row className="mb-4 gy-3 gx-3 bg-primary-transparent p-3 rounded-3 mx-0 border border-primary-transparent">
                <Col xxl={3} xl={4} lg={4} md={6}>
                  <Form.Label className="fs-11 fw-bold text-muted mb-1 text-uppercase">
                    Organization
                  </Form.Label>
                  <Form.Select
                    aria-label="Filter by Organization"
                    size="sm"
                    className="border-default shadow-none"
                    value={selectedOrg}
                    disabled={organizations.length === 0}
                    onChange={(e) => {
                      setSelectedOrg(e.target.value)
                      setSelectedFacility('')
                      setPreselectedFacilityId(null)
                      setCurrentPage(1)
                    }}
                  >
                    {!selectedOrg && (
                      <option value="">Select organization…</option>
                    )}
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xxl={3} xl={4} lg={4} md={6}>
                  <Form.Label className="fs-11 fw-bold text-muted mb-1 text-uppercase">
                    Facility
                  </Form.Label>
                  <Form.Select
                    aria-label="Filter by Facility"
                    size="sm"
                    className="border-default shadow-none"
                    value={selectedFacility}
                    disabled={!selectedOrg || facilities.length === 0}
                    onChange={(e) => handleFacilityChange(e.target.value)}
                  >
                    {!selectedFacility && (
                      <option value="">Select facility…</option>
                    )}
                    <option value="All">All Facilities</option>
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.name}>
                        {fac.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xxl={4} xl={4} lg={4} md={12} className="ms-auto mt-auto">
                  <InputGroup size="sm" className="shadow-none">
                    <Form.Control
                      type="text"
                      placeholder="Search by name, IP, or model..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="border-default"
                    />
                    <Button
                      variant="primary-light"
                      className="border-default border-start-0 px-3"
                    >
                      <i className="bi bi-search"></i>
                    </Button>
                  </InputGroup>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table className="table table-hover text-nowrap align-middle border-0">
                  <thead className="border-0">
                    <tr>
                      <th className="border-0">Device Name</th>
                      <th className="border-0">Facility</th>
                      <th className="border-0">Model & Type</th>
                      <th className="border-0">IP Address</th>
                      <th className="border-0" style={{ width: '150px' }}>
                        Signal
                      </th>
                      <th className="border-0 text-center">Status</th>
                      <th className="border-0 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((device) => (
                        <tr
                          key={device.id}
                          className="border-bottom border-default"
                        >
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="avatar avatar-sm bg-primary-transparent text-primary me-3 avatar-rounded border border-primary-transparent shadow-sm">
                                <i
                                  className={`bi ${device.device_type === 'Gateway' ? 'bi-router' : device.device_type === 'Sensor' ? 'bi-broadcast' : 'bi-cpu'} fs-14`}
                                ></i>
                              </span>
                              <div className="fw-bold fs-14">{device.name}</div>
                            </div>
                          </td>
                          <td>
                            <span className="text-muted fs-13 fw-medium">
                              {device.facility?.name || '—'}
                            </span>
                          </td>
                          <td>
                            <div className="fs-12 fw-bold text-primary">
                              {device.model || '—'}
                            </div>
                            <div className="fs-11 text-muted fw-medium">
                              {device.device_type || '—'}
                            </div>
                          </td>
                          <td>
                            <code className="text-secondary fs-12 px-2 py-1 bg-secondary-transparent rounded border border-secondary-transparent">
                              {device.ip_address || '—'}
                            </code>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="flex-fill">
                                <ProgressBar
                                  variant={getSignalColor(
                                    device.signal_strength ?? 0,
                                  )}
                                  now={device.signal_strength ?? 0}
                                  style={{ height: '4px' }}
                                  className="shadow-none bg-light"
                                />
                              </div>
                              <span
                                className={`fs-10 fw-bold text-${getSignalColor(device.signal_strength ?? 0)}`}
                              >
                                {device.signal_strength != null
                                  ? `${device.signal_strength}%`
                                  : '—'}
                              </span>
                            </div>
                          </td>
                          <td className="text-center">
                            {getStatusBadge(device.status)}
                          </td>
                          <td className="text-end">
                            <div className="d-inline-flex gap-1">
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Configuration</Tooltip>}
                              >
                                <Button
                                  variant="primary-light"
                                  size="sm"
                                  className="btn-icon rounded-pill shadow-sm border-0"
                                >
                                  <i className="bi bi-gear-fill"></i>
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Live Stats</Tooltip>}
                              >
                                <Button
                                  variant="info-light"
                                  size="sm"
                                  className="btn-icon rounded-pill shadow-sm border-0"
                                  onClick={() =>
                                    router.push(
                                      `/monitoring/analysis?device_name=${device.name}`,
                                    )
                                  }
                                >
                                  <i className="bi bi-graph-up-arrow"></i>
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip>View Monitoring Data</Tooltip>
                                }
                              >
                                <Button
                                  variant="teal-light"
                                  size="sm"
                                  className="btn-icon rounded-pill shadow-sm border-0"
                                  onClick={() =>
                                    router.push(
                                      `/monitoring/data?device_name=${encodeURIComponent(device.name)}`,
                                    )
                                  }
                                >
                                  <i className="bi bi-display"></i>
                                </Button>
                              </OverlayTrigger>
                              {canCreate ? (
                                <Button
                                  variant="danger-light"
                                  size="sm"
                                  onClick={() => handleDelete(device.id)}
                                  className="btn-icon rounded-pill shadow-sm border-0"
                                >
                                  <i className="bi bi-trash3"></i>
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-5">
                          <div className="text-muted fs-15">
                            No devices found matching your criteria.
                          </div>
                          <Button
                            variant="link"
                            className="mt-2 fw-semibold"
                            onClick={() => {
                              setSearchQuery('')
                              if (organizations.length > 0) {
                                setSelectedOrg(String(organizations[0].id))
                              }
                              if (facilities.length > 0) {
                                setSelectedFacility(facilities[0].name)
                                setPreselectedFacilityId(
                                  String(facilities[0].id),
                                )
                              } else {
                                setSelectedFacility('All')
                                setPreselectedFacilityId(null)
                              }
                            }}
                          >
                            Clear Filters
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            <Card.Footer className="border-top-0 d-flex align-items-center justify-content-between py-3">
              <span className="text-muted fs-12 fw-medium">
                Showing {currentItems.length > 0 ? indexOfFirstItem + 1 : 0} to{' '}
                {Math.min(indexOfLastItem, filteredDevices.length)} of{' '}
                {filteredDevices.length} devices
              </span>
              <Pagination className="pagination-sm mb-0 shadow-sm">
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                />
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx + 1}
                    active={idx + 1 === currentPage}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                />
              </Pagination>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <Row className="gy-4">
        <Col xxl={6} xl={12}>
          <Card className="custom-card shadow-sm border-0 h-100">
            <Card.Header className="border-bottom-0 pb-2">
              <Card.Title className="fw-bold fs-15">
                System Diagnostics
              </Card.Title>
            </Card.Header>
            <Card.Body className="pt-0">
              <div className="p-3 bg-success-transparent rounded-3 border border-success-transparent mb-3 d-flex align-items-center">
                <div className="avatar avatar-md bg-success text-fixed-white avatar-rounded me-3 shadow-sm">
                  <i className="bi bi-check-lg fs-18"></i>
                </div>
                <div className="flex-fill">
                  <p className="mb-0 fw-bold fs-14 text-success">
                    All Gateways Active
                  </p>
                  <p className="mb-0 text-muted fs-12">
                    System heartbeats are within normal range across all
                    facilities.
                  </p>
                </div>
              </div>
              <div className="p-3 bg-warning-transparent rounded-3 border border-warning-transparent d-flex align-items-center">
                <div className="avatar avatar-md bg-warning text-fixed-white avatar-rounded me-3 shadow-sm">
                  <i className="bi bi-exclamation-triangle fs-18"></i>
                </div>
                <div className="flex-fill">
                  <p className="mb-0 fw-bold fs-14 text-warning">
                    Sensor Latency Warning
                  </p>
                  <p className="mb-0 text-muted fs-12">
                    2 sensors in "Solar Farm East" are experiencing 500ms+
                    latency.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xxl={6} xl={12}>
          <Card className="custom-card shadow-sm border-0 h-100">
            <Card.Header className="border-bottom-0 pb-2">
              <Card.Title className="fw-bold fs-15 text-primary">
                Provisioning Guide
              </Card.Title>
            </Card.Header>
            <Card.Body className="pt-0">
              <div className="timeline-steps">
                <div className="d-flex align-items-start mb-3">
                  <div className="avatar avatar-xs bg-primary text-fixed-white rounded-pill me-3 flex-shrink-0">
                    1
                  </div>
                  <div className="fs-12 text-muted fw-medium mt-1">
                    Configure Gateway with static IP or MAC-reserved DHCP.
                  </div>
                </div>
                <div className="d-flex align-items-start mb-3">
                  <div className="avatar avatar-xs bg-primary text-fixed-white rounded-pill me-3 flex-shrink-0">
                    2
                  </div>
                  <div className="fs-12 text-muted fw-medium mt-1">
                    Scan or manually enter Device Serial/Asset Tag.
                  </div>
                </div>
                <div className="d-flex align-items-start mb-3">
                  <div className="avatar avatar-xs bg-primary text-fixed-white rounded-pill me-3 flex-shrink-0">
                    3
                  </div>
                  <div className="fs-12 text-muted fw-medium mt-1">
                    Map protocol registers (Modbus) or MQTT topics to LyZer
                    tags.
                  </div>
                </div>
              </div>
              <div className="mt-3 text-end">
                <Button
                  variant="link"
                  className="p-0 text-primary fs-12 fw-bold text-decoration-none"
                >
                  Download LyZer SDK <i className="bi bi-download ms-1"></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {canCreate ? (
        <>
          <Modal
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            centered
            size="xl"
          >
            <Modal.Header closeButton className="border-0 pb-0">
              <Modal.Title className="fw-bold text-primary">
                <i className="bi bi-cpu me-2"></i>Register New IIoT Device
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <Form id="device-form" onSubmit={handleFormSubmit}>
                {/* ── Section 1: Identity ── */}
                <div className="p-3 rounded-3 border border-default bg-light mb-4">
                  <p className="fw-bold fs-12 text-uppercase text-muted mb-3">
                    <i className="bi bi-tag me-1"></i> Device Identity
                  </p>
                  <Row className="gy-3">
                    <Col md={12}>
                      <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                        Target Facility
                      </Form.Label>
                      <Form.Select
                        required
                        className="border-default shadow-none"
                        value={formData.facility_id}
                        onChange={(e) =>
                          setField('facility_id', e.target.value)
                        }
                      >
                        <option value="">Select Facility</option>
                        {facilities.map((fac) => (
                          <option key={fac.id} value={fac.id}>
                            {fac.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                        Device Name
                      </Form.Label>
                      <Form.Control
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setField('name', e.target.value)}
                        placeholder="e.g. Main Inlet Meter"
                        className="border-default shadow-none"
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                        Asset Tag / Serial No.
                      </Form.Label>
                      <Form.Control
                        required
                        type="text"
                        value={formData.device_code}
                        onChange={(e) =>
                          setField('device_code', e.target.value)
                        }
                        placeholder="e.g. SN-998122"
                        className="border-default shadow-none"
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                        Device Type
                      </Form.Label>
                      <Form.Select
                        className="border-default shadow-none"
                        value={formData.device_type}
                        onChange={(e) =>
                          setField('device_type', e.target.value)
                        }
                      >
                        {[
                          'Meter',
                          'Gateway',
                          'Sensor',
                          'Inverter',
                          'Controller',
                          'PLC',
                          'Camera',
                        ].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                        Brand
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setField('brand', e.target.value)}
                        placeholder="e.g. Rishabh"
                        className="border-default shadow-none"
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                        Model
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.model}
                        onChange={(e) => setField('model', e.target.value)}
                        placeholder="e.g. R3440"
                        className="border-default shadow-none"
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                        Firmware Version
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.firmware_version}
                        onChange={(e) =>
                          setField('firmware_version', e.target.value)
                        }
                        placeholder="e.g. v2.1.4"
                        className="border-default shadow-none"
                      />
                    </Col>
                  </Row>
                </div>

                {/* ── Section 2: Connection ── */}
                <div className="p-3 rounded-3 border border-default bg-light mb-4">
                  <p className="fw-bold fs-12 text-uppercase text-muted mb-3">
                    <i className="bi bi-hdd-network me-1"></i> Connection &
                    Protocol
                  </p>
                  <Row className="gy-3">
                    <Col md={6}>
                      <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                        Connection Type
                      </Form.Label>
                      <Form.Select
                        className="border-default shadow-none"
                        value={formData.connection_type}
                        onChange={(e) =>
                          setField('connection_type', e.target.value)
                        }
                      >
                        {[
                          'Ethernet',
                          'WiFi',
                          'RS485',
                          'RS232',
                          'LoRaWAN',
                          'Cellular',
                          'Bluetooth',
                          'USB',
                        ].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                        Protocol
                      </Form.Label>
                      <Form.Select
                        className="border-default shadow-none"
                        value={formData.protocol}
                        onChange={(e) => setField('protocol', e.target.value)}
                      >
                        {[
                          'Modbus-TCP',
                          'Modbus-RTU',
                          'MQTT',
                          'HTTP',
                          'HTTPS',
                          'SNMP',
                          'OPC-UA',
                          'DNP3',
                          'BACnet',
                          'IEC-61850',
                        ].map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </Form.Select>
                    </Col>

                    {/* General IP/Port — shown for TCP-based protocols */}
                    {[
                      'Modbus-TCP',
                      'HTTP',
                      'HTTPS',
                      'SNMP',
                      'OPC-UA',
                      'DNP3',
                      'BACnet',
                    ].includes(formData.protocol) && (
                      <>
                        <Col md={8}>
                          <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                            IP Address
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.ip_address}
                            onChange={(e) =>
                              setField('ip_address', e.target.value)
                            }
                            placeholder="192.168.1.100"
                            className="border-default shadow-none"
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                            Port
                          </Form.Label>
                          <Form.Control
                            type="number"
                            value={formData.port}
                            onChange={(e) => setField('port', e.target.value)}
                            placeholder={
                              formData.protocol === 'Modbus-TCP'
                                ? '502'
                                : formData.protocol === 'SNMP'
                                  ? '161'
                                  : '80'
                            }
                            className="border-default shadow-none"
                          />
                        </Col>
                      </>
                    )}

                    {/* MAC Address */}
                    {['Ethernet', 'WiFi'].includes(
                      formData.connection_type,
                    ) && (
                      <Col md={6}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          MAC Address
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.mac_address}
                          onChange={(e) =>
                            setField('mac_address', e.target.value)
                          }
                          placeholder="AA:BB:CC:DD:EE:FF"
                          className="border-default shadow-none"
                        />
                      </Col>
                    )}
                  </Row>
                </div>

                {/* ── Section 3: Modbus RTU params ── */}
                {formData.protocol === 'Modbus-RTU' && (
                  <div className="p-3 rounded-3 border border-warning-transparent bg-warning-transparent mb-4">
                    <p className="fw-bold fs-12 text-uppercase text-warning mb-3">
                      <i className="bi bi-usb-plug me-1"></i> Modbus RTU / RS485
                      Parameters
                    </p>
                    <Row className="gy-3">
                      <Col md={4}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Slave ID (Unit ID)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min={1}
                          max={247}
                          value={formData.modbus_slave_id}
                          onChange={(e) =>
                            setField('modbus_slave_id', e.target.value)
                          }
                          placeholder="1 – 247"
                          className="border-default shadow-none"
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Baud Rate
                        </Form.Label>
                        <Form.Select
                          className="border-default shadow-none"
                          value={formData.modbus_baudrate}
                          onChange={(e) =>
                            setField('modbus_baudrate', e.target.value)
                          }
                        >
                          {[
                            '1200',
                            '2400',
                            '4800',
                            '9600',
                            '19200',
                            '38400',
                            '57600',
                            '115200',
                          ].map((b) => (
                            <option key={b}>{b}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={4}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Parity
                        </Form.Label>
                        <Form.Select
                          className="border-default shadow-none"
                          value={formData.modbus_parity}
                          onChange={(e) =>
                            setField('modbus_parity', e.target.value)
                          }
                        >
                          {['None', 'Even', 'Odd'].map((p) => (
                            <option key={p}>{p}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={4}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Data Bits
                        </Form.Label>
                        <Form.Select
                          className="border-default shadow-none"
                          value={formData.modbus_data_bits}
                          onChange={(e) =>
                            setField('modbus_data_bits', e.target.value)
                          }
                        >
                          {['7', '8'].map((d) => (
                            <option key={d}>{d}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={4}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Stop Bits
                        </Form.Label>
                        <Form.Select
                          className="border-default shadow-none"
                          value={formData.modbus_stop_bits}
                          onChange={(e) =>
                            setField('modbus_stop_bits', e.target.value)
                          }
                        >
                          {['1', '2'].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* ── Section 4: MQTT params ── */}
                {formData.protocol === 'MQTT' && (
                  <div className="p-3 rounded-3 border border-info-transparent bg-info-transparent mb-4">
                    <p className="fw-bold fs-12 text-uppercase text-info mb-3">
                      <i className="bi bi-diagram-3 me-1"></i> MQTT Parameters
                    </p>
                    <Row className="gy-3">
                      <Col md={8}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Broker Host
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.mqtt_broker_host}
                          onChange={(e) =>
                            setField('mqtt_broker_host', e.target.value)
                          }
                          placeholder="broker.hivemq.com"
                          className="border-default shadow-none"
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Port
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={formData.port}
                          onChange={(e) => setField('port', e.target.value)}
                          placeholder="1883"
                          className="border-default shadow-none"
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Client ID
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.mqtt_client_id}
                          onChange={(e) =>
                            setField('mqtt_client_id', e.target.value)
                          }
                          placeholder="lyzer-device-001"
                          className="border-default shadow-none"
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          QoS Level
                        </Form.Label>
                        <Form.Select
                          className="border-default shadow-none"
                          value={formData.mqtt_qos}
                          onChange={(e) => setField('mqtt_qos', e.target.value)}
                        >
                          {['0', '1', '2'].map((q) => (
                            <option key={q} value={q}>
                              QoS {q}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={3} className="d-flex align-items-end">
                        <Form.Check
                          type="switch"
                          id="mqtt-tls"
                          label="TLS / SSL"
                          checked={formData.mqtt_tls_enabled}
                          onChange={(e) =>
                            setField('mqtt_tls_enabled', e.target.checked)
                          }
                          className="fw-semibold fs-13"
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Publish Topic
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.mqtt_topic_pub}
                          onChange={(e) =>
                            setField('mqtt_topic_pub', e.target.value)
                          }
                          placeholder="lyzer/device/data"
                          className="border-default shadow-none"
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Subscribe Topic
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.mqtt_topic_sub}
                          onChange={(e) =>
                            setField('mqtt_topic_sub', e.target.value)
                          }
                          placeholder="lyzer/device/cmd"
                          className="border-default shadow-none"
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Username
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.mqtt_username}
                          onChange={(e) =>
                            setField('mqtt_username', e.target.value)
                          }
                          placeholder="(optional)"
                          className="border-default shadow-none"
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          value={formData.mqtt_password}
                          onChange={(e) =>
                            setField('mqtt_password', e.target.value)
                          }
                          placeholder="(optional)"
                          className="border-default shadow-none"
                        />
                      </Col>
                    </Row>
                  </div>
                )}

                {/* ── Section 5: SNMP params ── */}
                {formData.protocol === 'SNMP' && (
                  <div className="p-3 rounded-3 border border-secondary-transparent bg-secondary-transparent mb-4">
                    <p className="fw-bold fs-12 text-uppercase text-secondary mb-3">
                      <i className="bi bi-shield-lock me-1"></i> SNMP Parameters
                    </p>
                    <Row className="gy-3">
                      <Col md={4}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          SNMP Version
                        </Form.Label>
                        <Form.Select
                          className="border-default shadow-none"
                          value={formData.snmp_version}
                          onChange={(e) =>
                            setField('snmp_version', e.target.value)
                          }
                        >
                          {['v1', 'v2c', 'v3'].map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      {['v1', 'v2c'].includes(formData.snmp_version) && (
                        <Col md={8}>
                          <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                            Community String
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.snmp_community}
                            onChange={(e) =>
                              setField('snmp_community', e.target.value)
                            }
                            placeholder="public"
                            className="border-default shadow-none"
                          />
                        </Col>
                      )}
                      {formData.snmp_version === 'v3' && (
                        <>
                          <Col md={8}>
                            <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                              Security Username
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.snmp_username}
                              onChange={(e) =>
                                setField('snmp_username', e.target.value)
                              }
                              className="border-default shadow-none"
                            />
                          </Col>
                          <Col md={6}>
                            <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                              Auth Protocol
                            </Form.Label>
                            <Form.Select
                              className="border-default shadow-none"
                              value={formData.snmp_auth_protocol}
                              onChange={(e) =>
                                setField('snmp_auth_protocol', e.target.value)
                              }
                            >
                              <option value="">None</option>
                              {['MD5', 'SHA', 'SHA-256', 'SHA-512'].map((a) => (
                                <option key={a}>{a}</option>
                              ))}
                            </Form.Select>
                          </Col>
                          <Col md={6}>
                            <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                              Auth Password
                            </Form.Label>
                            <Form.Control
                              type="password"
                              value={formData.snmp_auth_password}
                              onChange={(e) =>
                                setField('snmp_auth_password', e.target.value)
                              }
                              className="border-default shadow-none"
                            />
                          </Col>
                          <Col md={6}>
                            <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                              Privacy Protocol
                            </Form.Label>
                            <Form.Select
                              className="border-default shadow-none"
                              value={formData.snmp_priv_protocol}
                              onChange={(e) =>
                                setField('snmp_priv_protocol', e.target.value)
                              }
                            >
                              <option value="">None</option>
                              {['DES', 'AES', 'AES-256'].map((p) => (
                                <option key={p}>{p}</option>
                              ))}
                            </Form.Select>
                          </Col>
                          <Col md={6}>
                            <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                              Privacy Password
                            </Form.Label>
                            <Form.Control
                              type="password"
                              value={formData.snmp_priv_password}
                              onChange={(e) =>
                                setField('snmp_priv_password', e.target.value)
                              }
                              className="border-default shadow-none"
                            />
                          </Col>
                        </>
                      )}
                    </Row>
                  </div>
                )}

                {/* ── Section 6: OPC-UA params ── */}
                {formData.protocol === 'OPC-UA' && (
                  <div className="p-3 rounded-3 border border-primary-transparent bg-primary-transparent mb-4">
                    <p className="fw-bold fs-12 text-uppercase text-primary mb-3">
                      <i className="bi bi-link-45deg me-1"></i> OPC-UA
                      Parameters
                    </p>
                    <Row className="gy-3">
                      <Col md={12}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Endpoint URL
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.opcua_endpoint_url}
                          onChange={(e) =>
                            setField('opcua_endpoint_url', e.target.value)
                          }
                          placeholder="opc.tcp://192.168.1.100:4840/"
                          className="border-default shadow-none"
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Namespace URI
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.opcua_namespace_uri}
                          onChange={(e) =>
                            setField('opcua_namespace_uri', e.target.value)
                          }
                          placeholder="urn:MyDevice:Namespace"
                          className="border-default shadow-none"
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Security Mode
                        </Form.Label>
                        <Form.Select
                          className="border-default shadow-none"
                          value={formData.opcua_security_mode}
                          onChange={(e) =>
                            setField('opcua_security_mode', e.target.value)
                          }
                        >
                          {['None', 'Sign', 'SignAndEncrypt'].map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* ── Section 7: HTTP params ── */}
                {['HTTP', 'HTTPS'].includes(formData.protocol) && (
                  <div className="p-3 rounded-3 border border-success-transparent bg-success-transparent mb-4">
                    <p className="fw-bold fs-12 text-uppercase text-success mb-3">
                      <i className="bi bi-globe me-1"></i> HTTP / REST
                      Parameters
                    </p>
                    <Row className="gy-3">
                      <Col md={12}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Base URL
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.http_base_url}
                          onChange={(e) =>
                            setField('http_base_url', e.target.value)
                          }
                          placeholder="https://api.device.local/v1"
                          className="border-default shadow-none"
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Auth Type
                        </Form.Label>
                        <Form.Select
                          className="border-default shadow-none"
                          value={formData.http_auth_type}
                          onChange={(e) =>
                            setField('http_auth_type', e.target.value)
                          }
                        >
                          {['None', 'Basic', 'Bearer', 'API-Key', 'OAuth2'].map(
                            (a) => (
                              <option key={a}>{a}</option>
                            ),
                          )}
                        </Form.Select>
                      </Col>
                      {formData.http_auth_type !== 'None' && (
                        <Col md={8}>
                          <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                            {formData.http_auth_type === 'API-Key'
                              ? 'API Key'
                              : 'Token / Credential'}
                          </Form.Label>
                          <Form.Control
                            type="password"
                            value={formData.http_api_key}
                            onChange={(e) =>
                              setField('http_api_key', e.target.value)
                            }
                            className="border-default shadow-none"
                          />
                        </Col>
                      )}
                      <Col md={4}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Poll Interval (sec)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={formData.http_poll_interval_sec}
                          onChange={(e) =>
                            setField('http_poll_interval_sec', e.target.value)
                          }
                          placeholder="60"
                          className="border-default shadow-none"
                        />
                      </Col>
                    </Row>
                  </div>
                )}

                {/* ── Section 8: LoRaWAN params ── */}
                {formData.connection_type === 'LoRaWAN' && (
                  <div className="p-3 rounded-3 border border-warning-transparent bg-warning-transparent mb-4">
                    <p className="fw-bold fs-12 text-uppercase text-warning mb-3">
                      <i className="bi bi-broadcast me-1"></i> LoRaWAN
                      Parameters
                    </p>
                    <Row className="gy-3">
                      <Col md={6}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Device EUI (DevEUI)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          maxLength={16}
                          value={formData.lorawan_dev_eui}
                          onChange={(e) =>
                            setField('lorawan_dev_eui', e.target.value)
                          }
                          placeholder="0000000000000000"
                          className="border-default shadow-none"
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Application EUI (AppEUI)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          maxLength={16}
                          value={formData.lorawan_app_eui}
                          onChange={(e) =>
                            setField('lorawan_app_eui', e.target.value)
                          }
                          placeholder="0000000000000000"
                          className="border-default shadow-none"
                        />
                      </Col>
                      <Col md={8}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          App Key
                        </Form.Label>
                        <Form.Control
                          type="password"
                          maxLength={32}
                          value={formData.lorawan_app_key}
                          onChange={(e) =>
                            setField('lorawan_app_key', e.target.value)
                          }
                          className="border-default shadow-none"
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="fw-semibold text-muted fs-11 text-uppercase">
                          Device Class
                        </Form.Label>
                        <Form.Select
                          className="border-default shadow-none"
                          value={formData.lorawan_class}
                          onChange={(e) =>
                            setField('lorawan_class', e.target.value)
                          }
                        >
                          {['A', 'B', 'C'].map((c) => (
                            <option key={c}>Class {c}</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </div>
                )}
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
              <Button
                type="button"
                variant="light"
                className="px-4"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="device-form"
                variant="primary"
                className="px-4 shadow-sm"
              >
                <i className="bi bi-cpu me-1"></i> Register Device
              </Button>
            </Modal.Footer>
          </Modal>

          {/* ── Scan Network Modal ── */}
          <Modal
            show={showScanModal}
            onHide={() => setShowScanModal(false)}
            centered
            size="xl"
          >
            <Modal.Header closeButton className="border-0 pb-0">
              <Modal.Title className="fw-bold text-primary">
                <i className="bi bi-broadcast me-2"></i>Discovered Acuvim
                Devices
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              {/* ── Scanning spinner ── */}
              {scanning && (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                  />
                  <p className="text-muted fw-medium fs-14">
                    Querying telemetry database…
                  </p>
                </div>
              )}

              {/* ── Error ── */}
              {scanError && !scanning && (
                <div className="alert alert-danger d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill fs-16"></i>
                  <span>{scanError}</span>
                </div>
              )}

              {/* ── Empty ── */}
              {!scanning &&
                !scanError &&
                scanResults.length === 0 &&
                scanRegisteredElsewhere.length === 0 && (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                    <p className="text-muted fw-medium mb-1">
                      No Acuvim devices found in telemetry data.
                    </p>
                    <p className="text-muted fs-12 mb-0">
                      Ensure the gateway has sent data to monitoring_acuvim with
                      a valid device serial.
                    </p>
                  </div>
                )}

              {!scanning &&
                !scanError &&
                scanResults.length === 0 &&
                scanRegisteredElsewhere.length > 0 && (
                  <div className="alert alert-info py-2 mb-3 fs-13">
                    <i className="bi bi-info-circle me-1"></i>
                    All discovered devices are already registered in the system
                    {selectedOrg
                      ? ' (they may belong to another organization or facility)'
                      : ''}
                    . See the list below for where each device is registered.
                  </div>
                )}

              {/* ── Bulk progress ── */}
              {bulkProgress && (
                <div
                  className={`alert ${bulkProgress.errors.length > 0 ? 'alert-warning' : 'alert-success'} py-2 mb-3`}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-semibold fs-13">
                      {bulkRegistering
                        ? `Registering… ${bulkProgress.done} / ${bulkProgress.total}`
                        : `Done — ${bulkProgress.total - bulkProgress.errors.length} registered, ${bulkProgress.errors.length} failed`}
                    </span>
                  </div>
                  <ProgressBar
                    now={(bulkProgress.done / bulkProgress.total) * 100}
                    variant={
                      bulkProgress.errors.length > 0 ? 'warning' : 'success'
                    }
                    style={{ height: 4 }}
                    className="mb-2"
                  />
                  {bulkProgress.errors.length > 0 && (
                    <ul className="mb-0 ps-3 fs-12 text-danger">
                      {bulkProgress.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* ── Results table ── */}
              {!scanning && scanResults.length > 0 && (
                <>
                  {/* Toolbar */}
                  <div className="d-flex align-items-center justify-content-between mb-3 gap-3 flex-wrap">
                    <span className="text-muted fs-12">
                      <i className="bi bi-info-circle me-1"></i>
                      {scanResults.length} new device
                      {scanResults.length !== 1 ? 's' : ''} found.
                      {selectedScanKeys.size > 0 && (
                        <strong className="text-primary ms-2">
                          {selectedScanKeys.size} selected
                        </strong>
                      )}
                    </span>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <Form.Select
                        size="sm"
                        className="border-default shadow-none"
                        style={{ minWidth: 180 }}
                        value={bulkFacilityId}
                        onChange={(e) => setBulkFacilityId(e.target.value)}
                      >
                        <option value="">— Select Facility —</option>
                        {facilities.map((fac) => (
                          <option key={fac.id} value={fac.id}>
                            {fac.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Button
                        variant="success"
                        size="sm"
                        className="shadow-sm px-3"
                        disabled={
                          selectedScanKeys.size === 0 ||
                          !bulkFacilityId ||
                          bulkRegistering
                        }
                        onClick={handleBulkRegister}
                      >
                        {bulkRegistering ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" />
                            Registering…
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cloud-upload me-1"></i>Register
                            Selected ({selectedScanKeys.size})
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <Table className="table table-hover align-middle text-nowrap border-0 fs-13">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0" style={{ width: 40 }}>
                            <Form.Check
                              type="checkbox"
                              id="scan-select-all"
                              checked={
                                selectedScanKeys.size === scanResults.length &&
                                scanResults.length > 0
                              }
                              onChange={toggleSelectAll}
                              className="shadow-none"
                            />
                          </th>
                          <th className="border-0 fw-bold text-uppercase fs-11 text-muted">
                            Gateway
                          </th>
                          <th className="border-0 fw-bold text-uppercase fs-11 text-muted">
                            Gateway Serial
                          </th>
                          <th className="border-0 fw-bold text-uppercase fs-11 text-muted">
                            Device Name
                          </th>
                          <th className="border-0 fw-bold text-uppercase fs-11 text-muted">
                            Device Model
                          </th>
                          <th className="border-0 fw-bold text-uppercase fs-11 text-muted">
                            Device Serial
                          </th>
                          <th className="border-0 text-end">Fill Form</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scanResults.map((item, idx) => {
                          const key = scanItemKey(item)
                          const checked = selectedScanKeys.has(key)
                          return (
                            <tr
                              key={idx}
                              className={`border-bottom border-default${checked ? ' table-primary' : ''}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleScanItem(item)}
                            >
                              <td onClick={(e) => e.stopPropagation()}>
                                <Form.Check
                                  type="checkbox"
                                  id={`scan-item-${idx}`}
                                  checked={checked}
                                  onChange={() => toggleScanItem(item)}
                                  className="shadow-none"
                                />
                              </td>
                              <td>
                                <span className="d-flex align-items-center gap-2">
                                  <span className="avatar avatar-xs bg-primary-transparent text-primary avatar-rounded border border-primary-transparent">
                                    <i className="bi bi-router fs-11"></i>
                                  </span>
                                  <span className="fw-semibold">
                                    {item.gateway_name || '—'}
                                  </span>
                                </span>
                              </td>
                              <td>
                                <code className="text-secondary fs-11 px-2 py-1 bg-secondary-transparent rounded border border-secondary-transparent">
                                  {item.gateway_serial || '—'}
                                </code>
                              </td>
                              <td>
                                <span className="d-flex align-items-center gap-2">
                                  <span className="avatar avatar-xs bg-success-transparent text-success avatar-rounded border border-success-transparent">
                                    <i className="bi bi-cpu fs-11"></i>
                                  </span>
                                  <span className="fw-semibold">
                                    {item.device_name || '—'}
                                  </span>
                                </span>
                              </td>
                              <td className="text-muted">
                                {item.device_model || '—'}
                              </td>
                              <td>
                                <code className="text-secondary fs-11 px-2 py-1 bg-secondary-transparent rounded border border-secondary-transparent">
                                  {item.device_serial || '—'}
                                </code>
                              </td>
                              <td
                                className="text-end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip>Fill registration form</Tooltip>
                                  }
                                >
                                  <Button
                                    size="sm"
                                    variant="primary-light"
                                    className="btn-icon rounded-pill shadow-sm border-0"
                                    onClick={() => handleUseScannedDevice(item)}
                                  >
                                    <i className="bi bi-box-arrow-in-right"></i>
                                  </Button>
                                </OverlayTrigger>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                  </div>
                </>
              )}

              {!scanning && scanRegisteredElsewhere.length > 0 && (
                <div className="mt-2">
                  <h6 className="fw-bold fs-13 text-muted text-uppercase mb-3">
                    Already registered ({scanRegisteredElsewhere.length})
                  </h6>
                  <div className="table-responsive">
                    <Table className="table table-sm align-middle text-nowrap border-0 fs-13 mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0 fw-bold text-uppercase fs-11 text-muted">
                            Telemetry Name
                          </th>
                          <th className="border-0 fw-bold text-uppercase fs-11 text-muted">
                            Serial
                          </th>
                          <th className="border-0 fw-bold text-uppercase fs-11 text-muted">
                            Registered As
                          </th>
                          <th className="border-0 fw-bold text-uppercase fs-11 text-muted">
                            Organization
                          </th>
                          <th className="border-0 fw-bold text-uppercase fs-11 text-muted">
                            Facility
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {scanRegisteredElsewhere.map((item, idx) => (
                          <tr
                            key={idx}
                            className="border-bottom border-default"
                          >
                            <td className="fw-semibold">
                              {item.device_name || '—'}
                            </td>
                            <td>
                              <code className="text-secondary fs-11 px-2 py-1 bg-secondary-transparent rounded border border-secondary-transparent">
                                {item.device_serial || '—'}
                              </code>
                            </td>
                            <td>{item.registered_name || '—'}</td>
                            <td>{item.organization_name || '—'}</td>
                            <td>{item.facility_name || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
              <Button
                variant="light"
                className="px-4"
                onClick={() => setShowScanModal(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : null}
    </React.Fragment>
  )
}

export default DevicesPage
