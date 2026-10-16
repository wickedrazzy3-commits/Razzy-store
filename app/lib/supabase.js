import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qbvpzrctrqicvibupvww.supabase.co'
const supabaseAnonKey = 'sb_publishable_vbePS3bXMsBscQTDpxMMVA_8z2TiJWK'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
