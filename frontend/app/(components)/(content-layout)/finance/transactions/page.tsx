'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row, Modal, Form, Table } from 'react-bootstrap'
import {
  createTransaction,
  transferBetweenAccounts,
  type Transaction,
} from '@/app/actions/finance/transactions.actions'
import type { Account } from '@/app/actions/finance/accounts.actions'
import type { Category } from '@/app/actions/finance/categories.actions'
import { getFinanceReference } from '@/app/actions/finance/reference.actions'
import { useAuth } from '@/shared/auth/AuthContext'

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

const TransactionsPage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [transactionType, setTransactionType] = useState<
    'Income' | 'Expense' | 'Transfer'
  >('Expense')
  const [submitting, setSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [form, setForm] = useState({
    account_id: 0,
    transfer_to_account_id: 0,
    category_id: 0,
    amount: 0,
    description: '',
    reference_number: '',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    loadData()
  }, [authLoading, isAuthenticated])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const {
        accounts: accountsData,
        categories: categoriesData,
        transactions: txData = [],
      } = await getFinanceReference({ transactionsLimit: 100 })
      setTransactions(txData)
      setAccounts(accountsData)
      setCategories(categoriesData)
    } catch (err: any) {
      console.error('Error loading transactions:', err)
      setError(err.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (type: 'Income' | 'Expense' | 'Transfer' = 'Expense') => {
    setTransactionType(type)
    setForm({
      account_id: accounts.length > 0 ? accounts[0].id : 0,
      transfer_to_account_id: 0,
      category_id: 0,
      amount: 0,
      description: '',
      reference_number: '',
      transaction_date: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormError(null)
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      if (transactionType === 'Transfer') {
        await transferBetweenAccounts(
          form.account_id,
          form.transfer_to_account_id,
          form.amount,
          form.description,
          form.transaction_date
        )
      } else {
        await createTransaction({
          transaction_type: transactionType,
          account_id: form.account_id,
          category_id: form.category_id || null,
          amount: form.amount,
          description: form.description || null,
          reference_number: form.reference_number || null,
          transaction_date: form.transaction_date,
          notes: form.notes || null,
        })
      }
      handleCloseModal()
      loadData()
    } catch (err: any) {
      console.error(err)
      setFormError(err.message || 'Failed to create transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredCategories = categories.filter(
    (c) => c.type === (transactionType === 'Income' ? 'Income' : 'Expense')
  )

  // Pagination calculations
  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem)

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages))
  }

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1))
  }

  const goToPage = (pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)))
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  if (loading) {
    return (
      <Fragment>
        <Seo title="Transactions" />
        <Pageheader
          title="Finance"
          subtitle="Transactions"
          currentpage="Transactions"
          activepage="Manage Transactions"
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
        <Seo title="Transactions" />
        <Pageheader
          title="Finance"
          subtitle="Transactions"
          currentpage="Transactions"
          activepage="Manage Transactions"
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
      <Seo title="Transactions" />
      <Pageheader
        title="Finance"
        subtitle="Transactions"
        currentpage="Transactions"
        activepage="Manage Transactions"
      />

      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-end">
            <Button
              variant="success"
              className="btn-wave me-2"
              onClick={() => handleOpenModal('Income')}
            >
              <i className="ri-arrow-down-line me-1 align-middle" /> Add Income
            </Button>
            <Button
              variant="danger"
              className="btn-wave me-2"
              onClick={() => handleOpenModal('Expense')}
            >
              <i className="ri-arrow-up-line me-1 align-middle" /> Add Expense
            </Button>
            <Button
              variant="info"
              className="btn-wave"
              onClick={() => handleOpenModal('Transfer')}
            >
              <i className="ri-exchange-line me-1 align-middle" /> Transfer
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Transactions</div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                  <Table className="table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Account</th>
                        <th>Category/To Account</th>
                        <th>Description</th>
                        <th className="text-end">Amount</th>
                        <th className="text-end">Balance After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-muted">
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        currentTransactions.map((tx) => (
                          <tr key={tx.id}>
                            <td>
                              {new Date(tx.transaction_date).toLocaleDateString()}
                            </td>
                            <td>
                              <span
                                className={`badge ${tx.transaction_type === 'Income'
                                  ? 'bg-success'
                                  : tx.transaction_type === 'Expense'
                                    ? 'bg-danger'
                                    : 'bg-info'
                                  }`}
                              >
                                {tx.transaction_type}
                              </span>
                            </td>
                            <td>{tx.account_name}</td>
                            <td>
                              {tx.category_name ||
                                (tx.transfer_to_account_name
                                  ? `→ ${tx.transfer_to_account_name}`
                                  : '-')}
                            </td>
                            <td>{tx.description || '-'}</td>
                            <td className="text-end text-nowrap">
                              {tx.transaction_type === 'Expense' ||
                                (tx.transaction_type === 'Transfer' &&
                                  tx.account_id === tx.transfer_to_account_id)
                                ? '-'
                                : ''}
                              Rp {formatCurrencyWithSpaces(tx.amount)}
                            </td>
                            <td className="text-end text-nowrap">
                              Rp {formatCurrencyWithSpaces(tx.balance_after)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
              </div>

              {/* Pagination Controls */}
              {transactions.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-muted">
                      Showing {indexOfFirstItem + 1} to{' '}
                      {Math.min(indexOfLastItem, transactions.length)} of{' '}
                      {transactions.length} transactions
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small">Items per page:</span>
                      <Form.Select
                        size="sm"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        style={{ width: 'auto' }}
                      >
                        <option value={5}>5</option>
                        <option value={7}>7</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </Form.Select>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNumber) => (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? 'primary' : 'outline-primary'}
                          size="sm"
                          onClick={() => goToPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      )
                    )}
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {transactionType === 'Income'
                ? 'Add Income'
                : transactionType === 'Expense'
                  ? 'Add Expense'
                  : 'Transfer Between Accounts'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formError && <div className="alert alert-danger">{formError}</div>}

            <Row>
              <Col md={transactionType === 'Transfer' ? 6 : 12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {transactionType === 'Transfer'
                      ? 'From Account *'
                      : 'Account *'}
                  </Form.Label>
                  <Form.Select
                    name="account_id"
                    value={form.account_id}
                    onChange={handleChange}
                    required
                  >
                    <option value={0}>Select Account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.bank_name} - {account.name} (Rp{' '}
                        {formatCurrencyWithSpaces(account.current_balance)})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {transactionType === 'Transfer' && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>To Account *</Form.Label>
                    <Form.Select
                      name="transfer_to_account_id"
                      value={form.transfer_to_account_id}
                      onChange={handleChange}
                      required
                    >
                      <option value={0}>Select Account</option>
                      {accounts
                        .filter((a) => a.id !== form.account_id)
                        .map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.bank_name} - {account.name}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
            </Row>

            {transactionType !== 'Transfer' && (
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value={0}>Select Category</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Transaction Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="transaction_date"
                    value={form.transaction_date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reference Number</Form.Label>
              <Form.Control
                name="reference_number"
                value={form.reference_number}
                onChange={handleChange}
              />
            </Form.Group>

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
              {submitting ? 'Processing...' : 'Create Transaction'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Fragment>
  )
}

export default TransactionsPage

