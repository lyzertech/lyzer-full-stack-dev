import { getPool } from '@/lib/db'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'

export type WikiCategory = 'issue' | 'update' | 'note'
export type WikiStatus = 'open' | 'monitoring' | 'solved' | 'closed'
export type WikiPriority = 'low' | 'medium' | 'high' | 'critical'

export interface EngineeringWiki {
  id: bigint
  title: string
  customer_name: string | null
  category: WikiCategory
  brand: string | null
  device_type: string | null
  model: string | null
  serial_number: string | null
  firmware_version: string | null
  hardware_version: string | null
  symptom: string | null
  symptom_file: string | null
  symptom_image: string | null
  root_cause: string | null
  root_cause_file: string | null
  root_cause_image: string | null
  solution: string | null
  solution_file: string | null
  solution_image: string | null
  action_taken: string | null
  action_taken_file: string | null
  action_taken_image: string | null
  status: WikiStatus
  priority: WikiPriority
  reference_doc: string | null
  created_at: Date
  updated_at: Date | null
}

export interface CreateEngineeringWikiInput {
  title: string
  customer_name?: string | null
  category?: WikiCategory
  brand?: string | null
  device_type?: string | null
  model?: string | null
  serial_number?: string | null
  firmware_version?: string | null
  hardware_version?: string | null
  symptom?: string | null
  symptom_file?: string | null
  symptom_image?: string | null
  root_cause?: string | null
  root_cause_file?: string | null
  root_cause_image?: string | null
  solution?: string | null
  solution_file?: string | null
  solution_image?: string | null
  action_taken?: string | null
  action_taken_file?: string | null
  action_taken_image?: string | null
  status?: WikiStatus
  priority?: WikiPriority
  reference_doc?: string | null
}

export interface UpdateEngineeringWikiInput extends Partial<CreateEngineeringWikiInput> {
  id: bigint
}

export interface EngineeringWikiFilters {
  category?: WikiCategory
  brand?: string
  device_type?: string
  status?: WikiStatus
  priority?: WikiPriority
}

export class EngineeringWikiRepository {
  async findAll(filters?: EngineeringWikiFilters): Promise<EngineeringWiki[]> {
    const pool = getPool()
    let query = 'SELECT * FROM engineering_wikis WHERE 1=1'
    const params: any[] = []

    if (filters?.category) {
      query += ' AND category = ?'
      params.push(filters.category)
    }
    if (filters?.brand) {
      query += ' AND brand = ?'
      params.push(filters.brand)
    }
    if (filters?.device_type) {
      query += ' AND device_type = ?'
      params.push(filters.device_type)
    }
    if (filters?.status) {
      query += ' AND status = ?'
      params.push(filters.status)
    }
    if (filters?.priority) {
      query += ' AND priority = ?'
      params.push(filters.priority)
    }

    query += ' ORDER BY created_at DESC'

    const [rows] = await pool.execute<RowDataPacket[]>(query, params)
    return rows as EngineeringWiki[]
  }

  async findById(id: bigint): Promise<EngineeringWiki | null> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM engineering_wikis WHERE id = ?',
      [id]
    )
    return (rows[0] as EngineeringWiki) || null
  }

  async create(input: CreateEngineeringWikiInput): Promise<EngineeringWiki> {
    const pool = getPool()
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO engineering_wikis 
       (title, customer_name, category, brand, device_type, model, serial_number,
        firmware_version, hardware_version, symptom, symptom_file, symptom_image,
        root_cause, root_cause_file, root_cause_image, solution, solution_file, solution_image,
        action_taken, action_taken_file, action_taken_image, status, priority, reference_doc) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.title,
        input.customer_name || null,
        input.category || 'note',
        input.brand || null,
        input.device_type || null,
        input.model || null,
        input.serial_number || null,
        input.firmware_version || null,
        input.hardware_version || null,
        input.symptom || null,
        input.symptom_file || null,
        input.symptom_image || null,
        input.root_cause || null,
        input.root_cause_file || null,
        input.root_cause_image || null,
        input.solution || null,
        input.solution_file || null,
        input.solution_image || null,
        input.action_taken || null,
        input.action_taken_file || null,
        input.action_taken_image || null,
        input.status || 'open',
        input.priority || 'medium',
        input.reference_doc || null,
      ]
    )

    const wiki = await this.findById(BigInt(result.insertId))
    if (!wiki) throw new Error('Failed to retrieve created engineering wiki')
    return wiki
  }

  async update(input: UpdateEngineeringWikiInput): Promise<EngineeringWiki> {
    const pool = getPool()
    const fields: string[] = []
    const values: any[] = []

    if (input.title !== undefined) {
      fields.push('title = ?')
      values.push(input.title)
    }
    if (input.customer_name !== undefined) {
      fields.push('customer_name = ?')
      values.push(input.customer_name)
    }
    if (input.category !== undefined) {
      fields.push('category = ?')
      values.push(input.category)
    }
    if (input.brand !== undefined) {
      fields.push('brand = ?')
      values.push(input.brand)
    }
    if (input.device_type !== undefined) {
      fields.push('device_type = ?')
      values.push(input.device_type)
    }
    if (input.model !== undefined) {
      fields.push('model = ?')
      values.push(input.model)
    }
    if (input.serial_number !== undefined) {
      fields.push('serial_number = ?')
      values.push(input.serial_number)
    }
    if (input.firmware_version !== undefined) {
      fields.push('firmware_version = ?')
      values.push(input.firmware_version)
    }
    if (input.hardware_version !== undefined) {
      fields.push('hardware_version = ?')
      values.push(input.hardware_version)
    }
    if (input.symptom !== undefined) {
      fields.push('symptom = ?')
      values.push(input.symptom)
    }
    if (input.symptom_file !== undefined) {
      fields.push('symptom_file = ?')
      values.push(input.symptom_file)
    }
    if (input.symptom_image !== undefined) {
      fields.push('symptom_image = ?')
      values.push(input.symptom_image)
    }
    if (input.root_cause !== undefined) {
      fields.push('root_cause = ?')
      values.push(input.root_cause)
    }
    if (input.root_cause_file !== undefined) {
      fields.push('root_cause_file = ?')
      values.push(input.root_cause_file)
    }
    if (input.root_cause_image !== undefined) {
      fields.push('root_cause_image = ?')
      values.push(input.root_cause_image)
    }
    if (input.solution !== undefined) {
      fields.push('solution = ?')
      values.push(input.solution)
    }
    if (input.solution_file !== undefined) {
      fields.push('solution_file = ?')
      values.push(input.solution_file)
    }
    if (input.solution_image !== undefined) {
      fields.push('solution_image = ?')
      values.push(input.solution_image)
    }
    if (input.action_taken !== undefined) {
      fields.push('action_taken = ?')
      values.push(input.action_taken)
    }
    if (input.action_taken_file !== undefined) {
      fields.push('action_taken_file = ?')
      values.push(input.action_taken_file)
    }
    if (input.action_taken_image !== undefined) {
      fields.push('action_taken_image = ?')
      values.push(input.action_taken_image)
    }
    if (input.status !== undefined) {
      fields.push('status = ?')
      values.push(input.status)
    }
    if (input.priority !== undefined) {
      fields.push('priority = ?')
      values.push(input.priority)
    }
    if (input.reference_doc !== undefined) {
      fields.push('reference_doc = ?')
      values.push(input.reference_doc)
    }

    if (fields.length === 0) {
      const wiki = await this.findById(input.id)
      if (!wiki) throw new Error('Engineering wiki not found')
      return wiki
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(input.id)

    await pool.execute(
      `UPDATE engineering_wikis SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    const wiki = await this.findById(input.id)
    if (!wiki) throw new Error('Engineering wiki not found')
    return wiki
  }

  async delete(id: bigint): Promise<boolean> {
    const pool = getPool()
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM engineering_wikis WHERE id = ?',
      [id]
    )
    return result.affectedRows > 0
  }

  async getDistinctBrands(): Promise<string[]> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT DISTINCT brand FROM engineering_wikis WHERE brand IS NOT NULL AND brand != "" ORDER BY brand ASC'
    )
    return rows.map((row) => row.brand as string)
  }

  async getDistinctDeviceTypes(): Promise<string[]> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT DISTINCT device_type FROM engineering_wikis WHERE device_type IS NOT NULL AND device_type != "" ORDER BY device_type ASC'
    )
    return rows.map((row) => row.device_type as string)
  }

  async getDistinctModels(): Promise<string[]> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT DISTINCT model FROM engineering_wikis WHERE model IS NOT NULL AND model != "" ORDER BY model ASC'
    )
    return rows.map((row) => row.model as string)
  }

  async getDistinctFirmwareVersions(): Promise<string[]> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT DISTINCT firmware_version FROM engineering_wikis WHERE firmware_version IS NOT NULL AND firmware_version != "" ORDER BY firmware_version ASC'
    )
    return rows.map((row) => row.firmware_version as string)
  }

  async getDistinctHardwareVersions(): Promise<string[]> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT DISTINCT hardware_version FROM engineering_wikis WHERE hardware_version IS NOT NULL AND hardware_version != "" ORDER BY hardware_version ASC'
    )
    return rows.map((row) => row.hardware_version as string)
  }
}

