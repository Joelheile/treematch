import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

const SUPABASE_URL = "https://zlggajmzyjrwojzhidlo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZ2dham16eWpyd29qemhpZGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NDU5MTYsImV4cCI6MjA2NjIyMTkxNn0.HSRXxseFiCnX5VpM51NjJ18sMJ3XNNKCnq_8hV1e_dc";

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
} 