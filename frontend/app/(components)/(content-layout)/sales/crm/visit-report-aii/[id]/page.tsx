import React from 'react'
import VisitReportDetailClient from './page-client'

export async function generateStaticParams() {
  return []
}

export default function VisitReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <VisitReportDetailClient params={params} />
}
