import { getPool } from '@/lib/db'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'

// ============================================
// TYPE DEFINITIONS
// ============================================

export type TaskCategory = 'daily' | 'weekly' | 'monthly'
export type TaskPriority = 'low' | 'normal' | 'high' | 'emergency'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
export type TaskActionType = 'created' | 'updated' | 'completed' | 'comment' | 'status_change' | 'photo_upload' | 'gps_capture'
export type AssetType = 'machine' | 'tool' | 'equipment' | 'facility' | 'vehicle' | 'other'
export type AssetStatus = 'operational' | 'maintenance' | 'broken' | 'retired'

export interface EngineeringTask {
  id: bigint
  title: string
  description: string | null
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  assigned_to: bigint | null
  created_by: bigint | null
  asset_id: bigint | null
  due_date: Date | null
  recurrence_pattern: string | null
  parent_task_id: bigint | null
  tags: string | null
  requires_photo: boolean
  requires_gps: boolean
  estimated_duration_minutes: number | null
  actual_duration_minutes: number | null
  completed_at: Date | null
  created_at: Date
  updated_at: Date | null
}

export interface EngineeringTaskLog {
  id: bigint
  task_id: bigint
  user_id: bigint | null
  action_type: TaskActionType
  old_status: TaskStatus | null
  new_status: TaskStatus | null
  update_details: string | null
  comment: string | null
  photo_url: string | null
  location_tag: string | null
  location_address: string | null
  metadata: string | null
  created_at: Date
}

export interface EngineeringAsset {
  id: bigint
  name: string
  asset_code: string | null
  type: AssetType
  brand: string | null
  model: string | null
  serial_number: string | null
  location: string | null
  department: string | null
  status: AssetStatus
  description: string | null
  purchase_date: Date | null
  warranty_expiry: Date | null
  last_maintenance_date: Date | null
  next_maintenance_date: Date | null
  photo_url: string | null
  metadata: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date | null
}

export interface CreateTaskInput {
  title: string
  description?: string
  category: TaskCategory
  priority?: TaskPriority
  status?: TaskStatus
  assigned_to?: bigint
  created_by?: bigint
  asset_id?: bigint
  due_date?: Date
  recurrence_pattern?: string
  parent_task_id?: bigint
  tags?: string
  requires_photo?: boolean
  requires_gps?: boolean
  estimated_duration_minutes?: number
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: bigint
  actual_duration_minutes?: number
  completed_at?: Date
}

export interface TaskFilters {
  category?: TaskCategory
  status?: TaskStatus
  priority?: TaskPriority
  assigned_to?: bigint
  date_from?: Date
  date_to?: Date
}

export interface DashboardStats {
  unfinished_daily_tasks: number
  weekly_progress_percent: number
  monthly_completion_percent: number
  overdue_tasks: number
  total_completed_today: number
}

export interface WeeklyProgressData {
  week_start: Date
  total_tasks: number
  completed_tasks: number
  completion_rate: number
}

export interface MonthlyCalendarTask {
  date: Date
  task_count: number
  completed_count: number
  pending_count: number
  overdue_count: number
}

export interface CompleteTaskWithEvidenceInput {
  task_id: bigint
  user_id: bigint
  photo_url?: string
  location_tag?: string
  location_address?: string
  comment?: string
}

// ============================================
// REPOSITORY CLASS
// ============================================

export class EngineeringTaskRepository {
  // ============================================
  // TASK CRUD OPERATIONS
  // ============================================

  async findAll(filters?: TaskFilters): Promise<EngineeringTask[]> {
    const pool = getPool()
    let query = 'SELECT * FROM engineering_tasks WHERE 1=1'
    const params: any[] = []

    if (filters?.category) {
      query += ' AND category = ?'
      params.push(filters.category)
    }
    if (filters?.status) {
      query += ' AND status = ?'
      params.push(filters.status)
    }
    if (filters?.priority) {
      query += ' AND priority = ?'
      params.push(filters.priority)
    }
    if (filters?.assigned_to) {
      query += ' AND assigned_to = ?'
      params.push(filters.assigned_to)
    }
    if (filters?.date_from) {
      query += ' AND due_date >= ?'
      params.push(filters.date_from)
    }
    if (filters?.date_to) {
      query += ' AND due_date <= ?'
      params.push(filters.date_to)
    }

    query += ' ORDER BY due_date ASC, priority DESC, created_at DESC'

    const [rows] = await pool.execute<RowDataPacket[]>(query, params)
    return rows as EngineeringTask[]
  }

  async findById(id: bigint): Promise<EngineeringTask | null> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM engineering_tasks WHERE id = ?',
      [id]
    )
    return (rows[0] as EngineeringTask) || null
  }

  async create(input: CreateTaskInput): Promise<EngineeringTask> {
    const pool = getPool()
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO engineering_tasks 
       (title, description, category, priority, status, assigned_to, created_by, 
        asset_id, due_date, recurrence_pattern, parent_task_id, tags, 
        requires_photo, requires_gps, estimated_duration_minutes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.title,
        input.description || null,
        input.category,
        input.priority || 'normal',
        input.status || 'pending',
        input.assigned_to || null,
        input.created_by || null,
        input.asset_id || null,
        input.due_date || null,
        input.recurrence_pattern || null,
        input.parent_task_id || null,
        input.tags || null,
        input.requires_photo || false,
        input.requires_gps || false,
        input.estimated_duration_minutes || null,
      ]
    )

    const task = await this.findById(BigInt(result.insertId))
    if (!task) throw new Error('Failed to retrieve created task')
    return task
  }

  async update(input: UpdateTaskInput): Promise<EngineeringTask> {
    const pool = getPool()
    const fields: string[] = []
    const values: any[] = []

    if (input.title !== undefined) {
      fields.push('title = ?')
      values.push(input.title)
    }
    if (input.description !== undefined) {
      fields.push('description = ?')
      values.push(input.description)
    }
    if (input.category !== undefined) {
      fields.push('category = ?')
      values.push(input.category)
    }
    if (input.priority !== undefined) {
      fields.push('priority = ?')
      values.push(input.priority)
    }
    if (input.status !== undefined) {
      fields.push('status = ?')
      values.push(input.status)
    }
    if (input.assigned_to !== undefined) {
      fields.push('assigned_to = ?')
      values.push(input.assigned_to)
    }
    if (input.asset_id !== undefined) {
      fields.push('asset_id = ?')
      values.push(input.asset_id)
    }
    if (input.due_date !== undefined) {
      fields.push('due_date = ?')
      values.push(input.due_date)
    }
    if (input.tags !== undefined) {
      fields.push('tags = ?')
      values.push(input.tags)
    }
    if (input.actual_duration_minutes !== undefined) {
      fields.push('actual_duration_minutes = ?')
      values.push(input.actual_duration_minutes)
    }
    if (input.completed_at !== undefined) {
      fields.push('completed_at = ?')
      values.push(input.completed_at)
    }

    if (fields.length === 0) {
      const task = await this.findById(input.id)
      if (!task) throw new Error('Task not found')
      return task
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(input.id)

    await pool.execute(
      `UPDATE engineering_tasks SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    const task = await this.findById(input.id)
    if (!task) throw new Error('Task not found')
    return task
  }

  async delete(id: bigint): Promise<boolean> {
    const pool = getPool()
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM engineering_tasks WHERE id = ?',
      [id]
    )
    return result.affectedRows > 0
  }

  // ============================================
  // TASK LOG OPERATIONS
  // ============================================

  async createLog(log: Omit<EngineeringTaskLog, 'id' | 'created_at'>): Promise<void> {
    const pool = getPool()
    await pool.execute(
      `INSERT INTO engineering_task_logs 
       (task_id, user_id, action_type, old_status, new_status, 
        update_details, comment, photo_url, location_tag, location_address, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        log.task_id,
        log.user_id || null,
        log.action_type,
        log.old_status || null,
        log.new_status || null,
        log.update_details || null,
        log.comment || null,
        log.photo_url || null,
        log.location_tag || null,
        log.location_address || null,
        log.metadata || null,
      ]
    )
  }

  async getTaskLogs(taskId: bigint): Promise<EngineeringTaskLog[]> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM engineering_task_logs WHERE task_id = ? ORDER BY created_at DESC',
      [taskId]
    )
    return rows as EngineeringTaskLog[]
  }

  // ============================================
  // COMPLETE TASK WITH EVIDENCE
  // ============================================

  async completeTaskWithEvidence(input: CompleteTaskWithEvidenceInput): Promise<EngineeringTask> {
    const pool = getPool()
    
    // Get current task
    const task = await this.findById(input.task_id)
    if (!task) throw new Error('Task not found')

    // Validate photo requirement
    if (task.requires_photo && !input.photo_url) {
      throw new Error('Photo evidence is required to complete this task')
    }

    // Validate GPS requirement
    if (task.requires_gps && !input.location_tag) {
      throw new Error('GPS coordinates are required to complete this task')
    }

    // Update task status
    const updatedTask = await this.update({
      id: input.task_id,
      status: 'completed',
      completed_at: new Date(),
    })

    // Create audit log
    await this.createLog({
      task_id: input.task_id,
      user_id: input.user_id,
      action_type: 'completed',
      old_status: task.status,
      new_status: 'completed',
      comment: input.comment || null,
      photo_url: input.photo_url || null,
      location_tag: input.location_tag || null,
      location_address: input.location_address || null,
      update_details: 'Task completed with evidence',
      metadata: null,
    })

    return updatedTask
  }

  // ============================================
  // DASHBOARD STATISTICS
  // ============================================

  async getDashboardStats(): Promise<DashboardStats> {
    const pool = getPool()

    // Unfinished daily tasks
    const [dailyRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM engineering_tasks 
       WHERE category = 'daily' AND status != 'completed'`
    )
    const unfinished_daily_tasks = dailyRows[0].count

    // Weekly progress
    const [weeklyRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM engineering_tasks 
       WHERE category = 'weekly' 
       AND YEARWEEK(due_date, 1) = YEARWEEK(CURDATE(), 1)`
    )
    const weekly_total = weeklyRows[0].total || 1
    const weekly_completed = weeklyRows[0].completed || 0
    const weekly_progress_percent = Math.round((weekly_completed / weekly_total) * 100)

    // Monthly progress
    const [monthlyRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM engineering_tasks 
       WHERE category = 'monthly' 
       AND YEAR(due_date) = YEAR(CURDATE()) 
       AND MONTH(due_date) = MONTH(CURDATE())`
    )
    const monthly_total = monthlyRows[0].total || 1
    const monthly_completed = monthlyRows[0].completed || 0
    const monthly_completion_percent = Math.round((monthly_completed / monthly_total) * 100)

    // Overdue tasks
    const [overdueRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM engineering_tasks 
       WHERE status != 'completed' AND due_date < CURDATE()`
    )
    const overdue_tasks = overdueRows[0].count

    // Completed today
    const [todayRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM engineering_tasks 
       WHERE status = 'completed' AND DATE(completed_at) = CURDATE()`
    )
    const total_completed_today = todayRows[0].count

    return {
      unfinished_daily_tasks,
      weekly_progress_percent,
      monthly_completion_percent,
      overdue_tasks,
      total_completed_today,
    }
  }

  async getWeeklyProgress(): Promise<WeeklyProgressData[]> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        DATE_SUB(due_date, INTERVAL WEEKDAY(due_date) DAY) as week_start,
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        ROUND(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as completion_rate
       FROM engineering_tasks
       WHERE category = 'weekly'
       AND due_date >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
       GROUP BY week_start
       ORDER BY week_start ASC`
    )
    return rows as WeeklyProgressData[]
  }

  async getMonthlyCalendar(year: number, month: number): Promise<MonthlyCalendarTask[]> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        DATE(due_date) as date,
        COUNT(*) as task_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'pending' OR status = 'in_progress' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_count
       FROM engineering_tasks
       WHERE YEAR(due_date) = ? AND MONTH(due_date) = ?
       GROUP BY DATE(due_date)
       ORDER BY date ASC`,
      [year, month]
    )
    return rows as MonthlyCalendarTask[]
  }

  // ============================================
  // ASSET OPERATIONS
  // ============================================

  async findAllAssets(): Promise<EngineeringAsset[]> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM engineering_assets WHERE is_active = true ORDER BY name ASC'
    )
    return rows as EngineeringAsset[]
  }

  async findAssetById(id: bigint): Promise<EngineeringAsset | null> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM engineering_assets WHERE id = ?',
      [id]
    )
    return (rows[0] as EngineeringAsset) || null
  }

  // ============================================
  // DAILY TASK RESET
  // ============================================

  async resetDailyTasks(userId: bigint): Promise<number> {
    const pool = getPool()
    
    // Find all completed daily tasks
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM engineering_tasks 
       WHERE category = 'daily' AND status = 'completed'`
    )
    const tasks = rows as EngineeringTask[]

    let resetCount = 0

    for (const task of tasks) {
      // Create audit log before reset
      await this.createLog({
        task_id: task.id,
        user_id: userId,
        action_type: 'status_change',
        old_status: 'completed',
        new_status: 'pending',
        update_details: 'Daily task automatically reset',
        comment: null,
        photo_url: null,
        location_tag: null,
        location_address: null,
        metadata: JSON.stringify({ reset_date: new Date().toISOString() }),
      })

      // Reset task
      await pool.execute(
        `UPDATE engineering_tasks 
         SET status = 'pending', completed_at = NULL, actual_duration_minutes = NULL, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [task.id]
      )

      resetCount++
    }

    // Log reset operation
    await pool.execute(
      `INSERT INTO engineering_daily_task_resets 
       (reset_date, tasks_reset_count, status) 
       VALUES (CURDATE(), ?, 'success')`,
      [resetCount]
    )

    return resetCount
  }
}
