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

export interface Category {
  id: number
  name: string
  type: 'Income' | 'Expense'
  parent_id: number | null
  description: string | null
  color: string | null
  icon: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface CategoryWithChildren extends Category {
  children?: Category[]
}

export interface CreateCategoryInput {
  name: string
  type: 'Income' | 'Expense'
  parent_id?: number | null
  description?: string | null
  color?: string | null
  icon?: string | null
  is_active?: boolean
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: number
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function getCategories(
  type?: 'Income' | 'Expense',
  includeInactive = false
): Promise<Category[]> {
  try {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (includeInactive) params.set('include_inactive', '1')
    const qs = params.toString()
    return (await laravelFetch(`/categories${qs ? `?${qs}` : ''}`)) as Category[]
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    throw new Error(error.message || 'Failed to fetch categories')
  }
}

export async function getCategoryById(id: number): Promise<Category> {
  try {
    return (await laravelFetch(`/categories/${id}`)) as Category
  } catch (error: any) {
    console.error('Error fetching category:', error)
    throw new Error(error.message || 'Failed to fetch category')
  }
}

export async function getCategoryTree(type?: 'Income' | 'Expense'): Promise<CategoryWithChildren[]> {
  try {
    const params = new URLSearchParams({ tree: '1' })
    if (type) params.set('type', type)
    return (await laravelFetch(`/categories/tree?${params.toString()}`)) as CategoryWithChildren[]
  } catch (error: any) {
    console.error('Error fetching category tree:', error)
    throw new Error(error.message || 'Failed to fetch category tree')
  }
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  try {
    if (!input.name || input.name.trim() === '') throw new Error('Category name is required')
    if (!input.type) throw new Error('Category type is required')

    return (await laravelFetch('/categories', {
      method: 'POST',
      body: JSON.stringify(input),
    })) as Category
  } catch (error: any) {
    console.error('Error creating category:', error)
    throw new Error(error.message || 'Failed to create category')
  }
}

export async function updateCategory(input: UpdateCategoryInput): Promise<Category> {
  try {
    if (!input.id) throw new Error('Category ID is required')
    if (input.name !== undefined && input.name.trim() === '') throw new Error('Category name cannot be empty')

    return (await laravelFetch(`/categories/${input.id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })) as Category
  } catch (error: any) {
    console.error('Error updating category:', error)
    throw new Error(error.message || 'Failed to update category')
  }
}

export async function deleteCategory(id: number): Promise<boolean> {
  try {
    if (!id) throw new Error('Category ID is required')

    await laravelFetch(`/categories/${id}`, { method: 'DELETE' })
    return true
  } catch (error: any) {
    console.error('Error deleting category:', error)
    throw new Error(error.message || 'Failed to delete category')
  }
}
