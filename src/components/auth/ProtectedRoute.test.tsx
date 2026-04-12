import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../contexts/AuthContext';

describe('ProtectedRoute - Seguranca de Rota', () => {
  const mockedUseAuth = vi.mocked(useAuth);

  it('deve exibir o Spinner quando estiver carregando a sessao', () => {
    mockedUseAuth.mockReturnValue({ session: null, loading: true, user: null, signOut: vi.fn() });

    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>,
    );

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it("deve permitir acesso ('Outlet') quando houver sessao ativa", async () => {
    mockedUseAuth.mockReturnValue({
      session: { user: {} } as never,
      loading: false,
      user: null,
      signOut: vi.fn(),
    });

    const { getByText } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Conteudo Privado</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(getByText('Conteudo Privado')).toBeInTheDocument();
  });

  it('deve redirecionar para login quando nao houver sessao', () => {
    mockedUseAuth.mockReturnValue({ session: null, loading: false, user: null, signOut: vi.fn() });

    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Conteudo Privado</div>} />
          </Route>
          <Route path="/crm/login" element={<div>Pagina de Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(getByText('Pagina de Login')).toBeInTheDocument();
    expect(queryByText('Conteudo Privado')).not.toBeInTheDocument();
  });
});
