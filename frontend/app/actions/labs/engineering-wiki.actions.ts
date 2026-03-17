'use server'

import {
  EngineeringWikiRepository,
  type CreateEngineeringWikiInput,
  type UpdateEngineeringWikiInput,
  type EngineeringWikiFilters,
} from '@/lib/labs/repositories/engineering-wiki.repository'

const wikiRepo = new EngineeringWikiRepository()

export async function getEngineeringWikis(filters?: EngineeringWikiFilters) {
  try {
    return await wikiRepo.findAll(filters)
  } catch (error) {
    console.error('Error fetching engineering wikis:', error)
    throw new Error('Failed to fetch engineering wikis')
  }
}

export async function getEngineeringWikiById(id: bigint) {
  try {
    return await wikiRepo.findById(id)
  } catch (error) {
    console.error('Error fetching engineering wiki:', error)
    throw new Error('Failed to fetch engineering wiki')
  }
}

export async function createEngineeringWiki(input: CreateEngineeringWikiInput) {
  try {
    if (!input.title || input.title.trim() === '') {
      throw new Error('Title is required')
    }
    return await wikiRepo.create(input)
  } catch (error: any) {
    console.error('Error creating engineering wiki:', error)
    throw new Error(error.message || 'Failed to create engineering wiki')
  }
}

export async function updateEngineeringWiki(input: UpdateEngineeringWikiInput) {
  try {
    if (!input.id) {
      throw new Error('Engineering wiki ID is required')
    }
    if (input.title !== undefined && input.title.trim() === '') {
      throw new Error('Title cannot be empty')
    }
    return await wikiRepo.update(input)
  } catch (error: any) {
    console.error('Error updating engineering wiki:', error)
    throw new Error(error.message || 'Failed to update engineering wiki')
  }
}

export async function deleteEngineeringWiki(id: bigint) {
  try {
    if (!id) {
      throw new Error('Engineering wiki ID is required')
    }
    return await wikiRepo.delete(id)
  } catch (error: any) {
    console.error('Error deleting engineering wiki:', error)
    throw new Error(error.message || 'Failed to delete engineering wiki')
  }
}

export async function getDistinctBrands() {
  try {
    return await wikiRepo.getDistinctBrands()
  } catch (error) {
    console.error('Error fetching distinct brands:', error)
    return []
  }
}

export async function getDistinctDeviceTypes() {
  try {
    return await wikiRepo.getDistinctDeviceTypes()
  } catch (error) {
    console.error('Error fetching distinct device types:', error)
    return []
  }
}

export async function getDistinctModels() {
  try {
    return await wikiRepo.getDistinctModels()
  } catch (error) {
    console.error('Error fetching distinct models:', error)
    return []
  }
}

export async function getDistinctFirmwareVersions() {
  try {
    return await wikiRepo.getDistinctFirmwareVersions()
  } catch (error) {
    console.error('Error fetching distinct firmware versions:', error)
    return []
  }
}

export async function getDistinctHardwareVersions() {
  try {
    return await wikiRepo.getDistinctHardwareVersions()
  } catch (error) {
    console.error('Error fetching distinct hardware versions:', error)
    return []
  }
}

