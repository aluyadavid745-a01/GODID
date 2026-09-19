'use client'
import { StorefrontLayout } from '@/layouts/StorefrontLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <StorefrontLayout>{children}</StorefrontLayout>
}
