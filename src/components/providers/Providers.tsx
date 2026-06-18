// src/components/providers/Providers.tsx
'use client'

import { ReactNode, useEffect, useState, Suspense } from 'react'
import { useAuthStore } from '@/lib/store/useAuthStore'

interface ProvidersProps {
  children: ReactNode
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { isLoading, initialize } = useAuthStore()

  useEffect(() => {
    setMounted(true)
    initialize()
  }, [initialize])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Suspense>
  )
}

export default Providers