import { apiClient } from '@/lib/api-client'

const BASE = '/finance/dashboard'

// ─── Types ───────────────────────────────────────────────────────────────────

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

export interface BalanceHistoryDataPoint {
  date: string
  balance: number
}

export interface AccountBalanceHistory {
  account_id: number
  account_name: string
  bank_name: string
  data: BalanceHistoryDataPoint[]
}

export interface BalanceHistoryResponse {
  series: AccountBalanceHistory[]
  start_date: string
  end_date: string
}

// ─── API ─────────────────────────────────────────────────────────────────────

export async function getDashboardSummary(
  startDate?: Date | string,
  endDate?: Date | string
): Promise<DashboardSummary> {
  const params = new URLSearchParams()
  if (startDate) params.set('start_date', String(startDate))
  if (endDate) params.set('end_date', String(endDate))

  const qs = params.toString()
  const { data } = await apiClient.get(`${BASE}${qs ? `?${qs}` : ''}`)
  return data as DashboardSummary
}

export async function getMonthlySummary(
  year?: number,
  months?: number
): Promise<PeriodSummary[]> {
  const params = new URLSearchParams()
  if (year) params.set('year', String(year))
  if (months) params.set('months', String(months))

  const qs = params.toString()
  const { data } = await apiClient.get(`${BASE}/monthly${qs ? `?${qs}` : ''}`)
  return data as PeriodSummary[]
}

export async function getAccountSummary(accountId: number) {
  const { data } = await apiClient.get(`/finance/accounts/${accountId}`)
  return data
}

export async function getBalanceHistory(
  days?: number,
  accountIds?: number[]
): Promise<BalanceHistoryResponse> {
  const params = new URLSearchParams()
  if (days) params.set('days', String(days))
  if (accountIds && accountIds.length > 0) {
    accountIds.forEach(id => params.append('account_ids[]', String(id)))
  }

  const qs = params.toString()
  const { data } = await apiClient.get(
    `${BASE}/balance-history${qs ? `?${qs}` : ''}`
  )
  return data as BalanceHistoryResponse
}
