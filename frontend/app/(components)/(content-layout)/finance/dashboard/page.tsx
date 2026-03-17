'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row } from 'react-bootstrap'
import { getDashboardSummary } from '@/app/actions/finance/dashboard.actions'
import type { DashboardSummary } from '@/app/actions/finance/dashboard.actions'

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

const FinanceDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    setError(null)
    try {
      const data = await getDashboardSummary()
      setSummary(data)
    } catch (err: any) {
      console.error('Error loading dashboard:', err)
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Fragment>
        <Seo title="Finance Dashboard" />
        <Pageheader
          title="Finance"
          subtitle="Dashboard"
          currentpage="Dashboard"
          activepage="Finance Dashboard"
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
        <Seo title="Finance Dashboard" />
        <Pageheader
          title="Finance"
          subtitle="Dashboard"
          currentpage="Dashboard"
          activepage="Finance Dashboard"
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

  if (!summary) return null

  return (
    <Fragment>
      <Seo title="Finance Dashboard" />
      <Pageheader
        title="Finance"
        subtitle="Dashboard"
        currentpage="Dashboard"
        activepage="Finance Dashboard"
      />

      <Row className="g-3">
        {/* Summary Cards */}
        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1">Total Balance</p>
                  <h3 className="mb-0 text-nowrap">
                    Rp {formatCurrencyWithSpaces(summary.totalBalance)}
                  </h3>
                </div>
                <div className="avatar avatar-md bg-primary-transparent">
                  <i className="ri-wallet-3-line fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1">Total Income</p>
                  <h3 className="mb-0 text-success text-nowrap">
                    Rp {formatCurrencyWithSpaces(summary.totalIncome)}
                  </h3>
                </div>
                <div className="avatar avatar-md bg-success-transparent">
                  <i className="ri-arrow-down-line fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1">Total Expense</p>
                  <h3 className="mb-0 text-danger text-nowrap">
                    Rp {formatCurrencyWithSpaces(summary.totalExpense)}
                  </h3>
                </div>
                <div className="avatar avatar-md bg-danger-transparent">
                  <i className="ri-arrow-up-line fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-muted mb-1">Net Income</p>
                  <h3
                    className={`mb-0 text-nowrap ${
                      summary.netIncome >= 0 ? 'text-success' : 'text-danger'
                    }`}
                  >
                    Rp {formatCurrencyWithSpaces(summary.netIncome)}
                  </h3>
                </div>
                <div className="avatar avatar-md bg-info-transparent">
                  <i className="ri-line-chart-line fs-20"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Account Balances */}
        <Col xl={6} lg={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Account Balances</div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Bank</th>
                      <th className="text-end">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.accountBalances.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-muted">
                          No accounts found
                        </td>
                      </tr>
                    ) : (
                      summary.accountBalances.map((acc) => (
                        <tr key={acc.account_id}>
                          <td>{acc.account_name}</td>
                          <td>{acc.bank_name}</td>
                          <td className="text-end text-nowrap">
                            Rp {formatCurrencyWithSpaces(acc.current_balance)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Top Categories */}
        <Col xl={6} lg={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Top Categories</div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th className="text-end">Amount</th>
                      <th className="text-end">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.topCategories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-muted">
                          No categories found
                        </td>
                      </tr>
                    ) : (
                      summary.topCategories.map((cat) => (
                        <tr key={cat.category_id}>
                          <td>{cat.category_name}</td>
                          <td className="text-end text-nowrap">
                            Rp {formatCurrencyWithSpaces(cat.total_amount)}
                          </td>
                          <td className="text-end">{cat.transaction_count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Transactions */}
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Recent Transactions</div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Account</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th className="text-end">Amount</th>
                      <th className="text-end">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      summary.recentTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>
                            {new Date(tx.transaction_date).toLocaleDateString()}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                tx.transaction_type === 'Income'
                                  ? 'bg-success'
                                  : tx.transaction_type === 'Expense'
                                  ? 'bg-danger'
                                  : 'bg-info'
                              }`}
                            >
                              {tx.transaction_type}
                            </span>
                          </td>
                          <td className="text-nowrap">{tx.account_name}</td>
                          <td>
                            {tx.category_name || (
                              tx.transfer_to_account_name
                                ? `→ ${tx.transfer_to_account_name}`
                                : '-'
                            )}
                          </td>
                          <td className="text-nowrap">{tx.description || '-'}</td>
                          <td className="text-end text-nowrap">
                            {tx.transaction_type === 'Expense' ? '-' : ''}Rp{' '}
                            {formatCurrencyWithSpaces(tx.amount)}
                          </td>
                          <td className="text-end text-nowrap">
                            Rp {formatCurrencyWithSpaces(tx.balance_after)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default FinanceDashboard

