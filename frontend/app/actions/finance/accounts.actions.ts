'use server'

import {
  AccountsRepository,
  type CreateAccountInput,
  type UpdateAccountInput,
} from '@/lib/finance/repositories/accounts.repository'

const accountsRepo = new AccountsRepository()

export async function getAccounts(includeInactive = false) {
  try {
    return await accountsRepo.findAll(includeInactive)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    throw new Error('Failed to fetch accounts')
  }
}

export async function getAccountById(id: number) {
  try {
    return await accountsRepo.findById(id)
  } catch (error) {
    console.error('Error fetching account:', error)
    throw new Error('Failed to fetch account')
  }
}

export async function getAccountsByBankId(bankId: number) {
  try {
    return await accountsRepo.findByBankId(bankId)
  } catch (error) {
    console.error('Error fetching accounts by bank:', error)
    throw new Error('Failed to fetch accounts')
  }
}

export async function createAccount(input: CreateAccountInput) {
  try {
    if (!input.name || input.name.trim() === '') {
      throw new Error('Account name is required')
    }
    if (!input.bank_id) {
      throw new Error('Bank ID is required')
    }
    return await accountsRepo.create(input)
  } catch (error: any) {
    console.error('Error creating account:', error)
    throw new Error(error.message || 'Failed to create account')
  }
}

export async function updateAccount(input: UpdateAccountInput) {
  try {
    if (!input.id) {
      throw new Error('Account ID is required')
    }
    if (input.name !== undefined && input.name.trim() === '') {
      throw new Error('Account name cannot be empty')
    }
    return await accountsRepo.update(input)
  } catch (error: any) {
    console.error('Error updating account:', error)
    throw new Error(error.message || 'Failed to update account')
  }
}

export async function deleteAccount(id: number) {
  try {
    if (!id) {
      throw new Error('Account ID is required')
    }
    return await accountsRepo.delete(id)
  } catch (error: any) {
    console.error('Error deleting account:', error)
    throw new Error(error.message || 'Failed to delete account')
  }
}

