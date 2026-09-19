'use client'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AccountLayout, AccountOrders, WishlistPage, AddressesPage, AccountDashboard } from '@/pages/storefront/AccountPage'
import { useParams } from 'next/navigation'

function AccountContent() {
  const params = useParams()
  const slug = params?.slug
  const section = Array.isArray(slug) ? slug[0] : slug
  if (section === 'orders') return <AccountOrders />
  if (section === 'wishlist') return <WishlistPage />
  if (section === 'addresses') return <AddressesPage />
  return <AccountDashboard />
}

export default function Page() {
  return (
    <ProtectedRoute role="customer">
      <AccountLayout>
        <AccountContent />
      </AccountLayout>
    </ProtectedRoute>
  )
}
