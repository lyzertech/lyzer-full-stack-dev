'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row, Modal, Form, Table } from 'react-bootstrap'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '@/app/actions/finance/categories.actions'
import { useAuth } from '@/shared/auth/AuthContext'

const CategoriesPage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [filterType, setFilterType] = useState<'Income' | 'Expense' | 'All'>('All')
  const [form, setForm] = useState({
    name: '',
    type: 'Expense' as 'Income' | 'Expense',
    parent_id: 0,
    description: '',
    color: '#3b82f6',
    icon: '',
    is_active: true,
  })

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    loadCategories()
  }, [filterType, authLoading, isAuthenticated])

  async function loadCategories() {
    setLoading(true)
    setError(null)
    try {
      const data = await getCategories(
        filterType === 'All' ? undefined : filterType
      )
      setCategories(data)
    } catch (err: any) {
      console.error('Error loading categories:', err)
      setError(err.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setForm({
        name: category.name,
        type: category.type,
        parent_id: category.parent_id || 0,
        description: category.description || '',
        color: category.color || '#3b82f6',
        icon: category.icon || '',
        is_active: category.is_active,
      })
    } else {
      setEditingCategory(null)
      setForm({
        name: '',
        type: filterType !== 'All' ? filterType : 'Expense',
        parent_id: 0,
        description: '',
        color: '#3b82f6',
        icon: '',
        is_active: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormError(null)
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? parseInt(value) || 0
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          ...form,
          parent_id: form.parent_id || null,
        })
      } else {
        await createCategory({
          ...form,
          parent_id: form.parent_id || null,
        })
      }
      handleCloseModal()
      loadCategories()
    } catch (err: any) {
      console.error(err)
      setFormError(err.message || 'Failed to save category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await deleteCategory(id)
      loadCategories()
    } catch (err: any) {
      alert(err.message || 'Failed to delete category')
    }
  }

  const parentCategories = categories.filter(
    (c) => c.type === form.type && (!c.parent_id || c.parent_id === 0)
  )

  if (loading) {
    return (
      <Fragment>
        <Seo title="Categories" />
        <Pageheader
          title="Finance"
          subtitle="Categories"
          currentpage="Categories"
          activepage="Manage Categories"
        />
        <Row>
          <Col xl={12}>
            <Card className="custom-card">
              <Card.Body>
                <div className="text-center">Loading...</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Fragment>
    )
  }

  if (error) {
    return (
      <Fragment>
        <Seo title="Categories" />
        <Pageheader
          title="Finance"
          subtitle="Categories"
          currentpage="Categories"
          activepage="Manage Categories"
        />
        <Row>
          <Col xl={12}>
            <Card className="custom-card">
              <Card.Body>
                <div className="alert alert-danger">{error}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Fragment>
    )
  }

  return (
    <Fragment>
      <Seo title="Categories" />
      <Pageheader
        title="Finance"
        subtitle="Categories"
        currentpage="Categories"
        activepage="Manage Categories"
      />

      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button
                variant={filterType === 'All' ? 'primary' : 'outline-primary'}
                size="sm"
                className="me-2"
                onClick={() => setFilterType('All')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'Income' ? 'primary' : 'outline-primary'}
                size="sm"
                className="me-2"
                onClick={() => setFilterType('Income')}
              >
                Income
              </Button>
              <Button
                variant={filterType === 'Expense' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setFilterType('Expense')}
              >
                Expense
              </Button>
            </div>
            <Button
              variant="primary"
              className="btn-wave"
              onClick={() => handleOpenModal()}
            >
              <i className="ri-add-line me-1 align-middle" /> Add Category
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Categories</div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                  <Table className="table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Parent</th>
                        <th>Color</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted">
                            No categories found
                          </td>
                        </tr>
                      ) : (
                        categories.map((category) => {
                          const parent = categories.find(
                            (c) => c.id === category.parent_id
                          )
                          return (
                            <tr key={category.id}>
                              <td>
                                {category.icon && (
                                  <i className={`${category.icon} me-2`} />
                                )}
                                {category.name}
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    category.type === 'Income'
                                      ? 'bg-success'
                                      : 'bg-danger'
                                  }`}
                                >
                                  {category.type}
                                </span>
                              </td>
                              <td>{parent ? parent.name : '-'}</td>
                              <td>
                                {category.color && (
                                  <span
                                    className="badge"
                                    style={{
                                      backgroundColor: category.color,
                                      color: '#fff',
                                    }}
                                  >
                                    {category.color}
                                  </span>
                                )}
                                {!category.color && '-'}
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    category.is_active
                                      ? 'bg-success'
                                      : 'bg-secondary'
                                  }`}
                                >
                                  {category.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="text-end">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  className="me-1"
                                  onClick={() => handleOpenModal(category)}
                                >
                                  <i className="ri-edit-line" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => handleDelete(category.id)}
                                >
                                  <i className="ri-delete-bin-line" />
                                </Button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formError && <div className="alert alert-danger">{formError}</div>}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type *</Form.Label>
                  <Form.Select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Parent Category</Form.Label>
              <Form.Select
                name="parent_id"
                value={form.parent_id}
                onChange={handleChange}
              >
                <option value={0}>None (Top Level)</option>
                {parentCategories
                  .filter((c) => !editingCategory || c.id !== editingCategory.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <Form.Control
                    type="color"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Icon Class</Form.Label>
                  <Form.Control
                    name="icon"
                    value={form.icon}
                    onChange={handleChange}
                    placeholder="ri-home-line"
                  />
                  <Form.Text className="text-muted">
                    RemixIcon class name (e.g., ri-home-line)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Active"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting
                ? 'Saving...'
                : editingCategory
                ? 'Update Category'
                : 'Create Category'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Fragment>
  )
}

export default CategoriesPage

