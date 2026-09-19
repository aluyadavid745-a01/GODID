'use client'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AccountLayout, AccountDashboard } from '@/pages/storefront/AccountPage'
export default function Page() {
  return (
    <ProtectedRoute role="customer">
      <AccountLayout>
        <AccountDashboard />
      </AccountLayout>
    </ProtectedRoute>
  )
}
