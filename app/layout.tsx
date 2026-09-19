import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/state/AuthContext'
import { CartProvider } from '@/state/CartContext'

export const metadata: Metadata = {
  title: 'GODID - God in Every Design',
  description: 'Premium Nigerian fashion brand',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
