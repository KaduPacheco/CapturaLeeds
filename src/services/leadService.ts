import { getSupabasePublicEnv } from "@/infra/supabase/env";

// Este script isola a logica de comunicacao com o Supabase sem dependencia de SDKs pesados.

export interface LeadData {
  nome: string;
  email?: string;
  whatsapp: string;
  empresa?: string;
  funcionarios?: number;
}

export async function submitLeadToSupabase(lead: LeadData): Promise<boolean> {
  const supabaseEnv = getSupabasePublicEnv();

  const response = await fetch(supabaseEnv.intakeEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseEnv.anonKey,
      Authorization: `Bearer ${supabaseEnv.anonKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      ...lead,
      origem: "landing_page",
      status: "novo",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Supabase Error:", errorText);
    throw new Error(`Erro ao salvar lead (Status ${response.status})`);
  }

  if (supabaseEnv.n8nWebhookUrl) {
    try {
      const n8nResponse = await fetch(supabaseEnv.n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...lead,
          origem: "landing_page",
          status: "novo",
        }),
      });

      if (!n8nResponse.ok) {
        console.warn(`Webhook do n8n retornou erro: ${n8nResponse.status}`);
      }
    } catch (error) {
      console.warn("Erro ao enviar dados para o webhook do n8n:", error);
    }
  }

  return true;
}
