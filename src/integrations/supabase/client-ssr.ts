import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Client Config:', {
  hasUrl: !!SUPABASE_URL,
  hasKey: !!SUPABASE_ANON_KEY,
  urlPrefix: SUPABASE_URL?.substring(0, 20) + '...',
  keyPrefix: SUPABASE_ANON_KEY?.substring(0, 10) + '...'
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables:', {
    NEXT_PUBLIC_SUPABASE_URL: !!SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY
  });
  if (typeof window !== 'undefined') {
    console.error('Missing Supabase environment variables. Please check your .env.local file.');
  }
  throw new Error(
    'Missing Supabase environment variables. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const createClient = () => {
  if (!client) {
    client = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}; 