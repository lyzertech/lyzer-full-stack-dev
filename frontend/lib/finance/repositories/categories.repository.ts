import { getPool } from '@/lib/db'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'

export interface Category {
  id: number
  name: string
  type: 'Income' | 'Expense'
  parent_id: number | null
  description: string | null
  color: string | null
  icon: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date | null
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

export class CategoriesRepository {
  async findAll(type?: 'Income' | 'Expense', includeInactive = false): Promise<Category[]> {
    const pool = getPool()
    let query = 'SELECT * FROM finance_categories WHERE 1=1'
    const params: any[] = []

    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }
    if (!includeInactive) {
      query += ' AND is_active = 1'
    }
    query += ' ORDER BY type ASC, name ASC'

    const [rows] = await pool.execute<RowDataPacket[]>(query, params)
    return rows as Category[]
  }

  async findById(id: number): Promise<Category | null> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM finance_categories WHERE id = ?',
      [id]
    )
    return (rows[0] as Category) || null
  }

  async findByParentId(parentId: number): Promise<Category[]> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM finance_categories WHERE parent_id = ? AND is_active = 1 ORDER BY name ASC',
      [parentId]
    )
    return rows as Category[]
  }

  async findTree(type?: 'Income' | 'Expense'): Promise<CategoryWithChildren[]> {
    const all = await this.findAll(type)
    const parents = all.filter((c) => !c.parent_id)
    return parents.map((parent) => ({
      ...parent,
      children: all.filter((c) => c.parent_id === parent.id),
    }))
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const pool = getPool()
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO finance_categories 
       (name, type, parent_id, description, color, icon, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name,
        input.type,
        input.parent_id || null,
        input.description || null,
        input.color || null,
        input.icon || null,
        input.is_active !== undefined ? (input.is_active ? 1 : 0) : 1,
      ]
    )

    const category = await this.findById(result.insertId)
    if (!category) throw new Error('Failed to retrieve created category')
    return category
  }

  async update(input: UpdateCategoryInput): Promise<Category> {
    const pool = getPool()
    const fields: string[] = []
    const values: any[] = []

    if (input.name !== undefined) {
      fields.push('name = ?')
      values.push(input.name)
    }
    if (input.type !== undefined) {
      fields.push('type = ?')
      values.push(input.type)
    }
    if (input.parent_id !== undefined) {
      fields.push('parent_id = ?')
      values.push(input.parent_id)
    }
    if (input.description !== undefined) {
      fields.push('description = ?')
      values.push(input.description)
    }
    if (input.color !== undefined) {
      fields.push('color = ?')
      values.push(input.color)
    }
    if (input.icon !== undefined) {
      fields.push('icon = ?')
      values.push(input.icon)
    }
    if (input.is_active !== undefined) {
      fields.push('is_active = ?')
      values.push(input.is_active ? 1 : 0)
    }

    if (fields.length === 0) {
      const category = await this.findById(input.id)
      if (!category) throw new Error('Category not found')
      return category
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(input.id)

    await pool.execute(
      `UPDATE finance_categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    const category = await this.findById(input.id)
    if (!category) throw new Error('Category not found')
    return category
  }

  async delete(id: number): Promise<boolean> {
    const pool = getPool()
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM finance_categories WHERE id = ?',
      [id]
    )
    return result.affectedRows > 0
  }
}

