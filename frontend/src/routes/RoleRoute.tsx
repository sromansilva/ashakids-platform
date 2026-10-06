/**
 * Componente que restringe el acceso según el rol semántico del usuario (PADRE, TERAPEUTA, ADMIN).
 * Redirige a /login si no hay sesión, y muestra pantalla de acceso restringido si el rol no coincide.
 */

import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SemanticRole } from "@/types/auth";

interface RoleRouteProps {
  allowedRole: SemanticRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allowedRole,
  children,
  fallback,
}) => {
  const { role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAF9]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7C3AED] border-t-transparent" />
          <p className="text-sm font-semibold text-[#6B5E8A]">
            Verificando permisos de acceso...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role !== allowedRole) {
    const homePath = role === "ADMIN" ? "/admin" : role === "TERAPEUTA" ? "/terapeuta" : "/padre";
    return (
      fallback || (
        <div className="flex h-screen items-center justify-center p-6 text-center bg-[#FAFAF9]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
          <div className="max-w-md rounded-3xl border border-[#E8E5F4] bg-white p-8 shadow-sm">
            <span className="text-4xl">🚫</span>
            <h2 className="mt-3 text-xl font-black text-[#1C1135]">
              Acceso Restringido
            </h2>
            <p className="mt-2 text-sm font-semibold text-[#6B5E8A]">
              Tu rol actual ({role || "Sin sesión"}) no tiene autorización para acceder a la sección de {allowedRole}.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to={homePath}
                className="inline-flex items-center justify-center rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#6D28D9] transition-all"
              >
                Ir a mi panel principal
              </Link>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};
