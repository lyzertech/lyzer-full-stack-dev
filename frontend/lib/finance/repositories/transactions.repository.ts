import { getPool } from '@/lib/db'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'

export interface Transaction {
  id: number
  transaction_type: 'Income' | 'Expense' | 'Transfer'
  account_id: number
  transfer_to_account_id: number | null
  category_id: number | null
  amount: number
  balance_after: number
  description: string | null
  reference_number: string | null
  transaction_date: Date
  notes: string | null
  created_at: Date
  updated_at: Date | null
}

export interface TransactionWithDetails extends Transaction {
  account_name: string
  account_type: string
  bank_name: string
  transfer_to_account_name: string | null
  category_name: string | null
  category_type: string | null
}

export interface CreateTransactionInput {
  transaction_type: 'Income' | 'Expense' | 'Transfer'
  account_id: number
  transfer_to_account_id?: number | null
  category_id?: number | null
  amount: number
  description?: string | null
  reference_number?: string | null
  transaction_date: Date | string
  notes?: string | null
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: number
}

export interface TransactionFilters {
  account_id?: number
  category_id?: number
  transaction_type?: 'Income' | 'Expense' | 'Transfer'
  start_date?: Date | string
  end_date?: Date | string
  limit?: number
  offset?: number
}

export class TransactionsRepository {
  async findAll(filters?: TransactionFilters): Promise<TransactionWithDetails[]> {
    const pool = getPool()
    let query = `SELECT 
      t.*,
      a.name as account_name,
      a.account_type,
      b.name as bank_name,
      a2.name as transfer_to_account_name,
      c.name as category_name,
      c.type as category_type
    FROM finance_transactions t
    INNER JOIN finance_accounts a ON t.account_id = a.id
    INNER JOIN finance_banks b ON a.bank_id = b.id
    LEFT JOIN finance_accounts a2 ON t.transfer_to_account_id = a2.id
    LEFT JOIN finance_categories c ON t.category_id = c.id
    WHERE 1=1`
    const params: any[] = []

    if (filters?.account_id) {
      query += ' AND t.account_id = ?'
      params.push(filters.account_id)
    }
    if (filters?.category_id) {
      query += ' AND t.category_id = ?'
      params.push(filters.category_id)
    }
    if (filters?.transaction_type) {
      query += ' AND t.transaction_type = ?'
      params.push(filters.transaction_type)
    }
    if (filters?.start_date) {
      query += ' AND t.transaction_date >= ?'
      params.push(filters.start_date)
    }
    if (filters?.end_date) {
      query += ' AND t.transaction_date <= ?'
      params.push(filters.end_date)
    }

    query += ' ORDER BY t.transaction_date DESC, t.created_at DESC'

    // Handle LIMIT - MySQL requires integer values, not parameters for LIMIT/OFFSET
    if (filters?.limit) {
      const limit = Number(filters.limit)
      query += ` LIMIT ${limit}`
      if (filters.offset) {
        const offset = Number(filters.offset)
        query += ` OFFSET ${offset}`
      }
    }

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(query, params)
      return rows as TransactionWithDetails[]
    } catch (error: any) {
      console.error('Error in findAll transactions:', error)
      console.error('Query:', query)
      console.error('Params:', params)
      // If table doesn't exist, return empty array instead of throwing
      if (error.code === 'ER_NO_SUCH_TABLE' || error.code === '42S02') {
        console.warn('finance_transactions table does not exist yet')
        return []
      }
      throw error
    }
  }

  async findById(id: number): Promise<TransactionWithDetails | null> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        t.*,
        a.name as account_name,
        a.account_type,
        b.name as bank_name,
        a2.name as transfer_to_account_name,
        c.name as category_name,
        c.type as category_type
      FROM finance_transactions t
      INNER JOIN finance_accounts a ON t.account_id = a.id
      INNER JOIN finance_banks b ON a.bank_id = b.id
      LEFT JOIN finance_accounts a2 ON t.transfer_to_account_id = a2.id
      LEFT JOIN finance_categories c ON t.category_id = c.id
      WHERE t.id = ?`,
      [id]
    )
    return (rows[0] as TransactionWithDetails) || null
  }

  async getAccountBalance(accountId: number): Promise<number> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT current_balance FROM finance_accounts WHERE id = ?',
      [accountId]
    )
    return rows[0] ? Number(rows[0].current_balance) : 0
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Get current balance
      const [balanceRows] = await connection.execute<RowDataPacket[]>(
        'SELECT current_balance FROM finance_accounts WHERE id = ? FOR UPDATE',
        [input.account_id]
      )
      if (!balanceRows || balanceRows.length === 0) {
        throw new Error('Account not found')
      }

      let currentBalance = Number(balanceRows[0].current_balance)
      let balanceAfter = currentBalance

      // Calculate new balance based on transaction type
      if (input.transaction_type === 'Income') {
        balanceAfter = currentBalance + input.amount
      } else if (input.transaction_type === 'Expense') {
        balanceAfter = currentBalance - input.amount
      } else if (input.transaction_type === 'Transfer') {
        if (!input.transfer_to_account_id) {
          throw new Error('Transfer requires transfer_to_account_id')
        }
        balanceAfter = currentBalance - input.amount

        // Update destination account balance
        const [destBalanceRows] = await connection.execute<RowDataPacket[]>(
          'SELECT current_balance FROM finance_accounts WHERE id = ? FOR UPDATE',
          [input.transfer_to_account_id]
        )
        if (!destBalanceRows || destBalanceRows.length === 0) {
          throw new Error('Destination account not found')
        }
        const destBalance = Number(destBalanceRows[0].current_balance)
        const destBalanceAfter = destBalance + input.amount

        await connection.execute(
          'UPDATE finance_accounts SET current_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [destBalanceAfter, input.transfer_to_account_id]
        )
      }

      // Insert transaction
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO finance_transactions 
         (transaction_type, account_id, transfer_to_account_id, category_id, amount, 
          balance_after, description, reference_number, transaction_date, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.transaction_type,
          input.account_id,
          input.transfer_to_account_id || null,
          input.category_id || null,
          input.amount,
          balanceAfter,
          input.description || null,
          input.reference_number || null,
          input.transaction_date,
          input.notes || null,
        ]
      )

      // Update source account balance
      await connection.execute(
        'UPDATE finance_accounts SET current_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [balanceAfter, input.account_id]
      )

      await connection.commit()

      const transaction = await this.findById(result.insertId)
      if (!transaction) throw new Error('Failed to retrieve created transaction')
      return transaction
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  async delete(id: number): Promise<boolean> {
    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Get transaction details
      const [txRows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM finance_transactions WHERE id = ?',
        [id]
      )
      if (!txRows || txRows.length === 0) {
        throw new Error('Transaction not found')
      }

      const tx = txRows[0] as Transaction

      // Recalculate balances by replaying all transactions after this one
      // This is complex, so for now we'll just prevent deletion
      // In production, you might want to implement a soft delete or balance recalculation
      throw new Error('Transaction deletion not supported. Use a reversal transaction instead.')

      // await connection.execute('DELETE FROM finance_transactions WHERE id = ?', [id])
      // await connection.commit()
      // return true
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }
}

