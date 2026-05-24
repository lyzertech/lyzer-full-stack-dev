import { apiClient } from '@/lib/api-client'

const BASE = '/finance/banks'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Bank {
  id: number
  name: string
  code: string | null
  account_number: string | null
  routing_number: string | null
  branch: string | null
  contact_person: string | null
  contact_phone: string | null
  contact_email: string | null
  website: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface CreateBankInput {
  name: string
  code?: string | null
  account_number?: string | null
  routing_number?: string | null
  branch?: string | null
  contact_person?: string | null
  contact_phone?: string | null
  contact_email?: string | null
  website?: string | null
  notes?: string | null
  is_active?: boolean
}

export interface UpdateBankInput extends Partial<CreateBankInput> {
  id: number
}

// ─── API ─────────────────────────────────────────────────────────────────────

export async function getBanks(includeInactive = false): Promise<Bank[]> {
  const params = includeInactive ? '?include_inactive=1' : ''
  const { data } = await apiClient.get(`${BASE}${params}`)
  return data as Bank[]
}

export async function getBankById(id: number): Promise<Bank> {
  const { data } = await apiClient.get(`${BASE}/${id}`)
  return data as Bank
}

export async function createBank(input: CreateBankInput): Promise<Bank> {
  if (!input.name || input.name.trim() === '') throw new Error('Bank name is required')

  const { data } = await apiClient.post(BASE, input)
  return data as Bank
}

export async function updateBank(input: UpdateBankInput): Promise<Bank> {
  if (!input.id) throw new Error('Bank ID is required')
  if (input.name !== undefined && input.name.trim() === '') {
    throw new Error('Bank name cannot be empty')
  }

  const { data } = await apiClient.put(`${BASE}/${input.id}`, input)
  return data as Bank
}

export async function deleteBank(id: number): Promise<boolean> {
  if (!id) throw new Error('Bank ID is required')

  await apiClient.delete(`${BASE}/${id}`)
  return true
}
