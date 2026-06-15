import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables. Please check your .env.local file.')
}

// Ensure URL is valid
let validUrl = supabaseUrl || 'https://cqajbjwgunhroaiqmhiv.supabase.co'
if (validUrl && !validUrl.startsWith('http')) {
  validUrl = 'https://' + validUrl
}

// Validate URL format
try {
  new URL(validUrl)
} catch {
  console.error('Invalid Supabase URL:', validUrl)
  validUrl = 'https://cqajbjwgunhroaiqmhiv.supabase.co'
}

export const supabase = createClient(
  validUrl,
  supabaseAnonKey || 'sb_publishable_CkFvI709Wb7Vv7F3t5m94w_uKWpIytj'
)