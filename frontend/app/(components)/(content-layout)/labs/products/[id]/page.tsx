import React from 'react'
import ProductDetailClient from './page-client'

export async function generateStaticParams() {
  return []
}

export default function ProductDetailPage() {
  return <ProductDetailClient />
}
