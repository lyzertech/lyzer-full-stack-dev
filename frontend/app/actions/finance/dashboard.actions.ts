'use server'

import { cookies } from 'next/headers'

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

async function getBearerToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('laravel_token')?.value ?? null
}

async function laravelFetch(path: string, init?: RequestInit) {
  const token = await getBearerToken()
  if (!token) throw new Error('Unauthorized')

  const res = await fetch(`${LARAVEL_API_URL}/api/v1/finance${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })

  const text = await res.text()
  let parsed: unknown = null
  try { parsed = text ? JSON.parse(text) : null } catch { parsed = null }

  if (!res.ok) {
    const msg =
      parsed && typeof parsed === 'object' && parsed !== null && 'error' in parsed
        ? String((parsed as Record<string, unknown>).error)
        : text || res.statusText
    throw new Error(msg)
  }

  return parsed
}

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

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function getDashboardSummary(
  startDate?: Date | string,
  endDate?: Date | string
): Promise<DashboardSummary> {
  try {
    const params = new URLSearchParams()
    if (startDate) params.set('start_date', String(startDate))
    if (endDate) params.set('end_date', String(endDate))

    const qs = params.toString()
    const data = await laravelFetch(`/dashboard${qs ? `?${qs}` : ''}`)
    return data as DashboardSummary
  } catch (error: any) {
    console.error('Error fetching dashboard summary:', error)
    throw new Error(error.message || 'Failed to fetch dashboard summary')
  }
}

export async function getMonthlySummary(
  year?: number,
  months?: number
): Promise<PeriodSummary[]> {
  try {
    const params = new URLSearchParams()
    if (year)   params.set('year', String(year))
    if (months) params.set('months', String(months))

    const qs = params.toString()
    const data = await laravelFetch(`/dashboard/monthly${qs ? `?${qs}` : ''}`)
    return data as PeriodSummary[]
  } catch (error: any) {
    console.error('Error fetching monthly summary:', error)
    throw new Error(error.message || 'Failed to fetch monthly summary')
  }
}

export async function getAccountSummary(accountId: number) {
  try {
    const data = await laravelFetch(`/accounts/${accountId}`)
    return data
  } catch (error: any) {
    console.error('Error fetching account summary:', error)
    throw new Error(error.message || 'Failed to fetch account summary')
  }
}
