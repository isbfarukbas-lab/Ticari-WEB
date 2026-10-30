import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;

export const SUPABASE_URL =
  env?.VITE_SUPABASE_URL || 'https://gobojykoefxhlmeojjze.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY =
  env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_W25lryzcYp5pU2k_oS4ifw_ghSACHXP';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
