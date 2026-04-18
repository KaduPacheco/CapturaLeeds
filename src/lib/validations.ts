import { z } from "zod";

/**
 * Esquema de validação para captura de leads da landing page.
 * Centralizado para permitir testes unitários isolados da UI.
 */
export const leadSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  whatsapp: z.string().trim().min(10, "WhatsApp inválido").max(20).regex(/^[\d\s()+-]+$/, "Formato inválido"),
  email: z.string().trim().email("E-mail inválido").max(255).optional().or(z.literal("")),
  empresa: z.string().trim().min(2, "Nome da empresa é obrigatório").max(100),
  employees: z.coerce.number().min(1, "Informe a quantidade de funcionários").int(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
