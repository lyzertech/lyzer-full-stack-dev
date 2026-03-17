export type DayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'

export interface PeriodDef {
  id: string
  label: string
  time: string
}

export interface TimetableCell {
  subject: string
  teacher: string
  room: string
}

export type TimetableState = {
  [grade: string]: {
    [room: string]: {
      [day in DayName]?: {
        [periodId: string]: TimetableCell
      }
    }
  }
}


