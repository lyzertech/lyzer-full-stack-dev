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

export interface Account {
  id: number
  bank_id: number
  name: string
  account_number: string | null
  account_type: 'Checking' | 'Savings' | 'Credit' | 'Investment' | 'Cash' | 'Other'
  currency: string
  initial_balance: number
  current_balance: number
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
  bank_name?: string
  bank_code?: string | null
}

export interface CreateAccountInput {
  bank_id: number
  name: string
  account_number?: string | null
  account_type?: Account['account_type']
  currency?: string
  initial_balance?: number
  notes?: string | null
  is_active?: boolean
}

export interface UpdateAccountInput extends Partial<CreateAccountInput> {
  id: number
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function getAccounts(includeInactive = false): Promise<Account[]> {
  try {
    const params = includeInactive ? '?include_inactive=1' : ''
    return (await laravelFetch(`/accounts${params}`)) as Account[]
  } catch (error: any) {
    console.error('Error fetching accounts:', error)
    throw new Error(error.message || 'Failed to fetch accounts')
  }
}

export async function getAccountById(id: number): Promise<Account> {
  try {
    return (await laravelFetch(`/accounts/${id}`)) as Account
  } catch (error: any) {
    console.error('Error fetching account:', error)
    throw new Error(error.message || 'Failed to fetch account')
  }
}

export async function getAccountsByBankId(bankId: number): Promise<Account[]> {
  try {
    return (await laravelFetch(`/accounts?bank_id=${bankId}`)) as Account[]
  } catch (error: any) {
    console.error('Error fetching accounts by bank:', error)
    throw new Error(error.message || 'Failed to fetch accounts')
  }
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  try {
    if (!input.name || input.name.trim() === '') throw new Error('Account name is required')
    if (!input.bank_id) throw new Error('Bank ID is required')

    return (await laravelFetch('/accounts', {
      method: 'POST',
      body: JSON.stringify(input),
    })) as Account
  } catch (error: any) {
    console.error('Error creating account:', error)
    throw new Error(error.message || 'Failed to create account')
  }
}

export async function updateAccount(input: UpdateAccountInput): Promise<Account> {
  try {
    if (!input.id) throw new Error('Account ID is required')
    if (input.name !== undefined && input.name.trim() === '') throw new Error('Account name cannot be empty')

    return (await laravelFetch(`/accounts/${input.id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })) as Account
  } catch (error: any) {
    console.error('Error updating account:', error)
    throw new Error(error.message || 'Failed to update account')
  }
}

export async function deleteAccount(id: number): Promise<boolean> {
  try {
    if (!id) throw new Error('Account ID is required')

    await laravelFetch(`/accounts/${id}`, { method: 'DELETE' })
    return true
  } catch (error: any) {
    console.error('Error deleting account:', error)
    throw new Error(error.message || 'Failed to delete account')
  }
}
