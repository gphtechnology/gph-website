import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * `null` until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set (see
 * .env.example). Guard with `isSupabaseConfigured` before using so the
 * site still works as a static landing page before the backend is wired up.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = supabase !== null;
