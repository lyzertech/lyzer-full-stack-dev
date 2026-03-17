'use client'

import React, { Fragment, useEffect, useState, useRef } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row, Form, Modal, Alert } from 'react-bootstrap'
import { getTasks, uploadTaskPhoto, completeTaskWithEvidence } from '@/app/actions/labs/engineering-task.actions'
import type { EngineeringTask } from '@/lib/labs/repositories/engineering-task.repository'
import TaskPriorityBadge from '../components/TaskPriorityBadge'
import TaskStatusBadge from '../components/TaskStatusBadge'

const DailyTaskLog: React.FC = () => {
  const [tasks, setTasks] = useState<EngineeringTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<EngineeringTask | null>(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completionData, setCompletionData] = useState<{
    photo_url?: string
    location_tag?: string
    location_address?: string
    comment?: string
  }>({})
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadDailyTasks()
  }, [])

  async function loadDailyTasks() {
    setLoading(true)
    setError(null)
    try {
      const data = await getTasks() // Load all tasks regardless of category
      setTasks(data)
    } catch (err: any) {
      console.error('Error loading daily tasks:', err)
      setError(err.message || 'Failed to load daily tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskClick = (task: EngineeringTask) => {
    if (task.status === 'completed') return
    setSelectedTask(task)
    setCompletionData({})
    setShowCompletionModal(true)
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)

      const result = await uploadTaskPhoto(formData)
      if (result.success) {
        setCompletionData((prev) => ({ ...prev, photo_url: result.url }))
      } else {
        alert('Photo upload failed')
      }
    } catch (err: any) {
      console.error('Photo upload error:', err)
      alert(err.message || 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleCaptureGPS = () => {
    setGpsLoading(true)
    setGpsAccuracy(null)

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      setGpsLoading(false)
      return
    }

    let watchId: number | null = null
    let bestAccuracy = Infinity

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = position.coords.accuracy // accuracy in meters
        setGpsAccuracy(accuracy)

        // Only use this position if it's more accurate than what we had before
        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy

          const lat = position.coords.latitude.toFixed(8)
          const lng = position.coords.longitude.toFixed(8)
          const locationTag = `${lat},${lng}`

          setCompletionData((prev) => ({
            ...prev,
            location_tag: locationTag,
            location_address: `Lat: ${lat}, Lng: ${lng} (±${accuracy.toFixed(1)}m)`,
          }))

          // If we get good accuracy (under 20 meters), stop watching
          if (accuracy < 20 && watchId !== null) {
            navigator.geolocation.clearWatch(watchId)
            setGpsLoading(false)
          }
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId)
        }

        // Show proper error message instead of mock data
        let errorMsg = 'Failed to get GPS location. '
        if (error.code === 1) {
          errorMsg += 'Location permission denied. Please enable location access in your browser settings.'
        } else if (error.code === 2) {
          errorMsg += 'Location unavailable. Please check your device GPS settings and try again outdoors.'
        } else if (error.code === 3) {
          errorMsg += 'Location request timed out. Please try again in an area with better GPS signal.'
        }

        alert(errorMsg)
        setGpsLoading(false)
        setGpsAccuracy(null)
      },
      {
        enableHighAccuracy: true,  // Use GPS hardware for better accuracy
        timeout: 30000,             // Wait up to 30 seconds for position
        maximumAge: 0               // Always get fresh position, don't use cache
      }
    )

    // Auto-stop after 30 seconds regardless
    setTimeout(() => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
        setGpsLoading(false)
      }
    }, 30000)
  }

  const handleCompleteTask = async () => {
    if (!selectedTask) return

    // Validation
    if (selectedTask.requires_photo && !completionData.photo_url) {
      alert('📸 Photo evidence is required to complete this task!')
      return
    }

    if (selectedTask.requires_gps && !completionData.location_tag) {
      alert('📍 GPS location is required to complete this task!')
      return
    }

    setCompleting(true)
    try {
      // Mock user ID - in production this would come from session
      const mockUserId = BigInt(1)

      await completeTaskWithEvidence({
        task_id: selectedTask.id,
        user_id: mockUserId,
        photo_url: completionData.photo_url,
        location_tag: completionData.location_tag,
        location_address: completionData.location_address,
        comment: completionData.comment,
      })

      setShowCompletionModal(false)
      setSelectedTask(null)
      setCompletionData({})
      loadDailyTasks()
    } catch (err: any) {
      console.error('Error completing task:', err)
      alert(err.message || 'Failed to complete task')
    } finally {
      setCompleting(false)
    }
  }

  const pendingTasks = tasks.filter((t) => t.status !== 'completed')
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  return (
    <Fragment>
      <Seo title="Task Execution Log" />
      <Pageheader
        title="Labs"
        subtitle="Engineering Task"
        currentpage="Task Execution"
        activepage="Engineering Task Management"
      />

      {error && (
        <Row className="mb-3">
          <Col xl={12}>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="fw-bold mb-0">📋 Task Execution Checklist</h4>
              <p className="text-muted mb-0">All pending tasks • Tap to complete with photo evidence and GPS</p>
            </div>
            <Button variant="outline-secondary" onClick={() => window.history.back()}>
              <i className="ri-arrow-left-line me-1"></i>
              Back
            </Button>
          </div>
        </Col>
      </Row>

      {/* Pending Tasks */}
      <Row className="mb-4">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="bg-primary text-white">
              <div className="card-title text-white">
                ⏳ Pending Tasks ({pendingTasks.length})
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="p-3 p-md-4 text-center text-muted">Loading tasks...</div>
              ) : pendingTasks.length === 0 ? (
                <div className="p-3 p-md-4 text-center text-muted">
                  ✅ All daily tasks completed! Great work!
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id.toString()}
                      className="list-group-item list-group-item-action cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                        <div className="flex-fill w-100">
                          <h6 className="mb-2 fw-semibold fs-6 fs-md-5">{task.title}</h6>
                          {task.description && (
                            <p className="text-muted mb-2 fs-14 small">{task.description}</p>
                          )}
                          <div className="d-flex flex-wrap gap-2 align-items-center">
                            <TaskPriorityBadge priority={task.priority} />
                            <TaskStatusBadge status={task.status} />
                            {task.requires_photo && (
                              <span className="badge bg-info">📸 Photo Required</span>
                            )}
                            {task.requires_gps && (
                              <span className="badge bg-warning text-dark">📍 GPS Required</span>
                            )}
                          </div>
                        </div>
                        <div className="w-100 w-md-auto">
                          <Button 
                            variant="outline-success" 
                            className="btn-sm w-100 w-md-auto"
                          >
                            Complete →
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Row>
          <Col xl={12}>
            <Card className="custom-card">
              <Card.Header className="bg-success text-white">
                <div className="card-title text-white">
                  ✅ Completed Tasks ({completedTasks.length})
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="list-group list-group-flush">
                  {completedTasks.map((task) => (
                    <div key={task.id.toString()} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="flex-fill">
                          <h6 className="mb-1 fw-semibold text-success">
                            <i className="ri-checkbox-circle-fill me-2"></i>
                            {task.title}
                          </h6>
                          <p className="text-muted mb-0 fs-12">
                            Completed at:{' '}
                            {task.completed_at
                              ? new Date(task.completed_at).toLocaleString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Completion Modal */}
      <Modal show={showCompletionModal} onHide={() => setShowCompletionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Complete Task: {selectedTask?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <>
              {selectedTask.description && (
                <Alert variant="info">
                  <strong>Description:</strong> {selectedTask.description}
                </Alert>
              )}

              {/* Photo Upload */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Photo Evidence {selectedTask.requires_photo && <span className="text-danger">*</span>}
                </label>
                <input
                  ref={photoInputRef}
                  type="file"
                  className="form-control d-none"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                />
                <div className="d-flex gap-2 align-items-center">
                  <Button
                    variant="primary"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Uploading...
                      </span>
                    ) : (
                      <span>
                        <i className="ri-camera-line me-1"></i>
                        {completionData.photo_url ? 'Change Photo' : 'Take/Upload Photo'}
                      </span>
                    )}
                  </Button>
                  {completionData.photo_url && (
                    <span className="text-success">
                      ✅ Photo uploaded
                    </span>
                  )}
                </div>
                {completionData.photo_url && (
                  <div className="mt-2">
                    <img
                      src={completionData.photo_url}
                      alt="Task evidence"
                      className="img-thumbnail"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}
              </div>

              {/* GPS Capture */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  GPS Location {selectedTask.requires_gps && <span className="text-danger">*</span>}
                </label>
                <div className="d-flex gap-2 align-items-center">
                  <Button
                    variant="warning"
                    onClick={handleCaptureGPS}
                    disabled={gpsLoading}
                  >
                    {gpsLoading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Capturing...
                      </span>
                    ) : (
                      <span>
                        <i className="ri-map-pin-line me-1"></i>
                        {completionData.location_tag ? 'Re-capture GPS' : 'Capture GPS'}
                      </span>
                    )}
                  </Button>
                  {completionData.location_tag && (
                    <span className="text-success">
                      ✅ GPS captured
                    </span>
                  )}
                </div>
                {gpsAccuracy !== null && (
                  <Alert
                    variant={
                      gpsAccuracy < 10 ? 'success' :
                        gpsAccuracy < 30 ? 'warning' :
                          'danger'
                    }
                    className="mt-2 mb-0"
                  >
                    <small>
                      <strong>Accuracy:</strong> ±{gpsAccuracy.toFixed(1)} meters
                      {gpsAccuracy < 10 && ' (Excellent!)'}
                      {gpsAccuracy >= 10 && gpsAccuracy < 30 && ' (Good)'}
                      {gpsAccuracy >= 30 && ' (Poor - try moving to an open area)'}
                    </small>
                  </Alert>
                )}
                {completionData.location_tag && (
                  <div className="alert alert-secondary mt-2 mb-0">
                    <strong>📍 Coordinates:</strong> {completionData.location_tag}
                  </div>
                )}
              </div>

              {/* Comment */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Comment (Optional)</label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add any notes about this task completion..."
                  value={completionData.comment || ''}
                  onChange={(e) =>
                    setCompletionData((prev) => ({ ...prev, comment: e.target.value }))
                  }
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompletionModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleCompleteTask}
            disabled={completing}
          >
            {completing ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Completing...
              </span>
            ) : (
              <span>
                <i className="ri-checkbox-circle-line me-1"></i>
                Complete Task
              </span>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}

export default DailyTaskLog
