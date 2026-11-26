import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "@/modules/auth/application/AuthContext";
import type { User } from "@/modules/auth/domain/auth";
import { MundoAshaLaberinto } from "@/modules/padre/presentation/MundoAshaLaberinto";
import { renderRoute } from "./helpers";
import type { GameProgress } from "@/modules/mundo_asha/infrastructure/learningGames";

const mockProgressWithLanguage = (assigned: boolean): GameProgress => ({
  id_paciente: 1,
  version: "basica-1",
  experiencia: 50,
  nivel: 1,
  medallas: [],
  intentos_totales: 2,
  experiencia_siguiente_nivel: 200,
  mundos: [
    {
      id: "LENGUAJE",
      version: "basica-1",
      name: "La Isla de las Palabras",
      description: "Mundo de lenguaje",
      asignado: assigned,
      completados: [],
      intentos: 0,
      medalla: false,
      fonemas_recomendados: ["/rr/"],
      levels: [],
    },
  ],
});

const reply = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "X-Total-Count": "1" },
  });

const user: User = { id_usuario: 1, codigo_usuario: "test", nombres: "Usuario", apellidos: "Prueba", rol: "PADRE", roles: ["PADRE"], activo: true, email: "test@example.invalid" };

function Where() {
  const { pathname } = useLocation();
  return <p data-testid="where">{pathname}</p>;
}

// Monta solo la pantalla del laberinto con su guardia, para observar la ruta final.
function renderLaberinto() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={["/mundo-asha/laberinto"]}>
        <AuthContext.Provider value={{ user, role: "PADRE", isAuthenticated: true, isLoading: false, login: vi.fn(), logout: vi.fn(), refreshUser: vi.fn() }}>
          <Routes>
            <Route path="/mundo-asha/laberinto" element={<><Where /><MundoAshaLaberinto go={vi.fn()} /></>} />
            <Route path="/mundo-asha" element={<Where />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockApi(assigned: boolean) {
  vi.mocked(fetch).mockImplementation(async (input) => {
    const path = new URL(String(input), "http://localhost").pathname.replace("/api/v1", "");
    if (path === "/pacientes") {
      return reply([{ id_paciente: 1, nombres_paciente: "Mateo", apellidos_paciente: "Gómez", activo: true }]);
    }
    if (path === "/pacientes/1/juegos") return reply(mockProgressWithLanguage(assigned));
    return reply([]);
  });
}

describe("Mundo ASHA - rutas prototipo y laberinto protegido", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockApi(true);
  });

  const prototypeRoutes = ["/mundo-asha/cuentos", "/mundo-asha/canciones", "/mundo-asha/trabalenguas", "/mundo-asha/adivinanzas", "/mundo-asha/juegos", "/mundo-asha/academia"];

  it.each(prototypeRoutes)("%s no muestra la pantalla prototipo con datos simulados", async (route) => {
    renderRoute(route, "PADRE");
    expect(await screen.findByRole("heading", { name: "Próximamente" })).toBeInTheDocument();
    expect(screen.queryByText("Laberinto de Trabalenguas")).not.toBeInTheDocument();
    expect(screen.queryByText(/Módulo de demostración|ASHA-A3F1/)).not.toBeInTheDocument();
  });

  it("/mundo-asha/laberinto redirige a /mundo-asha si LENGUAJE no está asignado", async () => {
    mockApi(false);
    renderLaberinto();
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent(/^\/mundo-asha$/));
    expect(screen.queryByText("Laberinto de Trabalenguas")).not.toBeInTheDocument();
  });

  it("/mundo-asha/laberinto se muestra si LENGUAJE está asignado", async () => {
    renderLaberinto();
    expect(await screen.findByText("Laberinto de Trabalenguas")).toBeInTheDocument();
    expect(screen.getByTestId("where")).toHaveTextContent("/mundo-asha/laberinto");
  });
});
