'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row, Form, Modal } from 'react-bootstrap'
import { getTasks, createTask, updateTask, deleteTask } from '@/app/actions/labs/engineering-task.actions'
import type { EngineeringTask, TaskCategory } from '@/lib/labs/repositories/engineering-task.repository'
import TaskStatusBadge from '../components/TaskStatusBadge'
import TaskPriorityBadge from '../components/TaskPriorityBadge'
import TaskCategoryBadge from '../components/TaskCategoryBadge'

const PlanningBoard: React.FC = () => {
  const [tasks, setTasks] = useState<EngineeringTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<EngineeringTask | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'weekly' as TaskCategory,
    priority: 'normal' as any,
    assigned_to: '',
    due_date: '',
    tags: '',
    requires_photo: false,
    requires_gps: false,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [filterCategory])

  async function loadTasks() {
    setLoading(true)
    setError(null)
    try {
      const filters = filterCategory === 'all' ? {} : { category: filterCategory }
      const data = await getTasks(filters)
      // Filter only weekly and monthly tasks for planning
      const planningTasks = data.filter((t) => t.category === 'weekly' || t.category === 'monthly')
      setTasks(planningTasks)
    } catch (err: any) {
      console.error('Error loading tasks:', err)
      setError(err.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setFormData({
      title: '',
      description: '',
      category: 'weekly',
      priority: 'normal',
      assigned_to: '',
      due_date: '',
      tags: '',
      requires_photo: false,
      requires_gps: false,
    })
    setShowTaskModal(true)
  }

  const handleEditTask = (task: EngineeringTask) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      assigned_to: task.assigned_to?.toString() || '',
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      tags: task.tags || '',
      requires_photo: task.requires_photo,
      requires_gps: task.requires_gps,
    })
    setShowTaskModal(true)
  }

  const handleSaveTask = async () => {
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }

    setSaving(true)
    try {
      if (editingTask) {
        // Update existing task
        await updateTask({
          id: editingTask.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          assigned_to: formData.assigned_to ? BigInt(formData.assigned_to) : undefined,
          due_date: formData.due_date ? new Date(formData.due_date) : undefined,
          tags: formData.tags,
        })
      } else {
        // Create new task
        await createTask({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          assigned_to: formData.assigned_to ? BigInt(formData.assigned_to) : undefined,
          due_date: formData.due_date ? new Date(formData.due_date) : undefined,
          tags: formData.tags,
          requires_photo: formData.requires_photo,
          requires_gps: formData.requires_gps,
        })
      }

      setShowTaskModal(false)
      loadTasks()
    } catch (err: any) {
      console.error('Error saving task:', err)
      alert(err.message || 'Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTask = async (task: EngineeringTask) => {
    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) return

    try {
      await deleteTask(task.id)
      loadTasks()
    } catch (err: any) {
      console.error('Error deleting task:', err)
      alert(err.message || 'Failed to delete task')
    }
  }

  const handleStatusChange = async (task: EngineeringTask, newStatus: any) => {
    try {
      await updateTask({
        id: task.id,
        status: newStatus,
      })
      loadTasks()
    } catch (err: any) {
      console.error('Error updating task status:', err)
      alert(err.message || 'Failed to update task status')
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => t.status === status)
  }

  const pendingTasks = getTasksByStatus('pending')
  const inProgressTasks = getTasksByStatus('in_progress')
  const completedTasks = getTasksByStatus('completed')

  return (
    <Fragment>
      <Seo title="Planning Board" />
      <Pageheader
        title="Labs"
        subtitle="Engineering Task"
        currentpage="Planning Board"
        activepage="Engineering Task Management"
      />

      {error && (
        <Row className="mb-3">
          <Col xl={12}>
            <div className="alert alert-danger">{error}</div>
          </Col>
        </Row>
      )}

      {/* Header with Filters */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="fw-bold mb-0">📊 Planning Board (Kanban)</h4>
              <p className="text-muted mb-0">Manage weekly and monthly tasks</p>
            </div>
            <div className="d-flex gap-2">
              <Form.Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                style={{ width: 'auto' }}
              >
                <option value="all">All Categories</option>
                <option value="weekly">Weekly Tasks</option>
                <option value="monthly">Monthly Tasks</option>
              </Form.Select>
              <Button variant="primary" onClick={handleCreateTask}>
                <i className="ri-add-line me-1"></i>
                New Task
              </Button>
              <Button variant="outline-secondary" onClick={() => window.history.back()}>
                <i className="ri-arrow-left-line me-1"></i>
                Back
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Kanban Board */}
      <Row>
        {/* Pending Column */}
        <Col xl={4} lg={4} md={12}>
          <Card className="custom-card">
            <Card.Header className="bg-secondary text-white">
              <div className="card-title text-white">
                📋 Pending ({pendingTasks.length})
              </div>
            </Card.Header>
            <Card.Body className="p-2" style={{ minHeight: '500px' }}>
              {loading ? (
                <p className="text-center text-muted p-3">Loading...</p>
              ) : pendingTasks.length === 0 ? (
                <p className="text-center text-muted p-3">No pending tasks</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {pendingTasks.map((task) => (
                    <Card key={task.id.toString()} className="shadow-sm">
                      <Card.Body className="p-3">
                        <h6 className="fw-semibold mb-2">{task.title}</h6>
                        {task.description && (
                          <p className="text-muted fs-12 mb-2">{task.description}</p>
                        )}
                        <div className="d-flex gap-1 mb-2 flex-wrap">
                          <TaskCategoryBadge category={task.category} />
                          <TaskPriorityBadge priority={task.priority} />
                        </div>
                        {task.due_date && (
                          <p className="text-muted fs-12 mb-2">
                            📅 Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => handleStatusChange(task, 'in_progress')}
                          >
                            Start
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEditTask(task)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteTask(task)}
                          >
                            Delete
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* In Progress Column */}
        <Col xl={4} lg={4} md={12}>
          <Card className="custom-card">
            <Card.Header className="bg-warning text-dark">
              <div className="card-title">
                🔄 In Progress ({inProgressTasks.length})
              </div>
            </Card.Header>
            <Card.Body className="p-2" style={{ minHeight: '500px' }}>
              {loading ? (
                <p className="text-center text-muted p-3">Loading...</p>
              ) : inProgressTasks.length === 0 ? (
                <p className="text-center text-muted p-3">No tasks in progress</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {inProgressTasks.map((task) => (
                    <Card key={task.id.toString()} className="shadow-sm border-warning">
                      <Card.Body className="p-3">
                        <h6 className="fw-semibold mb-2">{task.title}</h6>
                        {task.description && (
                          <p className="text-muted fs-12 mb-2">{task.description}</p>
                        )}
                        <div className="d-flex gap-1 mb-2 flex-wrap">
                          <TaskCategoryBadge category={task.category} />
                          <TaskPriorityBadge priority={task.priority} />
                        </div>
                        {task.due_date && (
                          <p className="text-muted fs-12 mb-2">
                            📅 Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleStatusChange(task, 'completed')}
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleStatusChange(task, 'pending')}
                          >
                            Back
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEditTask(task)}
                          >
                            Edit
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Completed Column */}
        <Col xl={4} lg={4} md={12}>
          <Card className="custom-card">
            <Card.Header className="bg-success text-white">
              <div className="card-title text-white">
                ✅ Completed ({completedTasks.length})
              </div>
            </Card.Header>
            <Card.Body className="p-2" style={{ minHeight: '500px' }}>
              {loading ? (
                <p className="text-center text-muted p-3">Loading...</p>
              ) : completedTasks.length === 0 ? (
                <p className="text-center text-muted p-3">No completed tasks</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {completedTasks.map((task) => (
                    <Card key={task.id.toString()} className="shadow-sm border-success">
                      <Card.Body className="p-3">
                        <h6 className="fw-semibold mb-2 text-success">
                          <i className="ri-checkbox-circle-fill me-1"></i>
                          {task.title}
                        </h6>
                        {task.description && (
                          <p className="text-muted fs-12 mb-2">{task.description}</p>
                        )}
                        <div className="d-flex gap-1 mb-2 flex-wrap">
                          <TaskCategoryBadge category={task.category} />
                          <TaskPriorityBadge priority={task.priority} />
                        </div>
                        {task.completed_at && (
                          <p className="text-muted fs-12 mb-2">
                            ✅ Completed: {new Date(task.completed_at).toLocaleDateString()}
                          </p>
                        )}
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDeleteTask(task)}
                        >
                          Delete
                        </Button>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Task Modal */}
      <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingTask ? 'Edit Task' : 'Create New Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>
                  Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Col>

              <Col md={12} className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter task description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Form.Select>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </Form.Select>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </Col>

              <Col md={12} className="mb-3">
                <Form.Label>Tags (comma-separated)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., maintenance, inspection, safety"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </Col>

              {!editingTask && (
                <>
                  <Col md={6} className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Requires Photo Evidence"
                      checked={formData.requires_photo}
                      onChange={(e) => setFormData({ ...formData, requires_photo: e.target.checked })}
                    />
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Requires GPS Location"
                      checked={formData.requires_gps}
                      onChange={(e) => setFormData({ ...formData, requires_gps: e.target.checked })}
                    />
                  </Col>
                </>
              )}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveTask} disabled={saving}>
            {saving ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Saving...
              </span>
            ) : (
              <span>
                <i className="ri-save-line me-1"></i>
                {editingTask ? 'Update' : 'Create'} Task
              </span>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}

export default PlanningBoard
