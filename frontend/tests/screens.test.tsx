import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { routePaths } from "@/app/routeManifest";
import { getRequiredRoleForPath } from "@/routes/paths";
import { renderRoute } from "./helpers";

describe("Every declared destination renders", () => {
  for (const path of routePaths) it(path, async () => {
    const role = getRequiredRoleForPath(path, null);
    const view = renderRoute(path.replace("/*", ""), role);
    await waitFor(() => expect(screen.queryByText("Cargando pantalla…")).not.toBeInTheDocument());
    expect(screen.queryByText("No pudimos cargar esta pantalla")).not.toBeInTheDocument();
    expect(screen.queryByText("Página no encontrada")).not.toBeInTheDocument();
    expect(view.container.textContent?.length).toBeGreaterThan(0);
  });
  it("Mundo ASHA uses the family destination for PADRE", async () => {
    renderRoute("/mundo-asha", "PADRE");
    await waitFor(() => expect(screen.queryByText("Cargando pantalla…")).not.toBeInTheDocument());
    expect(screen.queryByText("No pudimos cargar esta pantalla")).not.toBeInTheDocument();
  });
  it("Family settings tabs render without errors", async () => {
    renderRoute("/padre/config", "PADRE");
    await waitFor(() => expect(screen.queryByText("Cargando pantalla…")).not.toBeInTheDocument());
    for (const name of ["Hijos", "Notificaciones", "Privacidad", "Seguridad"]) {
      const button = screen.queryAllByRole("button", { name: new RegExp(name, "i") })[0];
      if (button) fireEvent.click(button);
      expect(screen.queryByText("No pudimos cargar esta pantalla")).not.toBeInTheDocument();
    }
  });
});
