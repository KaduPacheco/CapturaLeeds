import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL ou Anon Key nao encontradas no .env");
}

// Singleton do Supabase para uso no CRM e autenticacao.
// A landing page continua usando fetch isolado para manter baixo bundle size no core.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function assertSupabaseConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
}
