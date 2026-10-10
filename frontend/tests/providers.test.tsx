import { it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppProviders } from "@/app/providers/AppProviders";
import AppRouter from "@/app/AppRouter";
import { authService } from "@/services/authService";
import type { SemanticRole, User } from "@/types/auth";
vi.mock("@/services/authService", () => ({ authService: {
  getCurrentUser: vi.fn(), login: vi.fn(), logout: vi.fn(),
} }));
beforeEach(() => vi.clearAllMocks());
it.each(["PADRE", "TERAPEUTA", "ADMIN"] as SemanticRole[])(
  "Providers restore %s on a direct URL (same bootstrap as reload)", async role => {
    const path = role === "PADRE" ? "/padre/config" : role === "TERAPEUTA" ? "/terapeuta/config" : "/admin/config";
    window.history.replaceState({}, "", path);
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      id_usuario: 1, codigo_usuario: "fixture", nombres: "Prueba", apellidos: "Local",
      email: "test@example.invalid", rol: role, roles: [role], activo: true,
    } as User);
    render(<AppProviders><AppRouter /></AppProviders>);
    expect(await screen.findByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
    expect(window.location.pathname).toBe(path);
  },
);
it("A failed real-provider login keeps the form mounted and shows its network error", async () => {
  window.history.replaceState({}, "", "/login");
  vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error("no session"));
  vi.mocked(authService.login).mockRejectedValue(new Error("Servidor no disponible"));
  render(<AppProviders><AppRouter /></AppProviders>);
  const button = await screen.findByRole("button", { name: "Iniciar sesión" });
  fireEvent.change(screen.getByLabelText("Código de usuario", { exact: true }), { target: { value: "fixture" } });
  fireEvent.change(screen.getByLabelText("Contraseña", { exact: true }), { target: { value: "test-only" } });
  fireEvent.click(button);
  expect(await screen.findByText("Servidor no disponible")).toBeInTheDocument();
  expect(button).toBeInTheDocument();
});
