import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// For build time safety
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing. Please check .env.local')
}

export const supabase = createClient(
  supabaseUrl || 'https://cqajbjwgunhroaiqmhiv.supabase.co',
  supabaseAnonKey || 'sb_publishable_CkFvI709Wb7Vv7F3t5m94w_uKWpIytj',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)