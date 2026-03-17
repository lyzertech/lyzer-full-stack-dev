'use server'

import { BanksRepository, type CreateBankInput, type UpdateBankInput } from '@/lib/finance/repositories/banks.repository'

const banksRepo = new BanksRepository()

export async function getBanks(includeInactive = false) {
  try {
    return await banksRepo.findAll(includeInactive)
  } catch (error) {
    console.error('Error fetching banks:', error)
    throw new Error('Failed to fetch banks')
  }
}

export async function getBankById(id: number) {
  try {
    return await banksRepo.findById(id)
  } catch (error) {
    console.error('Error fetching bank:', error)
    throw new Error('Failed to fetch bank')
  }
}

export async function createBank(input: CreateBankInput) {
  try {
    if (!input.name || input.name.trim() === '') {
      throw new Error('Bank name is required')
    }
    return await banksRepo.create(input)
  } catch (error: any) {
    console.error('Error creating bank:', error)
    throw new Error(error.message || 'Failed to create bank')
  }
}

export async function updateBank(input: UpdateBankInput) {
  try {
    if (!input.id) {
      throw new Error('Bank ID is required')
    }
    if (input.name !== undefined && input.name.trim() === '') {
      throw new Error('Bank name cannot be empty')
    }
    return await banksRepo.update(input)
  } catch (error: any) {
    console.error('Error updating bank:', error)
    throw new Error(error.message || 'Failed to update bank')
  }
}

export async function deleteBank(id: number) {
  try {
    if (!id) {
      throw new Error('Bank ID is required')
    }
    return await banksRepo.delete(id)
  } catch (error: any) {
    console.error('Error deleting bank:', error)
    throw new Error(error.message || 'Failed to delete bank')
  }
}

