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

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function getBanks(includeInactive = false): Promise<Bank[]> {
  try {
    const params = includeInactive ? '?include_inactive=1' : ''
    return (await laravelFetch(`/banks${params}`)) as Bank[]
  } catch (error: any) {
    console.error('Error fetching banks:', error)
    throw new Error(error.message || 'Failed to fetch banks')
  }
}

export async function getBankById(id: number): Promise<Bank> {
  try {
    return (await laravelFetch(`/banks/${id}`)) as Bank
  } catch (error: any) {
    console.error('Error fetching bank:', error)
    throw new Error(error.message || 'Failed to fetch bank')
  }
}

export async function createBank(input: CreateBankInput): Promise<Bank> {
  try {
    if (!input.name || input.name.trim() === '') throw new Error('Bank name is required')

    return (await laravelFetch('/banks', {
      method: 'POST',
      body: JSON.stringify(input),
    })) as Bank
  } catch (error: any) {
    console.error('Error creating bank:', error)
    throw new Error(error.message || 'Failed to create bank')
  }
}

export async function updateBank(input: UpdateBankInput): Promise<Bank> {
  try {
    if (!input.id) throw new Error('Bank ID is required')
    if (input.name !== undefined && input.name.trim() === '') throw new Error('Bank name cannot be empty')

    return (await laravelFetch(`/banks/${input.id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })) as Bank
  } catch (error: any) {
    console.error('Error updating bank:', error)
    throw new Error(error.message || 'Failed to update bank')
  }
}

export async function deleteBank(id: number): Promise<boolean> {
  try {
    if (!id) throw new Error('Bank ID is required')

    await laravelFetch(`/banks/${id}`, { method: 'DELETE' })
    return true
  } catch (error: any) {
    console.error('Error deleting bank:', error)
    throw new Error(error.message || 'Failed to delete bank')
  }
}
