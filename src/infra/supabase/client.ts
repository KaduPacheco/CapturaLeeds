import { createClient } from "@supabase/supabase-js";
import { logAppEvent } from "@/lib/appLogger";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logAppEvent("supabase", "error", "Supabase URL ou Anon Key nao encontradas no ambiente.");
}

// Singleton do Supabase para uso no CRM e autenticacao.
// A landing continua usando fetch isolado para manter baixo bundle size no core.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
