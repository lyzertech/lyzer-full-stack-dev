import React from 'react'
import EditEngineeringWikiClient from './page-client'

export async function generateStaticParams() {
  return []
}

export default function EditEngineeringWikiPage() {
  return <EditEngineeringWikiClient />
}
