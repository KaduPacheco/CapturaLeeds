import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submitLeadToSupabase } from '../leadService';

describe('leadService - Resiliencia e API', () => {
  const mockedFetch = vi.mocked(global.fetch);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const leadData = {
    nome: 'Teste Erro',
    whatsapp: '11999999999',
    empresa: 'Empresa Erro',
    funcionarios: 10,
  };

  it('deve lancar erro amigavel se o Supabase retornar status de falha', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Database connection failed'),
    } as Response);

    await expect(submitLeadToSupabase(leadData)).rejects.toThrow('Erro ao salvar lead (Status 500)');
  });

  it('deve retornar true mesmo se o n8n falhar (resiliencia)', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('OK'),
    } as Response);

    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const result = await submitLeadToSupabase(leadData);
    expect(result).toBe(true);
  });
});
