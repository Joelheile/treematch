import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

const SUPABASE_URL = "https://zlggajmzyjrwojzhidlo.supabase.co";
const SUPABASE_ANON_KEY = "***REMOVED_SUPABASE_ANON_KEY***";

export const createClient = () => {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
} 