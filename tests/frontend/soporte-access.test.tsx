import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { RouteAccess } from '@/core/router/RouteAccess';
import { loginDestination, getRequiredRoleForPath } from '@/core/router/paths';
import { useAuth } from '@/modules/auth/application/useAuth';
import type { SemanticRole, User } from '@/modules/auth/domain/auth';
vi.mock('@/modules/auth/application/useAuth', () => ({ useAuth: vi.fn() }));
function auth(role: SemanticRole) {
  const user: User = { id_usuario: 4, codigo_usuario: 's00004', nombres: 'Agente', apellidos: 'Prueba', email: 'support@example.invalid', rol: role, roles: [role], activo: true };
  vi.mocked(useAuth).mockReturnValue({ user, role, isAuthenticated: true, isLoading: false, login: vi.fn(), logout: vi.fn(), refreshUser: vi.fn() });
}
beforeEach(() => { vi.resetAllMocks(); auth('SOPORTE_TECNICO'); });

it('redirects support to its own workspace and blocks direct administrative URLs', () => {
  expect(loginDestination('SOPORTE_TECNICO')).toBe('/soporte');
  expect(loginDestination('SOPORTE_TECNICO', { pathname: '/admin/cuentas' })).toBe('/soporte');
  expect(getRequiredRoleForPath('/soporte/incidencias/7')).toBe('SOPORTE_TECNICO');
  render(<MemoryRouter initialEntries={['/admin/cuentas']}><RouteAccess><p>Datos administrativos privados</p></RouteAccess></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument();
  expect(screen.queryByText('Datos administrativos privados')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Ir a mi panel principal' })).toHaveAttribute('href', '/soporte');
});

it.each(['ADMIN', 'TERAPEUTA', 'PADRE'] as SemanticRole[])('keeps %s in its own area and denies the support workspace', (role) => {
  auth(role);
  render(<MemoryRouter initialEntries={['/soporte']}><RouteAccess><p>Bandeja técnica</p></RouteAccess></MemoryRouter>);
  expect(screen.getByText('Acceso restringido')).toBeInTheDocument();
  expect(screen.queryByText('Bandeja técnica')).not.toBeInTheDocument();
  expect(loginDestination(role)).toBe(role === 'ADMIN' ? '/admin' : role === 'TERAPEUTA' ? '/terapeuta' : '/padre/welcome');
});
