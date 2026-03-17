// app/dashboards/jobs/jobs-list/page.tsx
import TeacherList from './TeacherList'

export default function TeacherListPage() {
  // This file is a Server Component by default (SSR)
  // It will SSR the initial HTML of TeacherList
  return <TeacherList />
}
