import React from 'react'
import EngineeringWikiDetailClient from './page-client'

export async function generateStaticParams() {
  return []
}

export default function EngineeringWikiDetailPage() {
  return <EngineeringWikiDetailClient />
}
