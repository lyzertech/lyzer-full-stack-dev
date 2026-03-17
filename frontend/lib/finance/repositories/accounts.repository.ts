import { getPool } from '@/lib/db'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'

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
  created_at: Date
  updated_at: Date | null
}

export interface AccountWithBank extends Account {
  bank_name: string
  bank_code: string | null
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

export class AccountsRepository {
  async findAll(includeInactive = false): Promise<AccountWithBank[]> {
    const pool = getPool()
    const query = includeInactive
      ? `SELECT a.*, b.name as bank_name, b.code as bank_code 
         FROM finance_accounts a 
         INNER JOIN finance_banks b ON a.bank_id = b.id 
         ORDER BY b.name ASC, a.name ASC`
      : `SELECT a.*, b.name as bank_name, b.code as bank_code 
         FROM finance_accounts a 
         INNER JOIN finance_banks b ON a.bank_id = b.id 
         WHERE a.is_active = 1 
         ORDER BY b.name ASC, a.name ASC`
    const [rows] = await pool.execute<RowDataPacket[]>(query)
    return rows as AccountWithBank[]
  }

  async findById(id: number): Promise<AccountWithBank | null> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT a.*, b.name as bank_name, b.code as bank_code 
       FROM finance_accounts a 
       INNER JOIN finance_banks b ON a.bank_id = b.id 
       WHERE a.id = ?`,
      [id]
    )
    return (rows[0] as AccountWithBank) || null
  }

  async findByBankId(bankId: number): Promise<Account[]> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM finance_accounts WHERE bank_id = ? AND is_active = 1 ORDER BY name ASC',
      [bankId]
    )
    return rows as Account[]
  }

  async create(input: CreateAccountInput): Promise<Account> {
    const pool = getPool()
    const initialBalance = input.initial_balance || 0
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO finance_accounts 
       (bank_id, name, account_number, account_type, currency, initial_balance, current_balance, notes, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.bank_id,
        input.name,
        input.account_number || null,
        input.account_type || 'Checking',
        input.currency || 'IDR',
        initialBalance,
        initialBalance, // current_balance starts same as initial
        input.notes || null,
        input.is_active !== undefined ? (input.is_active ? 1 : 0) : 1,
      ]
    )

    const account = await this.findById(result.insertId)
    if (!account) throw new Error('Failed to retrieve created account')
    return account
  }

  async update(input: UpdateAccountInput): Promise<Account> {
    const pool = getPool()
    const fields: string[] = []
    const values: any[] = []

    if (input.bank_id !== undefined) {
      fields.push('bank_id = ?')
      values.push(input.bank_id)
    }
    if (input.name !== undefined) {
      fields.push('name = ?')
      values.push(input.name)
    }
    if (input.account_number !== undefined) {
      fields.push('account_number = ?')
      values.push(input.account_number)
    }
    if (input.account_type !== undefined) {
      fields.push('account_type = ?')
      values.push(input.account_type)
    }
    if (input.currency !== undefined) {
      fields.push('currency = ?')
      values.push(input.currency)
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
      const account = await this.findById(input.id)
      if (!account) throw new Error('Account not found')
      return account
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(input.id)

    await pool.execute(
      `UPDATE finance_accounts SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    const account = await this.findById(input.id)
    if (!account) throw new Error('Account not found')
    return account
  }

  async updateBalance(accountId: number, newBalance: number): Promise<void> {
    const pool = getPool()
    await pool.execute(
      'UPDATE finance_accounts SET current_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newBalance, accountId]
    )
  }

  async delete(id: number): Promise<boolean> {
    const pool = getPool()
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM finance_accounts WHERE id = ?',
      [id]
    )
    return result.affectedRows > 0
  }
}

