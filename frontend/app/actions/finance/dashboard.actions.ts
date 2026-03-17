'use server'

import { getPool } from '@/lib/db'
import type { RowDataPacket } from 'mysql2'

export interface DashboardSummary {
  totalBalance: number
  totalIncome: number
  totalExpense: number
  netIncome: number
  accountCount: number
  transactionCount: number
  recentTransactions: any[]
  topCategories: Array<{
    category_id: number
    category_name: string
    total_amount: number
    transaction_count: number
  }>
  accountBalances: Array<{
    account_id: number
    account_name: string
    bank_name: string
    current_balance: number
  }>
}

export interface PeriodSummary {
  period: string
  income: number
  expense: number
  net: number
}

export async function getDashboardSummary(
  startDate?: Date | string,
  endDate?: Date | string
): Promise<DashboardSummary> {
  try {
    const pool = getPool()
    const dateFilter =
      startDate && endDate
        ? `AND t.transaction_date BETWEEN ? AND ?`
        : startDate
        ? `AND t.transaction_date >= ?`
        : endDate
        ? `AND t.transaction_date <= ?`
        : ''

    const dateParams: any[] = []
    if (startDate) dateParams.push(startDate)
    if (endDate) dateParams.push(endDate)

    // Total balance across all accounts
    const [balanceRows] = await pool.execute<RowDataPacket[]>(
      'SELECT SUM(current_balance) as total FROM finance_accounts WHERE is_active = 1'
    )
    const totalBalance = balanceRows[0] ? Number(balanceRows[0].total) || 0 : 0

    // Total income and expense for period
    const [summaryRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END) as total_expense,
        COUNT(*) as transaction_count
      FROM finance_transactions t
      WHERE 1=1 ${dateFilter}`,
      dateParams
    )
    const totalIncome = summaryRows[0] ? Number(summaryRows[0].total_income) || 0 : 0
    const totalExpense = summaryRows[0] ? Number(summaryRows[0].total_expense) || 0 : 0
    const transactionCount = summaryRows[0] ? Number(summaryRows[0].transaction_count) || 0 : 0
    const netIncome = totalIncome - totalExpense

    // Account count
    const [accountCountRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM finance_accounts WHERE is_active = 1'
    )
    const accountCount = accountCountRows[0] ? Number(accountCountRows[0].count) : 0

    // Recent transactions (last 10)
    const [recentRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        t.*,
        a.name as account_name,
        a.account_type,
        b.name as bank_name,
        a2.name as transfer_to_account_name,
        c.name as category_name,
        c.type as category_type
      FROM finance_transactions t
      INNER JOIN finance_accounts a ON t.account_id = a.id
      INNER JOIN finance_banks b ON a.bank_id = b.id
      LEFT JOIN finance_accounts a2 ON t.transfer_to_account_id = a2.id
      LEFT JOIN finance_categories c ON t.category_id = c.id
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT 10`
    )

    // Top categories by amount
    const [topCategoriesRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        c.id as category_id,
        c.name as category_name,
        SUM(t.amount) as total_amount,
        COUNT(*) as transaction_count
      FROM finance_transactions t
      INNER JOIN finance_categories c ON t.category_id = c.id
      WHERE t.transaction_type IN ('Income', 'Expense') ${dateFilter}
      GROUP BY c.id, c.name
      ORDER BY total_amount DESC
      LIMIT 10`,
      dateParams
    )

    // Account balances
    const [accountBalancesRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        a.id as account_id,
        a.name as account_name,
        b.name as bank_name,
        a.current_balance
      FROM finance_accounts a
      INNER JOIN finance_banks b ON a.bank_id = b.id
      WHERE a.is_active = 1
      ORDER BY a.current_balance DESC`
    )

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      netIncome,
      accountCount,
      transactionCount,
      recentTransactions: recentRows as any[],
      topCategories: topCategoriesRows.map((row) => ({
        category_id: Number(row.category_id),
        category_name: String(row.category_name),
        total_amount: Number(row.total_amount),
        transaction_count: Number(row.transaction_count),
      })),
      accountBalances: accountBalancesRows.map((row) => ({
        account_id: Number(row.account_id),
        account_name: String(row.account_name),
        bank_name: String(row.bank_name),
        current_balance: Number(row.current_balance),
      })),
    }
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    throw new Error('Failed to fetch dashboard summary')
  }
}

export async function getMonthlySummary(
  year?: number,
  months?: number
): Promise<PeriodSummary[]> {
  try {
    const pool = getPool()
    const targetYear = year || new Date().getFullYear()
    const monthCount = months || 12

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as period,
        SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END) as expense,
        SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE -amount END) as net
      FROM finance_transactions
      WHERE YEAR(transaction_date) = ?
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY period DESC
      LIMIT ?`,
      [targetYear, monthCount]
    )

    return rows.map((row) => ({
      period: String(row.period),
      income: Number(row.income) || 0,
      expense: Number(row.expense) || 0,
      net: Number(row.net) || 0,
    }))
  } catch (error) {
    console.error('Error fetching monthly summary:', error)
    throw new Error('Failed to fetch monthly summary')
  }
}

export async function getAccountSummary(accountId: number): Promise<{
  account: any
  currentBalance: number
  totalIncome: number
  totalExpense: number
  totalTransfers: number
  transactionCount: number
}> {
  try {
    const pool = getPool()

    // Get account details
    const [accountRows] = await pool.execute<RowDataPacket[]>(
      `SELECT a.*, b.name as bank_name 
       FROM finance_accounts a 
       INNER JOIN finance_banks b ON a.bank_id = b.id 
       WHERE a.id = ?`,
      [accountId]
    )
    if (!accountRows || accountRows.length === 0) {
      throw new Error('Account not found')
    }

    const account = accountRows[0]
    const currentBalance = Number(account.current_balance)

    // Get transaction summary
    const [summaryRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END) as total_expense,
        SUM(CASE WHEN transaction_type = 'Transfer' THEN amount ELSE 0 END) as total_transfers,
        COUNT(*) as transaction_count
      FROM finance_transactions
      WHERE account_id = ?`,
      [accountId]
    )

    const summary = summaryRows[0]

    return {
      account,
      currentBalance,
      totalIncome: summary ? Number(summary.total_income) || 0 : 0,
      totalExpense: summary ? Number(summary.total_expense) || 0 : 0,
      totalTransfers: summary ? Number(summary.total_transfers) || 0 : 0,
      transactionCount: summary ? Number(summary.transaction_count) || 0 : 0,
    }
  } catch (error) {
    console.error('Error fetching account summary:', error)
    throw new Error('Failed to fetch account summary')
  }
}

