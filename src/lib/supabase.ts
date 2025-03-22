import { createClient } from '@supabase/supabase-js';

// Create environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Export configuration status
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Missing Supabase environment variables');
}

// Create a single instance of the Supabase client
const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      storageKey: 'medical-report-app-auth',
      autoRefreshToken: true,
      detectSessionInUrl: false // Disable automatic OAuth detection to prevent duplicate clients
    }
  }
);

// Export only the singleton instance
export { supabase };