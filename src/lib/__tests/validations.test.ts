import { describe, expect, it } from "vitest";
import { leadSchema } from "../validations";

describe("leadSchema - Validação de Cadastro", () => {
  const validData = {
    name: "Kadu Pacheco",
    whatsapp: "11999999999",
    email: "kadu@teste.com",
    empresa: "Minha Empresa",
    employees: 50,
  };

  it("deve validar dados corretos com sucesso", () => {
    const result = leadSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("deve falhar se o nome for muito curto", () => {
    const result = leadSchema.safeParse({ ...validData, name: "K" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Nome deve ter pelo menos 2 caracteres");
    }
  });

  it("deve falhar se o whatsapp for inválido", () => {
    const result = leadSchema.safeParse({ ...validData, whatsapp: "123" });
    expect(result.success).toBe(false);
  });

  it("deve aceitar e-mail vazio ou opcional", () => {
    const result = leadSchema.safeParse({ ...validData, email: "" });
    expect(result.success).toBe(true);
  });

  it("deve falhar se e-mail estiver mal formatado", () => {
    const result = leadSchema.safeParse({ ...validData, email: "invalido" });
    expect(result.success).toBe(false);
  });
});
