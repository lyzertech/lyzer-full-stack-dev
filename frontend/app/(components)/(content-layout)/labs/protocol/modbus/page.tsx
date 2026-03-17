// app/dashboards/jobs/jobs-list/page.tsx
import ModbusList from './ModbusList'

export default function ModbusListPage() {
  // This file is a Server Component by default (SSR)
  // It will SSR the initial HTML of ModbusList
  return <ModbusList />
}
