export type Room = {
  id: number
  grade_id: number
  name: string
  capacity: number | null
  location?: string | null
  teacher_id?: number | null
  teacherId?: number | null
  teacherName?: string | null
}

export type Grade = {
  id: number
  name: string
  level: number
  description?: string | null
  status: string
  created_at?: string | null
  updated_at?: string | null
  rooms?: Room[]
}
