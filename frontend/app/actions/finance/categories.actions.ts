'use server'

import {
  CategoriesRepository,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@/lib/finance/repositories/categories.repository'

const categoriesRepo = new CategoriesRepository()

export async function getCategories(
  type?: 'Income' | 'Expense',
  includeInactive = false
) {
  try {
    return await categoriesRepo.findAll(type, includeInactive)
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw new Error('Failed to fetch categories')
  }
}

export async function getCategoryById(id: number) {
  try {
    return await categoriesRepo.findById(id)
  } catch (error) {
    console.error('Error fetching category:', error)
    throw new Error('Failed to fetch category')
  }
}

export async function getCategoryTree(type?: 'Income' | 'Expense') {
  try {
    return await categoriesRepo.findTree(type)
  } catch (error) {
    console.error('Error fetching category tree:', error)
    throw new Error('Failed to fetch category tree')
  }
}

export async function createCategory(input: CreateCategoryInput) {
  try {
    if (!input.name || input.name.trim() === '') {
      throw new Error('Category name is required')
    }
    if (!input.type) {
      throw new Error('Category type is required')
    }
    return await categoriesRepo.create(input)
  } catch (error: any) {
    console.error('Error creating category:', error)
    throw new Error(error.message || 'Failed to create category')
  }
}

export async function updateCategory(input: UpdateCategoryInput) {
  try {
    if (!input.id) {
      throw new Error('Category ID is required')
    }
    if (input.name !== undefined && input.name.trim() === '') {
      throw new Error('Category name cannot be empty')
    }
    return await categoriesRepo.update(input)
  } catch (error: any) {
    console.error('Error updating category:', error)
    throw new Error(error.message || 'Failed to update category')
  }
}

export async function deleteCategory(id: number) {
  try {
    if (!id) {
      throw new Error('Category ID is required')
    }
    return await categoriesRepo.delete(id)
  } catch (error: any) {
    console.error('Error deleting category:', error)
    throw new Error(error.message || 'Failed to delete category')
  }
}

