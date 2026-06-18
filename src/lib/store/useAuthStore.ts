// src/lib/store/useAuthStore.ts
import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'

// ✅ Profile ইন্টারফেস - সম্পূর্ণ টাইপ সেফ
interface Profile {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  role: 'patient' | 'doctor' | 'hospital' | 'admin' | null
  is_approved: boolean | null
  district: string | null
  upazila: string | null
  date_of_birth: string | null
  blood_group: string | null
  profile_image: string | null
  created_at?: string
  updated_at?: string
}

// ✅ AuthState ইন্টারফেস
interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isInitialized: boolean
  
  // Actions
  initialize: () => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (isLoading: boolean) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isInitialized: false,

  // ✅ initialize - অ্যাপ শুরু হলে auth স্টেট সেটআপ করে
  initialize: async () => {
    const { isInitialized } = get()
    if (isInitialized) return
    
    set({ isLoading: true })
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        set({ 
          user: session.user, 
          session: session,
          isAuthenticated: true 
        })
        
        // Fetch profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile && !error) {
          set({ profile: profile as Profile })
        }
      }
      
      set({ isInitialized: true })
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  // ✅ setUser - ইউজার সেট করে
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  // ✅ setSession - সেশন সেট করে
  setSession: (session) => set({ session }),
  
  // ✅ setProfile - প্রোফাইল সেট করে
  setProfile: (profile) => set({ profile }),
  
  // ✅ setLoading - লোডিং স্টেট সেট করে
  setLoading: (isLoading) => set({ isLoading }),

  // ✅ fetchProfile - ইউজার আইডি দিয়ে প্রোফাইল আনে
  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      set({ profile: data as Profile })
    } catch (error) {
      console.error('Error fetching profile:', error)
      set({ profile: null })
    }
  },

  // ✅ refreshProfile - বর্তমান ইউজারের প্রোফাইল রিফ্রেশ করে
  refreshProfile: async () => {
    const { user } = get()
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      set({ profile: data as Profile })
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  },

  // ✅ signOut - ইউজার লগআউট করে
  signOut: async () => {
    try {
      await supabase.auth.signOut()
      set({ 
        user: null, 
        session: null, 
        profile: null, 
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false
      })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  },
}))

// ============================================
// Auth State Listener (ক্লায়েন্ট সাইড)
// ============================================

if (typeof window !== 'undefined') {
  // Auth state change listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    const { setUser, setSession, setLoading, fetchProfile, setProfile } = useAuthStore.getState()
    
    setLoading(true)
    
    if (session?.user) {
      setUser(session.user)
      setSession(session)
      await fetchProfile(session.user.id)
    } else {
      setUser(null)
      setSession(null)
      setProfile(null)
    }
    
    setLoading(false)
  })

  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    const { setUser, setSession, setLoading, fetchProfile } = useAuthStore.getState()
    
    setLoading(true)
    
    if (session?.user) {
      setUser(session.user)
      setSession(session)
      fetchProfile(session.user.id)
    }
    
    setLoading(false)
  })
}

export default useAuthStore