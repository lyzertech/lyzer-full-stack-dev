'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row, Form } from 'react-bootstrap'
import { useRouter, useParams } from 'next/navigation'
import {
  getEngineeringWikiById,
  updateEngineeringWiki,
  getDistinctBrands,
  getDistinctDeviceTypes,
  getDistinctModels,
  getDistinctFirmwareVersions,
  getDistinctHardwareVersions,
} from '@/app/actions/labs/engineering-wiki.actions'
import type { EngineeringWiki } from '@/lib/labs/repositories/engineering-wiki.repository'
import type { UpdateEngineeringWikiInput } from '@/lib/labs/repositories/engineering-wiki.repository'

const EditEngineeringWikiPage: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const id = BigInt(params.id as string)
  const [wiki, setWiki] = useState<EngineeringWiki | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brands, setBrands] = useState<string[]>([])
  const [deviceTypes, setDeviceTypes] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  const [firmwareVersions, setFirmwareVersions] = useState<string[]>([])
  const [hardwareVersions, setHardwareVersions] = useState<string[]>([])
  const [form, setForm] = useState<UpdateEngineeringWikiInput>({
    id,
    title: '',
    customer_name: '',
    category: 'note',
    brand: '',
    device_type: '',
    model: '',
    serial_number: '',
    firmware_version: '',
    hardware_version: '',
    symptom: '',
    root_cause: '',
    solution: '',
    action_taken: '',
    status: 'open',
    priority: 'medium',
    reference_doc: '',
  })
  // File state for each section
  const [symptomFile, setSymptomFile] = useState<File | null>(null)
  const [symptomImage, setSymptomImage] = useState<File | null>(null)
  const [rootCauseFile, setRootCauseFile] = useState<File | null>(null)
  const [rootCauseImage, setRootCauseImage] = useState<File | null>(null)
  const [solutionFile, setSolutionFile] = useState<File | null>(null)
  const [solutionImage, setSolutionImage] = useState<File | null>(null)
  const [actionTakenFile, setActionTakenFile] = useState<File | null>(null)
  const [actionTakenImage, setActionTakenImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadWiki()
    loadDistinctValues()
  }, [id])

  async function loadWiki() {
    setLoading(true)
    setError(null)
    try {
      const data = await getEngineeringWikiById(id)
      if (!data) {
        setError('Engineering wiki not found')
        return
      }
      setWiki(data)
      setForm({
        id: data.id,
        title: data.title,
        customer_name: data.customer_name || '',
        category: data.category,
        brand: data.brand || '',
        device_type: data.device_type || '',
        model: data.model || '',
        serial_number: data.serial_number || '',
        firmware_version: data.firmware_version || '',
        hardware_version: data.hardware_version || '',
        symptom: data.symptom || '',
        symptom_file: data.symptom_file || '',
        symptom_image: data.symptom_image || '',
        root_cause: data.root_cause || '',
        root_cause_file: data.root_cause_file || '',
        root_cause_image: data.root_cause_image || '',
        solution: data.solution || '',
        solution_file: data.solution_file || '',
        solution_image: data.solution_image || '',
        action_taken: data.action_taken || '',
        action_taken_file: data.action_taken_file || '',
        action_taken_image: data.action_taken_image || '',
        status: data.status,
        priority: data.priority,
        reference_doc: data.reference_doc || '',
      })
    } catch (err: any) {
      console.error('Error loading engineering wiki:', err)
      setError(err.message || 'Failed to load engineering wiki')
    } finally {
      setLoading(false)
    }
  }

  async function loadDistinctValues() {
    try {
      const [brandsData, deviceTypesData, modelsData, firmwareData, hardwareData] =
        await Promise.all([
          getDistinctBrands(),
          getDistinctDeviceTypes(),
          getDistinctModels(),
          getDistinctFirmwareVersions(),
          getDistinctHardwareVersions(),
        ])
      setBrands(brandsData)
      setDeviceTypes(deviceTypesData)
      setModels(modelsData)
      setFirmwareVersions(firmwareData)
      setHardwareVersions(hardwareData)
    } catch (err) {
      console.error('Error loading distinct values:', err)
    }
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string, inputId: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
    const input = document.getElementById(inputId) as HTMLInputElement
    if (input) {
      input.value = value
    }
  }

  const handleInputChange = (name: string, value: string, selectId: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
    const select = document.getElementById(selectId) as HTMLSelectElement
    if (select) {
      select.value = ''
    }
  }

  const handleFileChange = (
    field: 'symptom' | 'root_cause' | 'solution' | 'action_taken',
    type: 'file' | 'image',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'file') {
      if (field === 'symptom') setSymptomFile(file)
      if (field === 'root_cause') setRootCauseFile(file)
      if (field === 'solution') setSolutionFile(file)
      if (field === 'action_taken') setActionTakenFile(file)
    } else {
      if (field === 'symptom') setSymptomImage(file)
      if (field === 'root_cause') setRootCauseImage(file)
      if (field === 'solution') setSolutionImage(file)
      if (field === 'action_taken') setActionTakenImage(file)
    }
  }

  const uploadFile = async (file: File, type: 'file' | 'image'): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const data = await response.json()
      return data.path
    } catch (error) {
      console.error('Error uploading file:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setUploading(true)
    setError(null)
    try {
      // Upload all new files first and collect paths
      const uploadPromises: Promise<{ field: string; path: string | null }>[] = []

      if (symptomFile) {
        uploadPromises.push(
          uploadFile(symptomFile, 'file').then((path) => ({ field: 'symptom_file', path }))
        )
      }
      if (symptomImage) {
        uploadPromises.push(
          uploadFile(symptomImage, 'image').then((path) => ({ field: 'symptom_image', path }))
        )
      }
      if (rootCauseFile) {
        uploadPromises.push(
          uploadFile(rootCauseFile, 'file').then((path) => ({ field: 'root_cause_file', path }))
        )
      }
      if (rootCauseImage) {
        uploadPromises.push(
          uploadFile(rootCauseImage, 'image').then((path) => ({ field: 'root_cause_image', path }))
        )
      }
      if (solutionFile) {
        uploadPromises.push(
          uploadFile(solutionFile, 'file').then((path) => ({ field: 'solution_file', path }))
        )
      }
      if (solutionImage) {
        uploadPromises.push(
          uploadFile(solutionImage, 'image').then((path) => ({ field: 'solution_image', path }))
        )
      }
      if (actionTakenFile) {
        uploadPromises.push(
          uploadFile(actionTakenFile, 'file').then((path) => ({ field: 'action_taken_file', path }))
        )
      }
      if (actionTakenImage) {
        uploadPromises.push(
          uploadFile(actionTakenImage, 'image').then((path) => ({ field: 'action_taken_image', path }))
        )
      }

      const uploadResults = await Promise.all(uploadPromises)
      setUploading(false)

      // Update form with all uploaded file paths
      const updatedForm = { ...form }
      uploadResults.forEach(({ field, path }) => {
        if (path) {
          ;(updatedForm as any)[field] = path
        }
      })

      // Now update the wiki entry
      await updateEngineeringWiki(updatedForm)
      router.push('/labs/engineering-wiki')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to update engineering wiki')
      setUploading(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Fragment>
        <Seo title="Edit Engineering Wiki" />
        <Pageheader
          title="Labs"
          subtitle="Engineering Wiki"
          currentpage="Edit Engineering Wiki"
          activepage="Edit Engineering Wiki"
        />
        <div className="text-center">Loading...</div>
      </Fragment>
    )
  }

  if (!wiki) {
    return (
      <Fragment>
        <Seo title="Edit Engineering Wiki" />
        <Pageheader
          title="Labs"
          subtitle="Engineering Wiki"
          currentpage="Edit Engineering Wiki"
          activepage="Edit Engineering Wiki"
        />
        <div className="alert alert-danger">Engineering wiki not found</div>
      </Fragment>
    )
  }

  return (
    <Fragment>
      <Seo title="Edit Engineering Wiki" />
      <Pageheader
        title="Labs"
        subtitle="Engineering Wiki"
        currentpage="Edit Engineering Wiki"
        activepage="Edit Engineering Wiki"
      />

      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="fw-bold py-3 mb-0">Edit Engineering Wiki</h4>
            <Button variant="outline-secondary" onClick={() => router.push('/labs/engineering-wiki')}>
              Back
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Body>
              {error && <div className="alert alert-danger mb-3">{error}</div>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title *</Form.Label>
                      <Form.Control
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Customer Name</Form.Label>
                      <Form.Control
                        name="customer_name"
                        value={form.customer_name || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select</option>
                        <option value="issue">Issue</option>
                        <option value="update">Update</option>
                        <option value="note">Note</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Brand</Form.Label>
                      <Form.Control
                        name="brand"
                        value={form.brand || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Device Type</Form.Label>
                      <Form.Control
                        name="device_type"
                        value={form.device_type || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Model</Form.Label>
                      <Form.Control
                        name="model"
                        value={form.model || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Serial Number</Form.Label>
                      <Form.Control
                        name="serial_number"
                        value={form.serial_number || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Firmware Version</Form.Label>
                      <Form.Control
                        name="firmware_version"
                        value={form.firmware_version || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Hardware Version</Form.Label>
                      <Form.Control
                        name="hardware_version"
                        value={form.hardware_version || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Symptom</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="symptom"
                        value={form.symptom || ''}
                        onChange={handleChange}
                      />
                      {wiki.symptom_file && (
                        <div className="mt-2">
                          <a href={wiki.symptom_file} target="_blank" className="me-2">
                            <i className="ri-attachment-line me-1"></i>Current File
                          </a>
                        </div>
                      )}
                      {wiki.symptom_image && (
                        <div className="mt-2">
                          <a href={wiki.symptom_image} target="_blank">
                            <img
                              src={wiki.symptom_image}
                              alt="Symptom"
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'contain',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                background: '#f8f9fa',
                              }}
                            />
                            <i className="ri-camera-line ms-1"></i>
                          </a>
                        </div>
                      )}
                      <div className="mt-2 d-flex flex-column gap-2" style={{ minWidth: '120px' }}>
                        <Form.Label className="custom-file-label" style={{ cursor: 'pointer' }}>
                          <i className="ri-attachment-line me-2"></i>
                          <span>Attach File {symptomFile && `(${symptomFile.name})`}</span>
                          <Form.Control
                            type="file"
                            className="d-none"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.csv,.ppt,.pptx"
                            onChange={(e) => handleFileChange('symptom', 'file', e as any)}
                          />
                        </Form.Label>
                        <Form.Label className="custom-file-label" style={{ cursor: 'pointer' }}>
                          <i className="ri-camera-line me-2"></i>
                          <span>Choose Image {symptomImage && `(${symptomImage.name})`}</span>
                          <Form.Control
                            type="file"
                            className="d-none"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange('symptom', 'image', e as any)}
                          />
                        </Form.Label>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Root Cause</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="root_cause"
                        value={form.root_cause || ''}
                        onChange={handleChange}
                      />
                      {wiki.root_cause_file && (
                        <div className="mt-2">
                          <a href={wiki.root_cause_file} target="_blank" className="me-2">
                            <i className="ri-attachment-line me-1"></i>Current File
                          </a>
                        </div>
                      )}
                      {wiki.root_cause_image && (
                        <div className="mt-2">
                          <a href={wiki.root_cause_image} target="_blank">
                            <img
                              src={wiki.root_cause_image}
                              alt="Root Cause"
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'contain',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                background: '#f8f9fa',
                              }}
                            />
                            <i className="ri-camera-line ms-1"></i>
                          </a>
                        </div>
                      )}
                      <div className="mt-2 d-flex flex-column gap-2" style={{ minWidth: '120px' }}>
                        <Form.Label className="custom-file-label" style={{ cursor: 'pointer' }}>
                          <i className="ri-attachment-line me-2"></i>
                          <span>Attach File {rootCauseFile && `(${rootCauseFile.name})`}</span>
                          <Form.Control
                            type="file"
                            className="d-none"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.csv,.ppt,.pptx"
                            onChange={(e) => handleFileChange('root_cause', 'file', e as any)}
                          />
                        </Form.Label>
                        <Form.Label className="custom-file-label" style={{ cursor: 'pointer' }}>
                          <i className="ri-camera-line me-2"></i>
                          <span>Choose Image {rootCauseImage && `(${rootCauseImage.name})`}</span>
                          <Form.Control
                            type="file"
                            className="d-none"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange('root_cause', 'image', e as any)}
                          />
                        </Form.Label>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Solution</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="solution"
                        value={form.solution || ''}
                        onChange={handleChange}
                      />
                      {wiki.solution_file && (
                        <div className="mt-2">
                          <a href={wiki.solution_file} target="_blank" className="me-2">
                            <i className="ri-attachment-line me-1"></i>Current File
                          </a>
                        </div>
                      )}
                      {wiki.solution_image && (
                        <div className="mt-2">
                          <a href={wiki.solution_image} target="_blank">
                            <img
                              src={wiki.solution_image}
                              alt="Solution"
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'contain',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                background: '#f8f9fa',
                              }}
                            />
                            <i className="ri-camera-line ms-1"></i>
                          </a>
                        </div>
                      )}
                      <div className="mt-2 d-flex flex-column gap-2" style={{ minWidth: '120px' }}>
                        <Form.Label className="custom-file-label" style={{ cursor: 'pointer' }}>
                          <i className="ri-attachment-line me-2"></i>
                          <span>Attach File {solutionFile && `(${solutionFile.name})`}</span>
                          <Form.Control
                            type="file"
                            className="d-none"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.csv,.ppt,.pptx"
                            onChange={(e) => handleFileChange('solution', 'file', e as any)}
                          />
                        </Form.Label>
                        <Form.Label className="custom-file-label" style={{ cursor: 'pointer' }}>
                          <i className="ri-camera-line me-2"></i>
                          <span>Choose Image {solutionImage && `(${solutionImage.name})`}</span>
                          <Form.Control
                            type="file"
                            className="d-none"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange('solution', 'image', e as any)}
                          />
                        </Form.Label>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Action Taken</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="action_taken"
                        value={form.action_taken || ''}
                        onChange={handleChange}
                      />
                      {wiki.action_taken_file && (
                        <div className="mt-2">
                          <a href={wiki.action_taken_file} target="_blank" className="me-2">
                            <i className="ri-attachment-line me-1"></i>Current File
                          </a>
                        </div>
                      )}
                      {wiki.action_taken_image && (
                        <div className="mt-2">
                          <a href={wiki.action_taken_image} target="_blank">
                            <img
                              src={wiki.action_taken_image}
                              alt="Action Taken"
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'contain',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                background: '#f8f9fa',
                              }}
                            />
                            <i className="ri-camera-line ms-1"></i>
                          </a>
                        </div>
                      )}
                      <div className="mt-2 d-flex flex-column gap-2" style={{ minWidth: '120px' }}>
                        <Form.Label className="custom-file-label" style={{ cursor: 'pointer' }}>
                          <i className="ri-attachment-line me-2"></i>
                          <span>Attach File {actionTakenFile && `(${actionTakenFile.name})`}</span>
                          <Form.Control
                            type="file"
                            className="d-none"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.csv,.ppt,.pptx"
                            onChange={(e) => handleFileChange('action_taken', 'file', e as any)}
                          />
                        </Form.Label>
                        <Form.Label className="custom-file-label" style={{ cursor: 'pointer' }}>
                          <i className="ri-camera-line me-2"></i>
                          <span>Choose Image {actionTakenImage && `(${actionTakenImage.name})`}</span>
                          <Form.Control
                            type="file"
                            className="d-none"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange('action_taken', 'image', e as any)}
                          />
                        </Form.Label>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Status *</Form.Label>
                      <Form.Select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select</option>
                        <option value="open">Open</option>
                        <option value="monitoring">Monitoring</option>
                        <option value="solved">Solved</option>
                        <option value="closed">Closed</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Priority *</Form.Label>
                      <Form.Select
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Reference Doc</Form.Label>
                      <Form.Control
                        name="reference_doc"
                        value={form.reference_doc || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-3 text-end">
                  <Button variant="primary" type="submit" disabled={submitting || uploading}>
                    {uploading ? 'Uploading files...' : submitting ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default EditEngineeringWikiPage

