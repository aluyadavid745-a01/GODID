'use client'
import { Suspense } from 'react'
import { CheckoutPage } from '@/views/storefront/CheckoutPage'
export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen px-4 py-12" />}>
      <CheckoutPage />
    </Suspense>
  )
}
