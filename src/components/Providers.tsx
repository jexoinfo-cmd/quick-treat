'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  const { setUser, setProfile, setLoading, setHydrated } = useAuthStore()

  // Move all logic inside useEffect
  useEffect(() => {
    // Define fetchProfile inside useEffect
    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    const initAuth = async () => {
      try {
        // Clear any stale session
        await supabase.auth.refreshSession()
        
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid session
        await supabase.auth.signOut()
      } finally {
        setLoading(false)
        setHydrated(true)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        const user = session?.user ?? null
        setUser(user)
        
        if (user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          await fetchProfile(user.id)
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setProfile, setLoading, setHydrated]) // No fetchProfile dependency needed

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}