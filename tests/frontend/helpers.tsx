import { vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/modules/auth/application/AuthContext";
import type { SemanticRole, User } from "@/modules/auth/domain/auth";
import AppRouter from "@/core/router/AppRouter";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

export function renderRoute(path: string, role: SemanticRole | null, loading = false, userId = 1,
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  const user: User | null = role ? { id_usuario: userId, codigo_usuario: "test", nombres: "Usuario", apellidos: "Prueba", rol: role, roles: [role], activo: true, email: "test@example.invalid" } : null;
  return render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={[path]}>
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!role,
      isLoading: loading, login: vi.fn(), logout: vi.fn(), refreshUser: vi.fn(),
    }}><AppRouter /></AuthContext.Provider>
  </MemoryRouter></QueryClientProvider>);
}
