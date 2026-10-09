// Browser fixture, excluded from the production HTML entrypoint and build.
// No real sessions, API calls or persistent authentication are created here.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/auth/AuthContext";
import type { SemanticRole, User } from "@/types/auth";
import AppRouter from "@/app/AppRouter";
import { routePaths } from "@/app/routeManifest";
import "@/Index.css";
import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
// This legacy render harness must never contact the operational API.
onlineManager.setOnline(false);
const queryClient = new QueryClient();

function Harness() {
  const [role, setRole] = useState<SemanticRole | null>("PADRE");
  const [path, setPath] = useState("/padre");
  const user: User | null = role ? {
    id_usuario: 0, codigo_usuario: "fixture", nombres: "Prueba", apellidos: "Aislada",
    email: "test@example.invalid", rol: role, roles: [role], activo: true,
  } : null;
  return <>
    <div style={{ padding: 8, display: "flex", gap: 8, background: "#fff4cc", position: "relative", zIndex: 100 }}>
      <strong>Prueba aislada · sin backend</strong>
      <label>Rol <select aria-label="Rol de prueba" value={role || "PUBLIC"} onChange={e => setRole(e.target.value === "PUBLIC" ? null : e.target.value as SemanticRole)}>
        <option value="PUBLIC">Público</option><option>PADRE</option><option>TERAPEUTA</option><option>ADMIN</option>
      </select></label>
      <label>Ruta <select aria-label="Ruta de prueba" value={path} onChange={e => setPath(e.target.value)}>
        {routePaths.map(route => <option key={route}>{route}</option>)}
      </select></label>
    </div>
    <MemoryRouter key={`${path}:${role}`} initialEntries={[path]}>
      <AuthContext.Provider value={{ user, role, isAuthenticated: !!user, isLoading: false,
        login: async () => { throw new Error("El login real se comprueba fuera de este fixture"); },
        logout: async () => { setRole(null); }, refreshUser: async () => {},
      }}><QueryClientProvider client={queryClient}><AppRouter /></QueryClientProvider></AuthContext.Provider>
    </MemoryRouter>
  </>;
}
if (import.meta.env.DEV) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<Harness />);
  // This test entry must not retain an obsolete context after dependency edits.
  import.meta.hot?.dispose(() => root.unmount());
  import.meta.hot?.accept(() => window.location.reload());
}
