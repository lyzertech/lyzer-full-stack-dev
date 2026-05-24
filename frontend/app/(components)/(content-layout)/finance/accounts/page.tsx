'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row, Modal, Form, Table } from 'react-bootstrap'
import {
  createAccount,
  updateAccount,
  deleteAccount,
  type Account,
} from '@/app/actions/finance/accounts.actions'
import { getFinanceReference } from '@/app/actions/finance/reference.actions'
import type { Bank } from '@/app/actions/finance/banks.actions'
import { useAuth } from '@/shared/auth/AuthContext'

type AccountType = 'Checking' | 'Savings' | 'Credit' | 'Investment' | 'Cash' | 'Other'

const formatCurrencyWithSpaces = (amount: unknown): string => {
  const num =
    typeof amount === 'number'
      ? amount
      : amount == null
      ? 0
      : Number(amount)

  if (Number.isNaN(num)) {
    return '0.00'
  }

  const [integerPart, decimalPart = '00'] = num.toFixed(2).split('.')
  const spacedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${spacedInteger}.${decimalPart}`
}

const AccountsPage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<{
    bank_id: number
    name: string
    account_number: string
    account_type: AccountType
    currency: string
    initial_balance: number
    notes: string
    is_active: boolean
  }>({
    bank_id: 0,
    name: '',
    account_number: '',
    account_type: 'Checking',
    currency: 'IDR',
    initial_balance: 0,
    notes: '',
    is_active: true,
  })

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    loadData()
  }, [authLoading, isAuthenticated])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const { accounts: accountsData, banks: banksData } = await getFinanceReference()
      setAccounts(accountsData)
      setBanks(banksData)
    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account)
      setForm({
        bank_id: account.bank_id,
        name: account.name,
        account_number: account.account_number || '',
        account_type: account.account_type,
        currency: account.currency,
        initial_balance: account.initial_balance,
        notes: account.notes || '',
        is_active: account.is_active,
      })
    } else {
      setEditingAccount(null)
      setForm({
        bank_id: banks.length > 0 ? banks[0].id : 0,
        name: '',
        account_number: '',
        account_type: 'Checking',
        currency: 'IDR',
        initial_balance: 0,
        notes: '',
        is_active: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAccount(null)
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
          ? parseFloat(value) || 0
          : name === 'account_type'
          ? (value as AccountType)
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      if (editingAccount) {
        await updateAccount({ id: editingAccount.id, ...form })
      } else {
        await createAccount(form)
      }
      handleCloseModal()
      loadData()
    } catch (err: any) {
      console.error(err)
      setFormError(err.message || 'Failed to save account')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this account?')) return
    try {
      await deleteAccount(id)
      loadData()
    } catch (err: any) {
      alert(err.message || 'Failed to delete account')
    }
  }

  if (loading) {
    return (
      <Fragment>
        <Seo title="Accounts" />
        <Pageheader
          title="Finance"
          subtitle="Accounts"
          currentpage="Accounts"
          activepage="Manage Accounts"
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
        <Seo title="Accounts" />
        <Pageheader
          title="Finance"
          subtitle="Accounts"
          currentpage="Accounts"
          activepage="Manage Accounts"
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
      <Seo title="Accounts" />
      <Pageheader
        title="Finance"
        subtitle="Accounts"
        currentpage="Accounts"
        activepage="Manage Accounts"
      />

      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              className="btn-wave"
              onClick={() => handleOpenModal()}
            >
              <i className="ri-add-line me-1 align-middle" /> Add Account
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Accounts</div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                  <Table className="table-hover">
                    <thead>
                      <tr>
                        <th>Account Name</th>
                        <th>Bank</th>
                        <th>Account Number</th>
                        <th>Type</th>
                        <th>Currency</th>
                        <th className="text-end">Balance</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center text-muted">
                            No accounts found
                          </td>
                        </tr>
                      ) : (
                        accounts.map((account) => (
                          <tr key={account.id}>
                            <td>{account.name}</td>
                            <td>{account.bank_name}</td>
                            <td>{account.account_number || '-'}</td>
                            <td>{account.account_type}</td>
                            <td>{account.currency}</td>
                            <td className="text-end text-nowrap">
                              {account.currency === 'IDR' ? 'Rp' : account.currency}{' '}
                              {formatCurrencyWithSpaces(account.current_balance)}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  account.is_active ? 'bg-success' : 'bg-secondary'
                                }`}
                              >
                                {account.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-end">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                className="me-1"
                                onClick={() => handleOpenModal(account)}
                              >
                                <i className="ri-edit-line" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(account.id)}
                              >
                                <i className="ri-delete-bin-line" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingAccount ? 'Edit Account' : 'Add Account'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formError && <div className="alert alert-danger">{formError}</div>}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bank *</Form.Label>
                  <Form.Select
                    name="bank_id"
                    value={form.bank_id}
                    onChange={handleChange}
                    required
                  >
                    <option value={0}>Select Bank</option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Account Name *</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Account Number</Form.Label>
                  <Form.Control
                    name="account_number"
                    value={form.account_number}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Account Type *</Form.Label>
                  <Form.Select
                    name="account_type"
                    value={form.account_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                    <option value="Credit">Credit</option>
                    <option value="Investment">Investment</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Currency *</Form.Label>
                  <Form.Control
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {editingAccount ? 'Current Balance' : 'Initial Balance'}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name={editingAccount ? 'current_balance' : 'initial_balance'}
                    value={
                      editingAccount
                        ? accounts.find((a) => a.id === editingAccount.id)
                            ?.current_balance || 0
                        : form.initial_balance
                    }
                    onChange={handleChange}
                    disabled={!!editingAccount}
                    required
                  />
                  {editingAccount && (
                    <Form.Text className="text-muted">
                      Balance cannot be edited directly. Use transactions to
                      update balance.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={form.notes}
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
                : editingAccount
                ? 'Update Account'
                : 'Create Account'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Fragment>
  )
}

export default AccountsPage

