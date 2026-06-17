// /lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ✅ Environment Variables চেক করুন
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ Runtime এ চেক করুন (ঐচ্ছিক কিন্তু ভালো)
if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    supabaseUrl,      // ✅ এখন string টাইপ
    supabaseAnonKey,  // ✅ এখন string টাইপ
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean }) {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // Server Component থেকে set কল করা হলে এই এরর ইগনোর করুন
          }
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch {
            // Server Component থেকে remove কল করা হলে এই এরর ইগনোর করুন
          }
        },
      },
    }
  )
}

export default createClient