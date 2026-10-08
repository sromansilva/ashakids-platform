import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getRequiredRoleForPath } from "@/routes/paths";
import { RouteLoading } from "@/app/RouteLoading";

export function RouteAccess({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { role, isAuthenticated, isLoading } = useAuth();
  const required = getRequiredRoleForPath(location.pathname, role);
  const home = role === "ADMIN" ? "/admin" : role === "TERAPEUTA" ? "/terapeuta" : "/padre";
  if (isLoading && (required || location.pathname === "/login" || location.pathname === "/mundo-asha")) {
    return <RouteLoading label="Verificando sesión segura…" />;
  }
  if (required && !isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (required && required !== role) return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="max-w-md rounded-3xl border p-8 text-center bg-white">
        <h1 className="text-xl font-black">Acceso restringido</h1>
        <p className="my-4">Tu rol no tiene autorización para acceder a esta sección.</p>
        <a href={home} className="text-violet-700 font-bold">Ir a mi panel principal</a>
      </section>
    </main>
  );
  if (location.pathname === "/login" && isAuthenticated) return <Navigate to={home} replace />;
  return <>{children}</>;
}
