'use server'

import {
  EngineeringTaskRepository,
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskFilters,
  type CompleteTaskWithEvidenceInput,
} from '@/lib/labs/repositories/engineering-task.repository'

const taskRepo = new EngineeringTaskRepository()

// ============================================
// TASK CRUD ACTIONS
// ============================================

export async function getTasks(filters?: TaskFilters) {
  try {
    return await taskRepo.findAll(filters)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw new Error('Failed to fetch tasks')
  }
}

export async function getTaskById(id: bigint) {
  try {
    return await taskRepo.findById(id)
  } catch (error) {
    console.error('Error fetching task:', error)
    throw new Error('Failed to fetch task')
  }
}

export async function createTask(input: CreateTaskInput) {
  try {
    if (!input.title || input.title.trim() === '') {
      throw new Error('Title is required')
    }
    return await taskRepo.create(input)
  } catch (error: any) {
    console.error('Error creating task:', error)
    throw new Error(error.message || 'Failed to create task')
  }
}

export async function updateTask(input: UpdateTaskInput) {
  try {
    if (!input.id) {
      throw new Error('Task ID is required')
    }
    if (input.title !== undefined && input.title.trim() === '') {
      throw new Error('Title cannot be empty')
    }
    return await taskRepo.update(input)
  } catch (error: any) {
    console.error('Error updating task:', error)
    throw new Error(error.message || 'Failed to update task')
  }
}

export async function deleteTask(id: bigint) {
  try {
    if (!id) {
      throw new Error('Task ID is required')
    }
    return await taskRepo.delete(id)
  } catch (error: any) {
    console.error('Error deleting task:', error)
    throw new Error(error.message || 'Failed to delete task')
  }
}

// ============================================
// DASHBOARD ACTIONS
// ============================================

export async function getDashboardStats() {
  try {
    return await taskRepo.getDashboardStats()
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw new Error('Failed to fetch dashboard statistics')
  }
}

export async function getWeeklyProgress() {
  try {
    return await taskRepo.getWeeklyProgress()
  } catch (error) {
    console.error('Error fetching weekly progress:', error)
    return []
  }
}

export async function getMonthlyCalendar(year: number, month: number) {
  try {
    return await taskRepo.getMonthlyCalendar(year, month)
  } catch (error) {
    console.error('Error fetching monthly calendar:', error)
    return []
  }
}

// ============================================
// TASK LOG ACTIONS
// ============================================

export async function getTaskLogs(taskId: bigint) {
  try {
    return await taskRepo.getTaskLogs(taskId)
  } catch (error) {
    console.error('Error fetching task logs:', error)
    return []
  }
}

// ============================================
// COMPLETE TASK WITH EVIDENCE
// ============================================

export async function completeTaskWithEvidence(input: CompleteTaskWithEvidenceInput) {
  try {
    return await taskRepo.completeTaskWithEvidence(input)
  } catch (error: any) {
    console.error('Error completing task:', error)
    throw new Error(error.message || 'Failed to complete task')
  }
}

// ============================================
// PHOTO UPLOAD ACTION
// ============================================

export async function uploadTaskPhoto(formData: FormData) {
  try {
    const file = formData.get('photo') as File
    if (!file) {
      throw new Error('No photo file provided')
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.')
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit')
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const fileName = `task_${timestamp}_${randomString}.${extension}`

    // Save file to public directory
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fs = require('fs').promises
    const path = require('path')
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'engineering-tasks')

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true })

    // Write file
    const filePath = path.join(uploadDir, fileName)
    await fs.writeFile(filePath, buffer)

    // Return public URL
    const publicUrl = `/uploads/engineering-tasks/${fileName}`
    return { success: true, url: publicUrl }
  } catch (error: any) {
    console.error('Error uploading photo:', error)
    throw new Error(error.message || 'Failed to upload photo')
  }
}

// ============================================
// ASSET ACTIONS
// ============================================

export async function getAllAssets() {
  try {
    return await taskRepo.findAllAssets()
  } catch (error) {
    console.error('Error fetching assets:', error)
    return []
  }
}

export async function getAssetById(id: bigint) {
  try {
    return await taskRepo.findAssetById(id)
  } catch (error) {
    console.error('Error fetching asset:', error)
    return null
  }
}

// ============================================
// REPORT GENERATION ACTIONS
// ============================================

export async function generateTaskReport(filters: TaskFilters, format: 'pdf' | 'csv') {
  try {
    const tasks = await taskRepo.findAll(filters)

    if (format === 'csv') {
      // Generate CSV
      const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Assigned To', 'Due Date', 'Created At']
      const rows = tasks.map((task) => [
        task.id.toString(),
        task.title,
        task.category,
        task.priority,
        task.status,
        task.assigned_to?.toString() || '-',
        task.due_date?.toISOString().split('T')[0] || '-',
        task.created_at.toISOString().split('T')[0],
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n')

      return { success: true, data: csvContent, format: 'csv' }
    } else {
      // For PDF, we'll return data that client can use with jsPDF
      return { success: true, data: tasks, format: 'pdf' }
    }
  } catch (error: any) {
    console.error('Error generating report:', error)
    throw new Error(error.message || 'Failed to generate report')
  }
}

// ============================================
// DAILY RESET ACTION
// ============================================

export async function resetDailyTasks(userId: bigint) {
  try {
    const count = await taskRepo.resetDailyTasks(userId)
    return { success: true, count }
  } catch (error: any) {
    console.error('Error resetting daily tasks:', error)
    throw new Error(error.message || 'Failed to reset daily tasks')
  }
}
