// /lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// ✅ Environment Variables চেক করুন
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ Runtime এ চেক করুন
if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export function createClient() {
  return createBrowserClient(
    supabaseUrl,      // ✅ এখন string টাইপ
    supabaseAnonKey,  // ✅ এখন string টাইপ
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  )
}

// পুরনো কোডের সাথে সামঞ্জস্যের জন্য
export const supabase = createClient()

export default supabase