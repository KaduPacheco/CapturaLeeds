import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("../../features/crm/auth/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../features/crm/auth/hooks/useAuth";

describe("ProtectedRoute - Seguranca de Rota", () => {
  const mockedUseAuth = vi.mocked(useAuth);

  it("deve exibir o spinner quando estiver carregando a sessao", () => {
    mockedUseAuth.mockReturnValue(buildAuthMock({ loading: true }));

    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>,
    );

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("deve permitir acesso quando houver sessao ativa", () => {
    mockedUseAuth.mockReturnValue(
      buildAuthMock({
        session: { user: { id: "user-1" } } as never,
      }),
    );

    const { getByText } = render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Conteudo Privado</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(getByText("Conteudo Privado")).toBeInTheDocument();
  });

  it("deve redirecionar para login quando nao houver sessao", () => {
    mockedUseAuth.mockReturnValue(buildAuthMock());

    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Conteudo Privado</div>} />
          </Route>
          <Route path="/crm/login" element={<div>Pagina de Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(getByText("Pagina de Login")).toBeInTheDocument();
    expect(queryByText("Conteudo Privado")).not.toBeInTheDocument();
  });

  it("deve redirecionar quando a rota exigir permissao ausente", () => {
    mockedUseAuth.mockReturnValue(
      buildAuthMock({
        session: { user: { id: "user-1" } } as never,
        hasPermission: vi.fn(() => false),
      }),
    );

    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoute requiredPermission="crm:tasks:write" unauthorizedPath="/crm" />}>
            <Route path="/protected" element={<div>Conteudo Privado</div>} />
          </Route>
          <Route path="/crm" element={<div>Dashboard CRM</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(getByText("Dashboard CRM")).toBeInTheDocument();
    expect(queryByText("Conteudo Privado")).not.toBeInTheDocument();
  });
});

function buildAuthMock(overrides?: Partial<ReturnType<typeof useAuth>>) {
  return {
    session: null,
    user: null,
    access: {
      role: "anonymous" as const,
      permissions: [],
    },
    loading: false,
    authError: null,
    hasPermission: vi.fn(() => true),
    signOut: vi.fn(),
    ...overrides,
  };
}
