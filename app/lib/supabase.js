import { createClient } from '@supabase/supabase-js'
let supabase = null
try {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (url && key && url.startsWith('https')) {
    supabase = createClient(url, key)
  }
} catch (e) {
  console.log("supabase init error", e)
}
export { supabase }
