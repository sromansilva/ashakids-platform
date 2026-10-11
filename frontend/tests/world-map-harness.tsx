// DEV-only fixture. The browser verifier intercepts every API request.
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '@/auth/AuthContext';
import AppRouter from '@/app/AppRouter';
import '@/Index.css';

if (import.meta.env.DEV) {
  createRoot(document.getElementById('root')!).render(
    <AuthContext.Provider value={{ user: { id_usuario: 900, codigo_usuario: 'fixture', nombres: 'Familia', apellidos: 'Demo', email: 'fixture@example.invalid', rol: 'PADRE', roles: ['PADRE'], activo: true }, role: 'PADRE', isAuthenticated: true, isLoading: false, login: async () => { throw new Error('Sin login real'); }, logout: async () => {}, refreshUser: async () => {} }}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter initialEntries={['/mundo-asha']}><AppRouter/></MemoryRouter></QueryClientProvider>
    </AuthContext.Provider>,
  );
}
