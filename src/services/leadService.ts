// Este script isola a lógica de comunicação com o Supabase sem dependência de SDKs pesados.

const SUPABASE_URL = "https://uhnaiubhpoquraxttspi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobmFpdWJocG9xdXJheHR0c3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDc4NTAsImV4cCI6MjA5MDAyMzg1MH0.lcOM8-STaTnQBj_k70QFVTuHIlsu4MUFH04Q9uvz98w";

export interface LeadData {
  nome: string;
  email?: string;
  whatsapp: string;
  empresa?: string;
  funcionarios?: number;
}

export async function submitLeadToSupabase(lead: LeadData): Promise<boolean> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=minimal" // Retorna apenas os headers, não o body completo para economizar payload
    },
    body: JSON.stringify({
      ...lead,
      origem: "landing_page",
      status: "novo"
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Supabase Error:", errorText);
    throw new Error(`Erro ao salvar lead (Status ${response.status})`);
  }

  // Enviar para o n8n Webhook
  try {
    const n8nResponse = await fetch("https://n8n.forteia.com.br/webhook/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...lead,
        origem: "landing_page",
        status: "novo"
      })
    });

    if (!n8nResponse.ok) {
      console.warn(`Webhook do n8n retornou erro: ${n8nResponse.status}`);
    }
  } catch (error) {
    console.warn("Erro ao enviar dados para o webhook do n8n:", error);
    // Não lançamos o erro aqui para não quebrar o fluxo principal caso o n8n esteja fora do ar,
    // já que os dados principais já foram salvos no Supabase com sucesso.
  }

  return true;
}
