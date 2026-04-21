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

export interface Transaction {
  id: number
  transaction_type: 'Income' | 'Expense' | 'Transfer'
  account_id: number
  transfer_to_account_id: number | null
  category_id: number | null
  amount: number
  balance_after: number
  description: string | null
  reference_number: string | null
  transaction_date: string
  notes: string | null
  created_at: string
  updated_at: string | null
  // Joined fields
  account_name?: string
  account_type?: string
  bank_name?: string
  transfer_to_account_name?: string | null
  category_name?: string | null
  category_type?: string | null
}

export interface CreateTransactionInput {
  transaction_type: 'Income' | 'Expense' | 'Transfer'
  account_id: number
  transfer_to_account_id?: number | null
  category_id?: number | null
  amount: number
  description?: string | null
  reference_number?: string | null
  transaction_date: Date | string
  notes?: string | null
}

export interface TransactionFilters {
  account_id?: number
  category_id?: number
  transaction_type?: 'Income' | 'Expense' | 'Transfer'
  start_date?: Date | string
  end_date?: Date | string
  limit?: number
  offset?: number
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.account_id)       params.set('account_id',       String(filters.account_id))
    if (filters?.category_id)      params.set('category_id',      String(filters.category_id))
    if (filters?.transaction_type) params.set('transaction_type', filters.transaction_type)
    if (filters?.start_date)       params.set('start_date',       String(filters.start_date))
    if (filters?.end_date)         params.set('end_date',         String(filters.end_date))
    if (filters?.limit)            params.set('limit',            String(filters.limit))
    if (filters?.offset)           params.set('offset',           String(filters.offset))

    const qs = params.toString()
    return (await laravelFetch(`/transactions${qs ? `?${qs}` : ''}`)) as Transaction[]
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    throw new Error(error.message || 'Failed to fetch transactions')
  }
}

export async function getTransactionById(id: number): Promise<Transaction> {
  try {
    return (await laravelFetch(`/transactions/${id}`)) as Transaction
  } catch (error: any) {
    console.error('Error fetching transaction:', error)
    throw new Error(error.message || 'Failed to fetch transaction')
  }
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  try {
    if (!input.account_id)    throw new Error('Account ID is required')
    if (!input.amount || input.amount <= 0) throw new Error('Amount must be greater than 0')
    if (!input.transaction_type) throw new Error('Transaction type is required')
    if (
      (input.transaction_type === 'Income' || input.transaction_type === 'Expense') &&
      !input.category_id
    ) {
      throw new Error('Category is required for Income/Expense transactions')
    }
    if (input.transaction_type === 'Transfer' && !input.transfer_to_account_id) {
      throw new Error('Destination account is required for Transfer transactions')
    }
    if (
      input.transaction_type === 'Transfer' &&
      input.account_id === input.transfer_to_account_id
    ) {
      throw new Error('Cannot transfer to the same account')
    }

    return (await laravelFetch('/transactions', {
      method: 'POST',
      body: JSON.stringify(input),
    })) as Transaction
  } catch (error: any) {
    console.error('Error creating transaction:', error)
    throw new Error(error.message || 'Failed to create transaction')
  }
}

export async function transferBetweenAccounts(
  fromAccountId: number,
  toAccountId: number,
  amount: number,
  description?: string,
  transactionDate?: Date | string
): Promise<Transaction> {
  try {
    if (!fromAccountId || !toAccountId) throw new Error('Both source and destination accounts are required')
    if (fromAccountId === toAccountId)   throw new Error('Cannot transfer to the same account')
    if (!amount || amount <= 0)          throw new Error('Amount must be greater than 0')

    return (await laravelFetch('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        transaction_type: 'Transfer',
        account_id: fromAccountId,
        transfer_to_account_id: toAccountId,
        amount,
        description: description || `Transfer to account ${toAccountId}`,
        transaction_date: transactionDate || new Date().toISOString().split('T')[0],
      }),
    })) as Transaction
  } catch (error: any) {
    console.error('Error transferring between accounts:', error)
    throw new Error(error.message || 'Failed to transfer between accounts')
  }
}
