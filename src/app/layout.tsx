// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Suspense } from 'react'
import Providers from '@/components/providers/Providers'
import Image from 'next/image'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Quick Treat - Healthcare Platform',
  description: 'Your trusted healthcare management platform',
  metadataBase: new URL('https://quick-treat.vercel.app'),
  openGraph: {
    title: 'Quick Treat - Healthcare Platform',
    description: 'Your trusted healthcare management platform',
    url: 'https://quick-treat.vercel.app',
    siteName: 'Quick Treat',
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/assets/icons/logo.png',
    apple: '/assets/icons/logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous" 
        />
        <link rel="dns-prefetch" href="https://cqajbjwgunhroaiqmhiv.supabase.co" />
        <link rel="icon" href="/assets/icons/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/icons/logo.png" />
      </head>
      <body className="font-sans antialiased bg-background text-text-dark">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }>
          <Providers>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '8px',
                },
              }}
            />
          </Providers>
        </Suspense>
      </body>
    </html>
  )
}