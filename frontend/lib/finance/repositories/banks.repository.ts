import { getPool } from '@/lib/db'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'

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
  created_at: Date
  updated_at: Date | null
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

export class BanksRepository {
  async findAll(includeInactive = false): Promise<Bank[]> {
    const pool = getPool()
    const query = includeInactive
      ? 'SELECT * FROM finance_banks ORDER BY name ASC'
      : 'SELECT * FROM finance_banks WHERE is_active = 1 ORDER BY name ASC'
    const [rows] = await pool.execute<RowDataPacket[]>(query)
    return rows as Bank[]
  }

  async findById(id: number): Promise<Bank | null> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM finance_banks WHERE id = ?',
      [id]
    )
    return (rows[0] as Bank) || null
  }

  async create(input: CreateBankInput): Promise<Bank> {
    const pool = getPool()
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO finance_banks 
       (name, code, account_number, routing_number, branch, contact_person, 
        contact_phone, contact_email, website, notes, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name,
        input.code || null,
        input.account_number || null,
        input.routing_number || null,
        input.branch || null,
        input.contact_person || null,
        input.contact_phone || null,
        input.contact_email || null,
        input.website || null,
        input.notes || null,
        input.is_active !== undefined ? (input.is_active ? 1 : 0) : 1,
      ]
    )

    const bank = await this.findById(result.insertId)
    if (!bank) throw new Error('Failed to retrieve created bank')
    return bank
  }

  async update(input: UpdateBankInput): Promise<Bank> {
    const pool = getPool()
    const fields: string[] = []
    const values: any[] = []

    if (input.name !== undefined) {
      fields.push('name = ?')
      values.push(input.name)
    }
    if (input.code !== undefined) {
      fields.push('code = ?')
      values.push(input.code)
    }
    if (input.account_number !== undefined) {
      fields.push('account_number = ?')
      values.push(input.account_number)
    }
    if (input.routing_number !== undefined) {
      fields.push('routing_number = ?')
      values.push(input.routing_number)
    }
    if (input.branch !== undefined) {
      fields.push('branch = ?')
      values.push(input.branch)
    }
    if (input.contact_person !== undefined) {
      fields.push('contact_person = ?')
      values.push(input.contact_person)
    }
    if (input.contact_phone !== undefined) {
      fields.push('contact_phone = ?')
      values.push(input.contact_phone)
    }
    if (input.contact_email !== undefined) {
      fields.push('contact_email = ?')
      values.push(input.contact_email)
    }
    if (input.website !== undefined) {
      fields.push('website = ?')
      values.push(input.website)
    }
    if (input.notes !== undefined) {
      fields.push('notes = ?')
      values.push(input.notes)
    }
    if (input.is_active !== undefined) {
      fields.push('is_active = ?')
      values.push(input.is_active ? 1 : 0)
    }

    if (fields.length === 0) {
      const bank = await this.findById(input.id)
      if (!bank) throw new Error('Bank not found')
      return bank
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(input.id)

    await pool.execute(
      `UPDATE finance_banks SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    const bank = await this.findById(input.id)
    if (!bank) throw new Error('Bank not found')
    return bank
  }

  async delete(id: number): Promise<boolean> {
    const pool = getPool()
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM finance_banks WHERE id = ?',
      [id]
    )
    return result.affectedRows > 0
  }
}

