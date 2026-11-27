import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '@/modules/auth/application/AuthContext';
import type { SemanticRole } from '@/modules/auth/domain/auth';
import { RouteAccess } from '@/core/router/RouteAccess';

it('permite un rol secundario y conserva el aislamiento de soporte', () => {
  const renderWithRoles = (roles: SemanticRole[], rol: 'ADMIN' | 'SOPORTE_TECNICO') => render(<MemoryRouter initialEntries={['/terapeuta']}><AuthContext.Provider value={{ user: { id_usuario:1, codigo_usuario:'u', nombres:'A', apellidos:'B', email:'a@example.invalid', activo:true, rol, roles }, role:rol, isAuthenticated:true, isLoading:false, login:vi.fn(), verify2fa:vi.fn(), logout:vi.fn(), refreshUser:vi.fn() }}><RouteAccess><span>Contenido permitido</span></RouteAccess></AuthContext.Provider></MemoryRouter>);
  const view = renderWithRoles(['ADMIN','TERAPEUTA'], 'ADMIN');
  expect(screen.getByText('Contenido permitido')).toBeInTheDocument();
  view.unmount();
  renderWithRoles(['SOPORTE_TECNICO','TERAPEUTA'], 'SOPORTE_TECNICO');
  expect(screen.getByText('Acceso restringido')).toBeInTheDocument();
});
