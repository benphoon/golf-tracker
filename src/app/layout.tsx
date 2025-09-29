import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'ShotMate ⛳',
  description: 'Your perfect golf scoring companion for quick rounds',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <div className="container mx-auto px-4 py-6 max-w-md">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}