// src/components/providers/Providers.tsx
'use client'

import { ReactNode, useEffect, useState } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hydration mismatch এড়ানোর জন্য
  if (!mounted) {
    return null
  }

  return <>{children}</>
}

export default Providers