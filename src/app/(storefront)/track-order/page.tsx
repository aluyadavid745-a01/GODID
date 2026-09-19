'use client'
import { Suspense } from 'react'
import { OrderTrackingPage } from '@/views/storefront/OrderTrackingPage'
export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen px-4 py-12" />}>
      <OrderTrackingPage />
    </Suspense>
  )
}
