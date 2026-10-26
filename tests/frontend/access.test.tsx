import { it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderRoute } from "./helpers";
it("Waits for the session before rendering a protected view", () => {
  renderRoute("/admin", null, true);
  expect(screen.getByRole("status")).toHaveTextContent("Verificando sesión");
});
it("Unauthenticated users are sent to login", async () => {
  renderRoute("/padre", null);
  expect(await screen.findByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
});
it("Role mismatch does not mount the protected screen", () => {
  renderRoute("/admin", "PADRE");
  expect(screen.getByText("Acceso restringido")).toBeInTheDocument();
});
it("Authenticated users entering login go to their own dashboard", async () => {
  renderRoute("/login", "ADMIN");
  await waitFor(() => expect(screen.queryByText("Cargando pantalla…")).not.toBeInTheDocument());
  expect(screen.queryByRole("button", { name: "Iniciar sesión" })).not.toBeInTheDocument();
  expect(screen.queryByText("No pudimos cargar esta pantalla")).not.toBeInTheDocument();
});
it("Unknown routes render 404 instead of a family dashboard", async () => {
  renderRoute("/no-existe", null);
  expect(await screen.findByText("Página no encontrada")).toBeInTheDocument();
});
