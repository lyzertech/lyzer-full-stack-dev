import { apiClient } from '@/lib/api-client'

const BASE = '/finance/categories'

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

// ─── API ─────────────────────────────────────────────────────────────────────

export async function getCategories(
  type?: 'Income' | 'Expense',
  includeInactive = false
): Promise<Category[]> {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (includeInactive) params.set('include_inactive', '1')
  const qs = params.toString()
  const { data } = await apiClient.get(`${BASE}${qs ? `?${qs}` : ''}`)
  return data as Category[]
}

export async function getCategoryById(id: number): Promise<Category> {
  const { data } = await apiClient.get(`${BASE}/${id}`)
  return data as Category
}

export async function getCategoryTree(
  type?: 'Income' | 'Expense'
): Promise<CategoryWithChildren[]> {
  const params = new URLSearchParams({ tree: '1' })
  if (type) params.set('type', type)
  const { data } = await apiClient.get(`${BASE}/tree?${params.toString()}`)
  return data as CategoryWithChildren[]
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  if (!input.name || input.name.trim() === '') throw new Error('Category name is required')
  if (!input.type) throw new Error('Category type is required')

  const { data } = await apiClient.post(BASE, input)
  return data as Category
}

export async function updateCategory(input: UpdateCategoryInput): Promise<Category> {
  if (!input.id) throw new Error('Category ID is required')
  if (input.name !== undefined && input.name.trim() === '') {
    throw new Error('Category name cannot be empty')
  }

  const { data } = await apiClient.put(`${BASE}/${input.id}`, input)
  return data as Category
}

export async function deleteCategory(id: number): Promise<boolean> {
  if (!id) throw new Error('Category ID is required')

  await apiClient.delete(`${BASE}/${id}`)
  return true
}
