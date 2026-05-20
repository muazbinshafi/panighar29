// Custom supabase client with proper Database types
import { createClient } from '@supabase/supabase-js';
import type { Database } from './db-types';

const SUPABASE_URL = 'https://cfcyxhopqgtisggdcvnb.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmY3l4aG9wcWd0aXNnZ2Rjdm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNDAwNDEsImV4cCI6MjA5MTgxNjA0MX0.8ZTygKBW_0oPeqtVX4rYeA2CWR17YUd-T2eKOR4k3so';

const isServer = typeof globalThis.localStorage === 'undefined';

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: isServer ? undefined : globalThis.localStorage,
      persistSession: !isServer,
      autoRefreshToken: true,
    }
  }
);
