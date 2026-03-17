'use server'

import {
  TransactionsRepository,
  type CreateTransactionInput,
  type TransactionFilters,
} from '@/lib/finance/repositories/transactions.repository'

const transactionsRepo = new TransactionsRepository()

export async function getTransactions(filters?: TransactionFilters) {
  try {
    return await transactionsRepo.findAll(filters)
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    // Provide more detailed error message
    const errorMessage = error?.message || 'Failed to fetch transactions'
    throw new Error(errorMessage)
  }
}

export async function getTransactionById(id: number) {
  try {
    return await transactionsRepo.findById(id)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    throw new Error('Failed to fetch transaction')
  }
}

export async function createTransaction(input: CreateTransactionInput) {
  try {
    if (!input.account_id) {
      throw new Error('Account ID is required')
    }
    if (!input.amount || input.amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }
    if (!input.transaction_type) {
      throw new Error('Transaction type is required')
    }
    if (
      (input.transaction_type === 'Income' || input.transaction_type === 'Expense') &&
      !input.category_id
    ) {
      throw new Error('Category is required for Income/Expense transactions')
    }
    if (input.transaction_type === 'Transfer' && !input.transfer_to_account_id) {
      throw new Error('Destination account is required for Transfer transactions')
    }
    if (
      input.transaction_type === 'Transfer' &&
      input.account_id === input.transfer_to_account_id
    ) {
      throw new Error('Cannot transfer to the same account')
    }

    return await transactionsRepo.create(input)
  } catch (error: any) {
    console.error('Error creating transaction:', error)
    throw new Error(error.message || 'Failed to create transaction')
  }
}

export async function transferBetweenAccounts(
  fromAccountId: number,
  toAccountId: number,
  amount: number,
  description?: string,
  transactionDate?: Date | string
) {
  try {
    if (!fromAccountId || !toAccountId) {
      throw new Error('Both source and destination accounts are required')
    }
    if (fromAccountId === toAccountId) {
      throw new Error('Cannot transfer to the same account')
    }
    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    // Check source account balance
    const sourceBalance = await transactionsRepo.getAccountBalance(fromAccountId)
    if (sourceBalance < amount) {
      throw new Error('Insufficient balance in source account')
    }

    const input: CreateTransactionInput = {
      transaction_type: 'Transfer',
      account_id: fromAccountId,
      transfer_to_account_id: toAccountId,
      amount,
      description: description || `Transfer to account ${toAccountId}`,
      transaction_date: transactionDate || new Date(),
    }

    return await transactionsRepo.create(input)
  } catch (error: any) {
    console.error('Error transferring between accounts:', error)
    throw new Error(error.message || 'Failed to transfer between accounts')
  }
}

