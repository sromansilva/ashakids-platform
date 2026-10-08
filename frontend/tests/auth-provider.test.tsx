import { it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/auth/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import type { User } from "@/types/auth";
vi.mock("@/services/authService", () => ({ authService: { getCurrentUser: vi.fn(), login: vi.fn(), logout: vi.fn() } }));
const user: User = { id_usuario: 1, codigo_usuario: "test", nombres: "Prueba", apellidos: "Local", email: "test@example.invalid", rol: "PADRE", roles: ["PADRE"], activo: true };
function Probe() {
  const auth = useAuth();
  return <><span>{auth.isLoading ? "loading" : auth.role || "anonymous"}</span>
    <button onClick={() => auth.login({ codigo_usuario: "test", password: "test-only" })}>login</button>
    <button onClick={auth.logout}>logout</button></>;
}
beforeEach(() => vi.clearAllMocks());
it("Bootstrap restores a server session", async () => {
  vi.mocked(authService.getCurrentUser).mockResolvedValue(user);
  render(<AuthProvider><Probe /></AuthProvider>);
  expect(await screen.findByText("PADRE")).toBeInTheDocument();
});
it("Network failure does not invent an authenticated session", async () => {
  vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error("offline"));
  render(<AuthProvider><Probe /></AuthProvider>);
  expect(await screen.findByText("anonymous")).toBeInTheDocument();
});
it("Login, expiration and logout update the session", async () => {
  vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error("unauthorized"));
  vi.mocked(authService.login).mockResolvedValue({ user, message: "ok" });
  vi.mocked(authService.logout).mockResolvedValue({ message: "ok", success: true });
  render(<AuthProvider><Probe /></AuthProvider>);
  await screen.findByText("anonymous");
  fireEvent.click(screen.getByText("login")); await screen.findByText("PADRE");
  fireEvent(window, new Event("ashakids:session-expired")); await screen.findByText("anonymous");
  fireEvent.click(screen.getByText("login")); await screen.findByText("PADRE");
  fireEvent.click(screen.getByText("logout")); await screen.findByText("anonymous");
  expect(authService.logout).toHaveBeenCalledOnce();
});
