import { apiClient } from '@/lib/api-client'

const BASE = '/finance/accounts'

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

// ─── API ─────────────────────────────────────────────────────────────────────

export async function getAccounts(includeInactive = false): Promise<Account[]> {
  const params = includeInactive ? '?include_inactive=1' : ''
  const { data } = await apiClient.get(`${BASE}${params}`)
  return data as Account[]
}

export async function getAccountById(id: number): Promise<Account> {
  const { data } = await apiClient.get(`${BASE}/${id}`)
  return data as Account
}

export async function getAccountsByBankId(bankId: number): Promise<Account[]> {
  const { data } = await apiClient.get(`${BASE}?bank_id=${bankId}`)
  return data as Account[]
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  if (!input.name || input.name.trim() === '') throw new Error('Account name is required')
  if (!input.bank_id) throw new Error('Bank ID is required')

  const { data } = await apiClient.post(BASE, input)
  return data as Account
}

export async function updateAccount(input: UpdateAccountInput): Promise<Account> {
  if (!input.id) throw new Error('Account ID is required')
  if (input.name !== undefined && input.name.trim() === '') {
    throw new Error('Account name cannot be empty')
  }

  const { data } = await apiClient.put(`${BASE}/${input.id}`, input)
  return data as Account
}

export async function deleteAccount(id: number): Promise<boolean> {
  if (!id) throw new Error('Account ID is required')

  await apiClient.delete(`${BASE}/${id}`)
  return true
}
