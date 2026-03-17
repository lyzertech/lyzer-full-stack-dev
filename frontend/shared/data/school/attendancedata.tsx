export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Late'
  | 'Excused'
  | 'Half Day'

export interface Student {
  id: number
  studentId: string
  name: string
  class: string
  section: string
  avatar?: string
  email?: string
  phone?: string
}

export interface AttendanceRecord {
  id: number
  studentId: string
  studentName: string
  class: string
  section: string
  date: string
  status: AttendanceStatus
  checkInTime?: string
  checkOutTime?: string
  remarks?: string
  markedBy: string
  markedAt: string
}

export interface AttendanceStats {
  totalStudents: number
  present: number
  absent: number
  late: number
  excused: number
  halfDay: number
  attendanceRate: number
}

export interface ClassAttendance {
  class: string
  section: string
  date: string
  stats: AttendanceStats
  records: AttendanceRecord[]
}

// Mock Students Data
export const mockStudents: Student[] = [
  {
    id: 1,
    studentId: 'STU001',
    name: 'Ahmad Fauzi',
    class: '10',
    section: 'A',
    email: 'ahmad.fauzi@school.ac.id',
    phone: '+62 812-3456-7890',
  },
  {
    id: 2,
    studentId: 'STU002',
    name: 'Siti Rahmawati',
    class: '10',
    section: 'A',
    email: 'siti.rahmawati@school.ac.id',
    phone: '+62 812-3456-7891',
  },
  {
    id: 3,
    studentId: 'STU003',
    name: 'Budi Santoso',
    class: '10',
    section: 'A',
    email: 'budi.santoso@school.ac.id',
    phone: '+62 812-3456-7892',
  },
  {
    id: 4,
    studentId: 'STU004',
    name: 'Dewi Lestari',
    class: '10',
    section: 'B',
    email: 'dewi.lestari@school.ac.id',
    phone: '+62 812-3456-7893',
  },
  {
    id: 5,
    studentId: 'STU005',
    name: 'Rizky Pratama',
    class: '10',
    section: 'B',
    email: 'rizky.pratama@school.ac.id',
    phone: '+62 812-3456-7894',
  },
  {
    id: 6,
    studentId: 'STU006',
    name: 'Nina Wulandari',
    class: '11',
    section: 'A',
    email: 'nina.wulandari@school.ac.id',
    phone: '+62 812-3456-7895',
  },
  {
    id: 7,
    studentId: 'STU007',
    name: 'Agus Setiawan',
    class: '11',
    section: 'A',
    email: 'agus.setiawan@school.ac.id',
    phone: '+62 812-3456-7896',
  },
  {
    id: 8,
    studentId: 'STU008',
    name: 'Fitri Handayani',
    class: '11',
    section: 'B',
    email: 'fitri.handayani@school.ac.id',
    phone: '+62 812-3456-7897',
  },
  {
    id: 9,
    studentId: 'STU009',
    name: 'Dimas Saputra',
    class: '12',
    section: 'A',
    email: 'dimas.saputra@school.ac.id',
    phone: '+62 812-3456-7898',
  },
  {
    id: 10,
    studentId: 'STU010',
    name: 'Putri Maharani',
    class: '12',
    section: 'A',
    email: 'putri.maharani@school.ac.id',
    phone: '+62 812-3456-7899',
  },
]

// Mock Attendance Records
export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 1,
    studentId: 'STU001',
    studentName: 'Ahmad Fauzi',
    class: '10',
    section: 'A',
    date: '2024-01-15',
    status: 'Present',
    checkInTime: '07:30',
    checkOutTime: '14:00',
    markedBy: 'Admin',
    markedAt: '2024-01-15 07:35:00',
  },
  {
    id: 2,
    studentId: 'STU002',
    studentName: 'Siti Rahmawati',
    class: '10',
    section: 'A',
    date: '2024-01-15',
    status: 'Late',
    checkInTime: '08:15',
    checkOutTime: '14:00',
    remarks: 'Traffic jam',
    markedBy: 'Admin',
    markedAt: '2024-01-15 08:20:00',
  },
  {
    id: 3,
    studentId: 'STU003',
    studentName: 'Budi Santoso',
    class: '10',
    section: 'A',
    date: '2024-01-15',
    status: 'Absent',
    remarks: 'Sick',
    markedBy: 'Admin',
    markedAt: '2024-01-15 08:00:00',
  },
  {
    id: 4,
    studentId: 'STU004',
    studentName: 'Dewi Lestari',
    class: '10',
    section: 'B',
    date: '2024-01-15',
    status: 'Present',
    checkInTime: '07:25',
    checkOutTime: '14:00',
    markedBy: 'Admin',
    markedAt: '2024-01-15 07:30:00',
  },
  {
    id: 5,
    studentId: 'STU005',
    studentName: 'Rizky Pratama',
    class: '10',
    section: 'B',
    date: '2024-01-15',
    status: 'Excused',
    remarks: 'Family emergency',
    markedBy: 'Admin',
    markedAt: '2024-01-15 08:00:00',
  },
]

// Available Classes
export const availableClasses = ['10', '11', '12']
export const availableSections = ['A', 'B', 'C']

// Helper function to get students by class and section
export const getStudentsByClass = (
  classValue: string,
  section: string
): Student[] => {
  return mockStudents.filter(
    (s) => s.class === classValue && s.section === section
  )
}

// Helper function to calculate attendance stats
export const calculateStats = (
  records: AttendanceRecord[]
): AttendanceStats => {
  const total = records.length
  const present = records.filter((r) => r.status === 'Present').length
  const absent = records.filter((r) => r.status === 'Absent').length
  const late = records.filter((r) => r.status === 'Late').length
  const excused = records.filter((r) => r.status === 'Excused').length
  const halfDay = records.filter((r) => r.status === 'Half Day').length
  const attendanceRate = total > 0 ? (present / total) * 100 : 0

  return {
    totalStudents: total,
    present,
    absent,
    late,
    excused,
    halfDay,
    attendanceRate: Math.round(attendanceRate * 100) / 100,
  }
}
