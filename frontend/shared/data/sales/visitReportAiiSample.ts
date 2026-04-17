export type VisitReportStatus =
  | 'Completed'
  | 'Checked'
  | 'Reviewed'
  | 'Submitted'
  | 'Planned'
  | 'Cancelled'

export type ProspekLabel = 'Yes' | 'No' | 'Unknown'

export type VisitReportAiiRow = {
  id: number
  idVisitReport: string
  sales: string
  company: string
  contactPerson: string
  meetingPoint: string
  visitDateTime: string
  purpose: string
  followUpDate: string | null
  status: VisitReportStatus
  prospek: ProspekLabel
}

export type SalesTeamMember = {
  name: string
  initials: string
  visitCount: number
  colorClass: string
}

const salesCycle = ['David', 'Vicha', 'Heri Go', 'Dika'] as const

const companyPool: { company: string; contact: string }[] = [
  { company: 'Schneider Electric Indonesia, PT', contact: 'Alam Wiguna' },
  { company: 'Yokogawa Indonesia, PT', contact: 'Joko Susanto' },
  { company: 'Enindo Orbitama, PT', contact: 'Ardian Asril' },
  { company: 'Intimuara Electrindo, PT', contact: 'Rifan' },
  { company: 'Enercon Indonesia, PT', contact: 'Oki' },
  { company: 'ABB Sakti Industri, PT', contact: 'Ari Wibowo' },
  { company: 'Siemens Indonesia, PT', contact: 'Budi Hartono' },
  { company: 'Honeywell Indonesia, PT', contact: 'Sari Wulandari' },
]

const meetingPoints = [
  'Office',
  'Office - Dika',
  'Office - Pak Heri',
  'Office - Pak Bambang',
  'Customer site',
  'Online meeting',
]

const purposes = [
  'Follow up Project',
  'Appointment Meeting',
  'Follow up projects',
  'Product demo',
  'Technical discussion',
  'Contract review',
]

function statusForIndex(i: number): VisitReportStatus {
  if (i < 352) return 'Completed'
  if (i === 352) return 'Checked'
  if (i < 358) return 'Planned'
  return 'Cancelled'
}

function prospekForIndex(i: number): ProspekLabel {
  if (i === 352) return 'Yes'
  if (i % 7 === 0) return 'Yes'
  if (i % 11 === 0) return 'No'
  return 'Unknown'
}

function padVisitId(n: number): string {
  return `VR-AII-${String(n).padStart(6, '0')}`
}

/** Deterministic sample data (374 rows) with reference status mix */
export const visitReportAiiSeed: VisitReportAiiRow[] = Array.from(
  { length: 374 },
  (_, i) => {
    const pool = companyPool[i % companyPool.length]
    const day = 1 + (i % 28)
    const month = 1 + (i % 12)
    const hour = 9 + (i % 8)
    const minute = i % 2 === 0 ? 0 : 30
    const sales = salesCycle[i % salesCycle.length]

    return {
      id: i + 1,
      idVisitReport: padVisitId(i + 1),
      sales,
      company: pool.company,
      contactPerson: pool.contact,
      meetingPoint: meetingPoints[i % meetingPoints.length],
      visitDateTime: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`,
      purpose: purposes[i % purposes.length],
      followUpDate:
        i % 4 === 0
          ? `2026-${String((month % 12) + 1).padStart(2, '0')}-20`
          : null,
      status: statusForIndex(i),
      prospek: prospekForIndex(i),
    }
  },
)

export function aggregateStatusCounts(rows: VisitReportAiiRow[]) {
  const init: Record<VisitReportStatus, number> = {
    Completed: 0,
    Checked: 0,
    Reviewed: 0,
    Submitted: 0,
    Planned: 0,
    Cancelled: 0,
  }
  for (const r of rows) init[r.status]++
  return init
}

export function salesTeamFromRows(rows: VisitReportAiiRow[]): SalesTeamMember[] {
  const map = new Map<string, number>()
  for (const r of rows) {
    map.set(r.sales, (map.get(r.sales) ?? 0) + 1)
  }

  const colorByName: Record<string, string> = {
    David: 'primary',
    Vicha: 'success',
    'Heri Go': 'warning',
    Dika: 'info',
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, visitCount]) => ({
      name,
      initials: name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      visitCount,
      colorClass: colorByName[name] ?? 'secondary',
    }))
}

export function prospekYesPercent(rows: VisitReportAiiRow[]): string {
  if (rows.length === 0) return '0.00'
  const yes = rows.filter((r) => r.prospek === 'Yes').length
  return ((yes / rows.length) * 100).toFixed(2)
}
