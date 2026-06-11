import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are set
if (!supabaseUrl) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL is not set. Using placeholder for build.')
}

if (!supabaseAnonKey) {
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Using placeholder for build.')
}

// Validate URL format if provided
if (supabaseUrl) {
  try {
    new URL(supabaseUrl)
  } catch {
    console.error('Invalid Supabase URL format:', supabaseUrl)
  }
}

// For build time safety
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)