import { vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/auth/AuthContext";
import type { SemanticRole, User } from "@/types/auth";
import AppRouter from "@/app/AppRouter";

export function renderRoute(path: string, role: SemanticRole | null, loading = false) {
  const user: User | null = role ? { id_usuario: 1, codigo_usuario: "test", nombres: "Usuario", apellidos: "Prueba", rol: role, roles: [role], activo: true, email: "test@example.invalid" } : null;
  return render(<MemoryRouter initialEntries={[path]}>
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!role,
      isLoading: loading, login: vi.fn(), logout: vi.fn(), refreshUser: vi.fn(),
    }}><AppRouter /></AuthContext.Provider>
  </MemoryRouter>);
}
