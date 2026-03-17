'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row, Form, Table, Modal } from 'react-bootstrap'
import { getTasks, generateTaskReport, getTaskLogs } from '@/app/actions/labs/engineering-task.actions'
import type { EngineeringTask, TaskStatus, TaskCategory, TaskPriority } from '@/lib/labs/repositories/engineering-task.repository'
import TaskStatusBadge from '../components/TaskStatusBadge'
import TaskPriorityBadge from '../components/TaskPriorityBadge'
import TaskCategoryBadge from '../components/TaskCategoryBadge'

const TaskReports: React.FC = () => {
  const [tasks, setTasks] = useState<EngineeringTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    category: '' as TaskCategory | '',
    status: '' as TaskStatus | '',
    priority: '' as TaskPriority | '',
    date_from: '',
    date_to: '',
  })
  const [exporting, setExporting] = useState(false)

  // Task Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<EngineeringTask | null>(null)
  const [taskLogs, setTaskLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Full Screen Image Viewer State
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')

  useEffect(() => {
    // Don't auto-load on mount, wait for user to apply filters
  }, [])

  const handleApplyFilters = async () => {
    setLoading(true)
    setError(null)
    try {
      const filterParams: any = {}
      if (filters.category) filterParams.category = filters.category
      if (filters.status) filterParams.status = filters.status
      if (filters.priority) filterParams.priority = filters.priority
      if (filters.date_from) filterParams.date_from = new Date(filters.date_from)
      if (filters.date_to) filterParams.date_to = new Date(filters.date_to)

      const data = await getTasks(filterParams)
      setTasks(data)
    } catch (err: any) {
      console.error('Error loading report:', err)
      setError(err.message || 'Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const handleResetFilters = () => {
    setFilters({
      category: '',
      status: '',
      priority: '',
      date_from: '',
      date_to: '',
    })
    setTasks([])
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const filterParams: any = {}
      if (filters.category) filterParams.category = filters.category
      if (filters.status) filterParams.status = filters.status
      if (filters.priority) filterParams.priority = filters.priority
      if (filters.date_from) filterParams.date_from = new Date(filters.date_from)
      if (filters.date_to) filterParams.date_to = new Date(filters.date_to)

      const result = await generateTaskReport(filterParams, 'csv')

      if (result.success && result.format === 'csv') {
        // Trigger download
        const blob = new Blob([result.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `task_report_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err: any) {
      console.error('Error exporting CSV:', err)
      alert(err.message || 'Failed to export CSV')
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = async () => {
    alert('PDF export requires installing jsPDF or pdfmake library. For now, please use CSV export or print the page.')
  }

  const handleViewTaskDetail = async (task: EngineeringTask) => {
    setSelectedTask(task)
    setShowDetailModal(true)
    setLoadingLogs(true)
    setTaskLogs([])

    try {
      const logs = await getTaskLogs(task.id)
      setTaskLogs(logs)
    } catch (err: any) {
      console.error('Error loading task logs:', err)
    } finally {
      setLoadingLogs(false)
    }
  }

  // Statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length
  const overdueTasks = tasks.filter((t) => t.status === 'overdue').length
  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0

  return (
    <Fragment>
      <Seo title="Task Reports" />
      <Pageheader
        title="Labs"
        subtitle="Engineering Task"
        currentpage="Reports"
        activepage="Engineering Task Management"
      />

      {error && (
        <Row className="mb-3">
          <Col xl={12}>
            <div className="alert alert-danger">{error}</div>
          </Col>
        </Row>
      )}

      {/* Report Filters */}
      <Row className="mb-4">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">📊 Report Filters</div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value as any })}
                  >
                    <option value="">All Categories</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Form.Select>
                </Col>

                <Col md={3} className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Col>

                <Col md={3} className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </Form.Select>
                </Col>

                <Col md={3} className="mb-3">
                  <Form.Label>Date From</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                  />
                </Col>

                <Col md={3} className="mb-3">
                  <Form.Label>Date To</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                  />
                </Col>

                <Col md={12}>
                  <div className="d-flex gap-2">
                    <Button variant="primary" onClick={handleApplyFilters} disabled={loading}>
                      {loading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Loading...
                        </span>
                      ) : (
                        <span>
                          <i className="ri-search-line me-1"></i>
                          Generate Report
                        </span>
                      )}
                    </Button>
                    <Button variant="secondary" onClick={handleResetFilters}>
                      <i className="ri-refresh-line me-1"></i>
                      Reset
                    </Button>
                    {tasks.length > 0 && (
                      <>
                        <Button variant="success" onClick={handleExportCSV} disabled={exporting}>
                          {exporting ? (
                            <span>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Exporting...
                            </span>
                          ) : (
                            <span>
                              <i className="ri-file-excel-line me-1"></i>
                              Export CSV
                            </span>
                          )}
                        </Button>
                        <Button variant="danger" onClick={handleExportPDF}>
                          <i className="ri-file-pdf-line me-1"></i>
                          Export PDF
                        </Button>
                      </>
                    )}
                    <Button variant="outline-secondary" onClick={() => window.history.back()}>
                      <i className="ri-arrow-left-line me-1"></i>
                      Back
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Report Statistics */}
      {tasks.length > 0 && (
        <Row className="mb-4">
          <Col xl={12}>
            <Card className="custom-card">
              <Card.Header>
                <div className="card-title">📈 Report Summary</div>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <div className="text-center">
                      <h4 className="fw-bold text-primary">{totalTasks}</h4>
                      <p className="text-muted mb-0">Total Tasks</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h4 className="fw-bold text-success">{completedTasks}</h4>
                      <p className="text-muted mb-0">Completed</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h4 className="fw-bold text-warning">{inProgressTasks}</h4>
                      <p className="text-muted mb-0">In Progress</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h4 className="fw-bold text-danger">{overdueTasks}</h4>
                      <p className="text-muted mb-0">Overdue</p>
                    </div>
                  </Col>
                </Row>
                <hr />
                <Row>
                  <Col md={12}>
                    <div className="text-center">
                      <h5 className="fw-semibold">
                        Completion Rate: <span className="text-success">{completionRate}%</span>
                      </h5>
                      <div className="progress mt-2" style={{ height: '25px' }}>
                        <div
                          className={`progress-bar ${Number(completionRate) >= 80
                            ? 'bg-success'
                            : Number(completionRate) >= 50
                              ? 'bg-warning'
                              : 'bg-danger'
                            }`}
                          style={{ width: `${completionRate}%` }}
                        >
                          {completionRate}%
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Report Table */}
      {tasks.length > 0 && (
        <Row>
          <Col xl={12}>
            <Card className="custom-card">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="card-title mb-0">📋 Task Details</div>
                  <small className="text-muted">Click any row to view details</small>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table className="table-bordered table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Created</th>
                        <th>Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr
                          key={task.id.toString()}
                          onClick={() => handleViewTaskDetail(task)}
                          style={{ cursor: 'pointer' }}
                          className="table-row-hover"
                        >
                          <td>{task.id.toString()}</td>
                          <td>
                            <strong>{task.title}</strong>
                            {task.description && (
                              <p className="text-muted mb-0 fs-12">{task.description}</p>
                            )}
                          </td>
                          <td>
                            <TaskCategoryBadge category={task.category} />
                          </td>
                          <td>
                            <TaskPriorityBadge priority={task.priority} />
                          </td>
                          <td>
                            <TaskStatusBadge status={task.status} />
                          </td>
                          <td>
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString()
                              : '-'}
                          </td>
                          <td>
                            {new Date(task.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            {task.completed_at
                              ? new Date(task.completed_at).toLocaleDateString()
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Empty State */}
      {!loading && tasks.length === 0 && (
        <Row>
          <Col xl={12}>
            <Card className="custom-card">
              <Card.Body className="text-center p-5">
                <i className="ri-file-chart-line fs-1 text-muted"></i>
                <h5 className="mt-3 text-muted">No Report Generated</h5>
                <p className="text-muted">
                  Select filters above and click "Generate Report" to view task data
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Task Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title>📋 Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-dark">
          {selectedTask && (
            <>
              {/* Task Information */}
              <Card className="mb-3">
                <Card.Header className="">
                  <strong>Task Information</strong>
                </Card.Header>
                <Card.Body className="text-dark">
                  <Row>
                    <Col md={12} className="mb-2">
                      <strong>Title:</strong>
                      <p className="mb-2 text-dark">{selectedTask.title}</p>
                    </Col>
                    {selectedTask.description && (
                      <Col md={12} className="mb-2">
                        <strong>Description:</strong>
                        <p className="mb-2 text-dark">{selectedTask.description}</p>
                      </Col>
                    )}
                    <Col md={6} className="mb-2">
                      <strong>Category:</strong>
                      <div className="mt-1">
                        <TaskCategoryBadge category={selectedTask.category} />
                      </div>
                    </Col>
                    <Col md={6} className="mb-2">
                      <strong>Priority:</strong>
                      <div className="mt-1">
                        <TaskPriorityBadge priority={selectedTask.priority} />
                      </div>
                    </Col>
                    <Col md={6} className="mb-2">
                      <strong>Status:</strong>
                      <div className="mt-1">
                        <TaskStatusBadge status={selectedTask.status} />
                      </div>
                    </Col>
                    <Col md={6} className="mb-2">
                      <strong>Due Date:</strong>
                      <p className="mb-0 text-dark">
                        {selectedTask.due_date
                          ? new Date(selectedTask.due_date).toLocaleDateString()
                          : 'Not set'}
                      </p>
                    </Col>
                    <Col md={6} className="mb-2">
                      <strong>Created:</strong>
                      <p className="mb-0 text-dark">
                        {new Date(selectedTask.created_at).toLocaleString()}
                      </p>
                    </Col>
                    <Col md={6} className="mb-2">
                      <strong>Completed:</strong>
                      <p className="mb-0 text-dark">
                        {selectedTask.completed_at
                          ? new Date(selectedTask.completed_at).toLocaleString()
                          : 'Not completed'}
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Requirements */}
              {(selectedTask.requires_photo || selectedTask.requires_gps) ? (
                <Card className="mb-3">
                  <Card.Header className="">
                    <strong>Requirements</strong>
                  </Card.Header>
                  <Card.Body className="text-dark">
                    {selectedTask.requires_photo && (
                      <div className="mb-2">
                        <span className="badge bg-info">📸 Photo Evidence Required</span>
                      </div>
                    )}
                    {selectedTask.requires_gps && (
                      <div>
                        <span className="badge bg-warning text-dark">📍 GPS Location Required</span>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ) : null}

              {/* Activity Logs */}
              <Card>
                <Card.Header className="">
                  <strong>Activity Logs</strong>
                </Card.Header>
                <Card.Body className="text-dark">
                  {loadingLogs ? (
                    <div className="text-center p-3">
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Loading logs...
                    </div>
                  ) : taskLogs.length === 0 ? (
                    <p className="text-muted text-center mb-0">No activity logs available</p>
                  ) : (
                    <div className="timeline">
                      {taskLogs.map((log: any, idx: number) => (
                        <div key={idx} className="mb-3 pb-3 border-bottom">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <span className="badge bg-primary me-2">
                                {log.action_type?.replace('_', ' ').toUpperCase()}
                              </span>
                              {log.new_status && (
                                <TaskStatusBadge status={log.new_status} />
                              )}
                            </div>
                            <small className="text-muted">
                              {new Date(log.created_at).toLocaleString()}
                            </small>
                          </div>

                          {log.update_details && (
                            <p className="mb-2 text-dark">
                              <strong>Details:</strong> {log.update_details}
                            </p>
                          )}

                          {log.comment && (
                            <p className="mb-2 text-dark">
                              <strong>Comment:</strong> {log.comment}
                            </p>
                          )}

                          {log.photo_url && (
                            <div className="mb-2">
                              <strong>📸 Photo Evidence:</strong>
                              <div className="mt-1">
                                <img
                                  src={log.photo_url}
                                  alt="Task evidence"
                                  className="img-thumbnail"
                                  style={{ maxHeight: '200px', maxWidth: '100%', cursor: 'pointer' }}
                                  onClick={() => {
                                    setSelectedImage(log.photo_url)
                                    setShowImageViewer(true)
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {log.location_tag && (
                            <div className="mb-2">
                              <strong>📍 GPS Location:</strong>
                              <div className="alert alert-info mb-0 mt-1">
                                <small>
                                  <strong>Coordinates:</strong> {log.location_tag}
                                  {log.location_address && (
                                    <>
                                      <br />
                                      <strong>Address:</strong> {log.location_address}
                                    </>
                                  )}
                                  <br />
                                  <a
                                    href={`https://www.google.com/maps/place/${log.location_tag}/@${log.location_tag},18z`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-primary mt-2"
                                  >
                                    🗺️ View on Map
                                  </a>
                                </small>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Full Screen Image Viewer Modal */}
      <Modal
        show={showImageViewer}
        onHide={() => setShowImageViewer(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>📸 Photo Evidence</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-0">
          <img
            src={selectedImage}
            alt="Full size evidence"
            style={{ width: '100%', height: 'auto', maxHeight: '85vh', objectFit: 'contain' }}
          />
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowImageViewer(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}

export default TaskReports
